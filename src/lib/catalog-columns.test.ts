import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG_HIDDEN_COLUMNS, CATALOG_PUBLIC_COLUMNS } from "./catalog-columns";

describe("catalog column alignment", () => {
  it("keeps the SQL view, public select list, and hidden price columns aligned", () => {
    const migration = readFileSync("supabase/migrations/20261019_phase1_security.sql", "utf8");
    const viewBlock = migration.split("create or replace view public.catalog_products")[1] ?? "";
    for (const column of CATALOG_PUBLIC_COLUMNS) {
      expect(viewBlock).toContain(column);
    }
    for (const column of CATALOG_HIDDEN_COLUMNS) {
      expect(viewBlock.split("from public.products")[0]).not.toContain(column);
    }
  });
});
