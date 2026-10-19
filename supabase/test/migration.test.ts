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

describe("schema.sql + phase 1 migration on a temporary database", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    await db.exec(sql("supabase/test/bootstrap.sql"));
    await db.exec(sql("supabase/schema.sql"));
    await db.exec(sql("supabase/migrations/20261019_phase1_security.sql"));
  }, 30000);

  afterAll(async () => {
    await db?.close();
  });

  it("exposes anonymous catalog rows without professional prices", async () => {
    await db.exec(`
      insert into public.products (
        sku, slug, name, professional_price_cents, available_quantity,
        publication_status, zoho_crm_product_id, zoho_commerce_product_id, zoho_variant_id
      ) values (
        'TEST-BELLE-01', 'test-belle-serum', 'Test Belle Serum', 99900, 12,
        'active', 'crm_111', 'com_222', 'var_333'
      );
    `);

    const columns = await db.query<{ column_name: string }>(`
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'catalog_products'
      order by column_name
    `);
    const names = columns.rows.map((row) => row.column_name);
    expect(names).toContain("sku");
    expect(names).toContain("zoho_crm_product_id");
    expect(names).toContain("zoho_commerce_product_id");
    expect(names).toContain("zoho_variant_id");
    expect(names).not.toContain("professional_price_cents");
    expect(names).not.toContain("available_quantity");
    expect(names).not.toContain("public_price_visible");

    await db.exec("set role anon;");
    const catalog = await db.query<{ sku: string; zoho_commerce_product_id: string }>(`
      select sku, zoho_commerce_product_id from public.catalog_products where sku = 'TEST-BELLE-01';
    `);
    expect(catalog.rows[0]?.sku).toBe("TEST-BELLE-01");
    expect(catalog.rows[0]?.zoho_commerce_product_id).toBe("com_222");

    await expect(
      db.query(`select professional_price_cents from public.products where sku = 'TEST-BELLE-01'`),
    ).rejects.toThrow();

    await db.exec("reset role;");
  });

  it("rejects privilege writes unless an explicit service grant is present", async () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    await db.exec(`
      insert into auth.users (id, email) values ('${userId}', 'owner@example.com');
      insert into public.profiles (id, full_name, role, is_admin)
      values ('${userId}', 'Owner', 'company_admin', true);
    `);
    const denied = await db.query<{ is_admin: boolean; role: string }>(
      `select is_admin, role from public.profiles where id = '${userId}'`,
    );
    expect(denied.rows[0]?.is_admin).toBe(false);
    expect(denied.rows[0]?.role).toBe("pending");

    await db.exec(`
      select set_config('app.allow_privilege_write', 'on', false);
      update public.profiles set is_admin = true, role = 'company_admin' where id = '${userId}';
      select set_config('app.allow_privilege_write', '', false);
    `);
    const allowed = await db.query<{ is_admin: boolean }>(
      `select is_admin from public.profiles where id = '${userId}'`,
    );
    expect(allowed.rows[0]?.is_admin).toBe(true);
  });

  it("keeps webhook claim, paid amounts, inventory, and refunds consistent", async () => {
    const org = await db.query<{ id: string }>(`
      insert into public.organizations (name, commercial_model, price_tier)
      values ('Brow Arc Test', 'commission', 1)
      returning id
    `);
    const orgId = org.rows[0].id;
    const product = await db.query<{ id: string }>(`
      insert into public.products (sku, slug, name, publication_status, inventory_status, available_quantity)
      values ('TEST-INV-01', 'test-inv', 'Tracked Serum', 'active', 'in_stock', 5)
      returning id
    `);
    const productId = product.rows[0].id;
    const order = await db.query<{ id: string }>(`
      insert into public.orders (
        order_number, organization_id, subtotal_cents, total_cents, currency,
        stripe_checkout_session_id, stripe_payment_intent_id
      ) values (
        'DB-TEST-1', '${orgId}', 10000, 10000, 'USD', 'cs_test_1', 'pi_test_1'
      )
      returning id
    `);
    const orderId = order.rows[0].id;

    const firstClaim = await db.query<{ claim_webhook_event: string }>(
      `select public.claim_webhook_event('stripe', 'evt_1', 'checkout.session.completed')`,
    );
    expect(firstClaim.rows[0].claim_webhook_event).toBe("claimed");
    const concurrent = await db.query<{ claim_webhook_event: string }>(
      `select public.claim_webhook_event('stripe', 'evt_1', 'checkout.session.completed')`,
    );
    expect(concurrent.rows[0].claim_webhook_event).toBe("in_progress");

    await expect(
      db.exec(`select public.mark_order_paid('cs_missing', 'pi_x', 'usd', 0, 0, 10000, '{}'::jsonb)`),
    ).rejects.toThrow(/order_not_found/);

    const paid = await db.query<{ mark_order_paid: string }>(
      `select public.mark_order_paid('cs_test_1', 'pi_test_1', 'usd', 800, 1200, 12000, '{}'::jsonb)`,
    );
    expect(paid.rows[0].mark_order_paid).toBe(orderId);

    await expect(db.exec(`select public.apply_inventory_decrement('${orderId}', '${productId}', 0)`)).rejects.toThrow(
      /invalid_quantity/,
    );
    const decremented = await db.query<{ apply_inventory_decrement: boolean }>(
      `select public.apply_inventory_decrement('${orderId}', '${productId}', 2)`,
    );
    expect(decremented.rows[0].apply_inventory_decrement).toBe(true);
    const again = await db.query<{ apply_inventory_decrement: boolean }>(
      `select public.apply_inventory_decrement('${orderId}', '${productId}', 2)`,
    );
    expect(again.rows[0].apply_inventory_decrement).toBe(true);

    await db.exec(`select public.fail_webhook_event('stripe', 'evt_1', 'interrupted')`);
    const reclaimed = await db.query<{ claim_webhook_event: string }>(
      `select public.claim_webhook_event('stripe', 'evt_1', 'checkout.session.completed')`,
    );
    expect(reclaimed.rows[0].claim_webhook_event).toBe("reclaimed");
    await db.exec(`select public.complete_webhook_event('stripe', 'evt_1')`);
    const duplicate = await db.query<{ claim_webhook_event: string }>(
      `select public.claim_webhook_event('stripe', 'evt_1', 'checkout.session.completed')`,
    );
    expect(duplicate.rows[0].claim_webhook_event).toBe("succeeded");

    const pending = await db.query<{ apply_refund: string }>(
      `select public.apply_refund('re_1', 'pi_test_1', 4000, 'usd', 'pending')`,
    );
    expect(pending.rows[0].apply_refund).toBeTruthy();
    await db.exec(`select public.apply_refund('re_1', 'pi_test_1', 4000, 'usd', 'succeeded')`);
    const partial = await db.query<{ payment_status: string; refunded_cents: number }>(
      `select payment_status, refunded_cents from public.orders where id = '${orderId}'`,
    );
    expect(partial.rows[0].payment_status).toBe("partially_refunded");
    expect(partial.rows[0].refunded_cents).toBe(4000);

    await db.exec(`select public.apply_refund('re_2', 'pi_test_1', 8000, 'usd', 'succeeded')`);
    const full = await db.query<{ payment_status: string; refunded_cents: number; status: string }>(
      `select payment_status, refunded_cents, status from public.orders where id = '${orderId}'`,
    );
    expect(full.rows[0].refunded_cents).toBe(12000);
    expect(full.rows[0].payment_status).toBe("refunded");
    expect(full.rows[0].status).toBe("refunded");

    const execute = await db.query<{ has_anon: boolean; has_public: boolean }>(`
      select
        has_function_privilege('anon', 'public.claim_webhook_event(text,text,text)', 'execute') as has_anon,
        has_function_privilege('public', 'public.mark_order_paid(text,text,text,integer,integer,integer,jsonb)', 'execute') as has_public
    `);
    expect(execute.rows[0].has_anon).toBe(false);
    expect(execute.rows[0].has_public).toBe(false);
  });
});
