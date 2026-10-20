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

describe("catalog_products browser grants are select-only", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    await db.exec(sql("supabase/test/bootstrap.sql"));
    await db.exec(sql("supabase/schema.sql"));
    await db.exec(sql("supabase/migrations/20261019_phase1_security.sql"));
    await db.exec(sql("supabase/migrations/20261019_phase1_rpc_hardening.sql"));
    await db.exec(`
      insert into public.products (
        sku, slug, name, professional_price_cents, available_quantity, publication_status
      ) values (
        'TEST-GRANT-01', 'test-grant-serum', 'Grant Probe Serum', 88800, 9, 'active'
      );
      grant all on table public.catalog_products to public, anon, authenticated;
    `);
    const before = await db.query<{ ins: boolean }>(`
      select has_table_privilege('anon', 'public.catalog_products', 'INSERT') as ins
    `);
    expect(before.rows[0]?.ins).toBe(true);
    await db.exec(sql("supabase/migrations/20261020065643_catalog_products_select_only.sql"));
  }, 30000);

  afterAll(async () => {
    await db?.close();
  });

  it("lets anon and authenticated read public catalog columns only", async () => {
    const privileges = await db.query<{
      anon_sel: boolean;
      anon_ins: boolean;
      anon_upd: boolean;
      anon_del: boolean;
      auth_sel: boolean;
      auth_ins: boolean;
      products_anon_sel: boolean;
      products_anon_ins: boolean;
    }>(`
      select
        has_table_privilege('anon', 'public.catalog_products', 'SELECT') as anon_sel,
        has_table_privilege('anon', 'public.catalog_products', 'INSERT') as anon_ins,
        has_table_privilege('anon', 'public.catalog_products', 'UPDATE') as anon_upd,
        has_table_privilege('anon', 'public.catalog_products', 'DELETE') as anon_del,
        has_table_privilege('authenticated', 'public.catalog_products', 'SELECT') as auth_sel,
        has_table_privilege('authenticated', 'public.catalog_products', 'INSERT') as auth_ins,
        has_table_privilege('anon', 'public.products', 'SELECT') as products_anon_sel,
        has_table_privilege('anon', 'public.products', 'INSERT') as products_anon_ins
    `);
    expect(privileges.rows[0]).toMatchObject({
      anon_sel: true,
      anon_ins: false,
      anon_upd: false,
      anon_del: false,
      auth_sel: true,
      auth_ins: false,
      products_anon_sel: false,
      products_anon_ins: false,
    });

    await db.exec("set role anon;");
    const catalog = await db.query<{ sku: string; name: string }>(`
      select sku, name from public.catalog_products where sku = 'TEST-GRANT-01'
    `);
    expect(catalog.rows[0]?.sku).toBe("TEST-GRANT-01");

    await expect(
      db.query(`select professional_price_cents from public.catalog_products where sku = 'TEST-GRANT-01'`),
    ).rejects.toThrow();
    await expect(
      db.query(`select available_quantity from public.catalog_products where sku = 'TEST-GRANT-01'`),
    ).rejects.toThrow();
    await expect(
      db.query(`select professional_price_cents from public.products where sku = 'TEST-GRANT-01'`),
    ).rejects.toThrow();
    await db.exec("reset role;");

    await db.exec("set role authenticated;");
    const authed = await db.query<{ sku: string }>(`
      select sku from public.catalog_products where sku = 'TEST-GRANT-01'
    `);
    expect(authed.rows[0]?.sku).toBe("TEST-GRANT-01");
    await db.exec("reset role;");
  });

  it("rejects view writes from anon and authenticated without changing catalog rows", async () => {
    const before = await db.query<{ n: number }>(`
      select count(*)::int as n from public.products where sku = 'TEST-GRANT-01'
    `);
    expect(before.rows[0]?.n).toBe(1);

    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role};`);
      await expect(
        db.exec(`
          insert into public.catalog_products (sku, slug, name)
          values ('TEST-GRANT-WRITE', 'test-grant-write', 'Should Fail')
        `),
      ).rejects.toThrow();
      await expect(
        db.exec(`
          update public.catalog_products
          set name = name
          where sku = '__no_such_sku_permission_probe__'
        `),
      ).rejects.toThrow();
      await expect(
        db.exec(`
          delete from public.catalog_products
          where sku = '__no_such_sku_permission_probe__'
        `),
      ).rejects.toThrow();
      await db.exec("reset role;");
    }

    const after = await db.query<{ n: number; name: string }>(`
      select count(*)::int as n, max(name) as name
      from public.products
      where sku in ('TEST-GRANT-01', 'TEST-GRANT-WRITE')
    `);
    expect(after.rows[0]?.n).toBe(1);
    expect(after.rows[0]?.name).toBe("Grant Probe Serum");
  });
});
