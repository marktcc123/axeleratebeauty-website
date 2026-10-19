import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

function sql(name: string) {
  return readFileSync(path.join(root, name), "utf8").replace(
    /create extension if not exists ["']pgcrypto["'];/gi,
    "-- pgcrypto is not bundled in PGlite; gen_random_uuid() is provided by core Postgres.",
  );
}

describe("RPC hardening on a temporary database", () => {
  let db: PGlite;
  let orgId: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    db = new PGlite();
    await db.exec(sql("supabase/test/bootstrap.sql"));
    await db.exec(sql("supabase/schema.sql"));
    await db.exec(sql("supabase/migrations/20261019_phase1_security.sql"));
    await db.exec(sql("supabase/migrations/20261019_phase1_rpc_hardening.sql"));

    const org = await db.query<{ id: string }>(`
      insert into public.organizations (name, commercial_model, price_tier)
      values ('Internal RPC Fixture', 'wholesale', 1)
      returning id
    `);
    orgId = org.rows[0].id;
    const product = await db.query<{ id: string }>(`
      insert into public.products (sku, slug, name, publication_status, inventory_status, available_quantity)
      values ('STG-RPC-STOCK', 'stg-rpc-stock', 'Limited stock fixture', 'active', 'in_stock', 1)
      returning id
    `);
    productId = product.rows[0].id;
    const order = await db.query<{ id: string }>(`
      insert into public.orders (
        order_number, organization_id, subtotal_cents, total_cents, currency,
        stripe_checkout_session_id, stripe_payment_intent_id
      ) values (
        'DB-RPC-1', '${orgId}', 1200, 1200, 'USD', 'cs_rpc_1', 'pi_rpc_1'
      )
      returning id
    `);
    orderId = order.rows[0].id;
  }, 30000);

  afterAll(async () => {
    await db?.close();
  });

  it("does not leave a movement when a tracked decrement fails", async () => {
    const failed = await db.query<{ apply_inventory_decrement: boolean }>(
      `select public.apply_inventory_decrement('${orderId}', '${productId}', 2)`,
    );
    expect(failed.rows[0].apply_inventory_decrement).toBe(false);

    const leftover = await db.query<{ count: number }>(`
      select count(*)::int as count
      from public.inventory_movements
      where order_id = '${orderId}' and product_id = '${productId}'
    `);
    expect(leftover.rows[0].count).toBe(0);

    const stock = await db.query<{ available_quantity: number }>(
      `select available_quantity from public.products where id = '${productId}'`,
    );
    expect(stock.rows[0].available_quantity).toBe(1);

    const ok = await db.query<{ apply_inventory_decrement: boolean }>(
      `select public.apply_inventory_decrement('${orderId}', '${productId}', 1)`,
    );
    expect(ok.rows[0].apply_inventory_decrement).toBe(true);
    const replay = await db.query<{ apply_inventory_decrement: boolean }>(
      `select public.apply_inventory_decrement('${orderId}', '${productId}', 1)`,
    );
    expect(replay.rows[0].apply_inventory_decrement).toBe(true);
    const after = await db.query<{ available_quantity: number; inventory_status: string }>(
      `select available_quantity, inventory_status from public.products where id = '${productId}'`,
    );
    expect(after.rows[0].available_quantity).toBe(0);
    expect(after.rows[0].inventory_status).toBe("out_of_stock");
  });

  it("does not restore paid over a later refund state when a paid event is replayed", async () => {
    await db.exec(`select public.mark_order_paid('cs_rpc_1', 'pi_rpc_1', 'usd', 0, 0, 1200, '{}'::jsonb)`);
    await db.exec(`select public.apply_refund('re_rpc_1', 'pi_rpc_1', 400, 'usd', 'succeeded')`);

    const partial = await db.query<{ payment_status: string; status: string; refunded_cents: number }>(
      `select payment_status, status, refunded_cents from public.orders where id = '${orderId}'`,
    );
    expect(partial.rows[0].payment_status).toBe("partially_refunded");
    expect(partial.rows[0].refunded_cents).toBe(400);

    await db.exec(`select public.mark_order_paid('cs_rpc_1', 'pi_rpc_1', 'usd', 0, 0, 1200, '{}'::jsonb)`);
    const afterReplay = await db.query<{ payment_status: string; refunded_cents: number }>(
      `select payment_status, refunded_cents from public.orders where id = '${orderId}'`,
    );
    expect(afterReplay.rows[0].payment_status).toBe("partially_refunded");
    expect(afterReplay.rows[0].refunded_cents).toBe(400);

    await db.exec(`select public.apply_refund('re_rpc_2', 'pi_rpc_1', 800, 'usd', 'succeeded')`);
    await db.exec(`select public.mark_order_paid('cs_rpc_1', 'pi_rpc_1', 'usd', 0, 0, 1200, '{}'::jsonb)`);
    const full = await db.query<{ payment_status: string; status: string }>(
      `select payment_status, status from public.orders where id = '${orderId}'`,
    );
    expect(full.rows[0].payment_status).toBe("refunded");
    expect(full.rows[0].status).toBe("refunded");
  });

  it("keeps terminal refund statuses ahead of a late pending event", async () => {
    const second = await db.query<{ id: string }>(`
      insert into public.orders (
        order_number, organization_id, subtotal_cents, total_cents, currency,
        stripe_checkout_session_id, stripe_payment_intent_id, payment_status, status
      ) values (
        'DB-RPC-2', '${orgId}', 1728, 1728, 'USD', 'cs_rpc_2', 'pi_rpc_2', 'paid', 'paid'
      )
      returning id
    `);
    const secondId = second.rows[0].id;

    await db.exec(`select public.apply_refund('re_term_1', 'pi_rpc_2', 500, 'usd', 'succeeded')`);
    await db.exec(`select public.apply_refund('re_term_1', 'pi_rpc_2', 1, 'usd', 'pending')`);
    const succeeded = await db.query<{ status: string; amount_cents: number }>(
      `select status, amount_cents from public.refunds where stripe_refund_id = 're_term_1'`,
    );
    expect(succeeded.rows[0].status).toBe("succeeded");
    expect(succeeded.rows[0].amount_cents).toBe(500);

    await db.exec(`select public.apply_refund('re_term_2', 'pi_rpc_2', 200, 'usd', 'failed')`);
    await db.exec(`select public.apply_refund('re_term_2', 'pi_rpc_2', 999, 'usd', 'pending')`);
    const failed = await db.query<{ status: string; amount_cents: number }>(
      `select status, amount_cents from public.refunds where stripe_refund_id = 're_term_2'`,
    );
    expect(failed.rows[0].status).toBe("failed");
    expect(failed.rows[0].amount_cents).toBe(200);

    const totals = await db.query<{ refunded_cents: number; payment_status: string }>(
      `select refunded_cents, payment_status from public.orders where id = '${secondId}'`,
    );
    expect(totals.rows[0].refunded_cents).toBe(500);
    expect(totals.rows[0].payment_status).toBe("partially_refunded");
  });

  it("sums sequential refunds on one connection without claiming hosted multi-connection concurrency", async () => {
    await db.query<{ id: string }>(`
      insert into public.orders (
        order_number, organization_id, subtotal_cents, total_cents, currency,
        stripe_checkout_session_id, stripe_payment_intent_id, payment_status, status
      ) values (
        'DB-RPC-3', '${orgId}', 1440, 1440, 'USD', 'cs_rpc_3', 'pi_rpc_3', 'paid', 'paid'
      )
    `);

    await db.exec(`select public.apply_refund('re_sum_1', 'pi_rpc_3', 440, 'usd', 'succeeded')`);
    await db.exec(`select public.apply_refund('re_sum_2', 'pi_rpc_3', 500, 'usd', 'succeeded')`);
    await db.exec(`select public.apply_refund('re_sum_2', 'pi_rpc_3', 500, 'usd', 'succeeded')`);

    const totals = await db.query<{ refunded_cents: number; payment_status: string }>(
      `select refunded_cents, payment_status from public.orders where stripe_payment_intent_id = 'pi_rpc_3'`,
    );
    expect(totals.rows[0].refunded_cents).toBe(940);
    expect(totals.rows[0].payment_status).toBe("partially_refunded");
  });

  it("loads the internal staging seed with split IDs and three Melting Mask prices", async () => {
    await db.exec(sql("supabase/staging/seed_internal_test.sql"));
    const product = await db.query<{
      zoho_crm_product_id: string;
      zoho_commerce_product_id: string;
      zoho_variant_id: string;
    }>(`
      select zoho_crm_product_id, zoho_commerce_product_id, zoho_variant_id
      from public.products
      where sku = 'STG-MELTING-MASK'
    `);
    expect(product.rows[0].zoho_crm_product_id).toBe("staging-crm-melting-mask");
    expect(product.rows[0].zoho_commerce_product_id).toBe("staging-commerce-melting-mask");
    expect(product.rows[0].zoho_variant_id).toBe("staging-variant-melting-mask");

    const offers = await db.query<{ price_tier: number; price_cents: number }>(`
      select o.price_tier, o.price_cents
      from public.product_offers o
      join public.products p on p.id = o.product_id
      where p.sku = 'STG-MELTING-MASK'
      order by o.price_tier
    `);
    expect(offers.rows.map((row) => [row.price_tier, row.price_cents])).toEqual([
      [1, 1200],
      [2, 1440],
      [3, 1728],
    ]);

    const stock = await db.query<{ available_quantity: number }>(`
      select available_quantity from public.products where sku = 'STG-CONCURRENT-STOCK'
    `);
    expect(stock.rows[0].available_quantity).toBe(1);
  });
});
