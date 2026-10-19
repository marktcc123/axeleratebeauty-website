import { describe, expect, it } from "vitest";
import { catalogProducts } from "@/data/catalog-products";
import { facialPrograms } from "@/data/facial-programs";
import {
  catalogContainsRestrictedPriceFields,
  formatLineItem,
  getProgramBySlug,
  includedProductTypeCount,
  isProgramPurchasable,
  itemsByRole,
  listSharedProducts,
  resolveProgramItems,
} from "./program-catalog";

describe("professional program catalog", () => {
  it("publishes exactly four active programs with the source slugs", () => {
    expect(facialPrograms.map((program) => program.slug)).toEqual([
      "deep-hydration",
      "clear-balance",
      "sts-barrier-repair",
      "glass-skin-glow",
    ]);
  });

  it("keeps every program purchase-disabled until prices are approved", () => {
    for (const program of facialPrograms) {
      expect(program.purchaseEligible).toBe(false);
      expect(isProgramPurchasable(program)).toBe(false);
    }
  });

  it("does not store confidential prices or SKUs in the public catalog", () => {
    expect(catalogContainsRestrictedPriceFields(facialPrograms)).toEqual([]);
    expect(catalogContainsRestrictedPriceFields(catalogProducts)).toEqual([]);
    expect(catalogProducts.every((product) => product.sku === null)).toBe(true);
  });

  it("reuses a single LPR 3rd peel record across Deep Hydration and Glass Skin Glow", () => {
    const shared = listSharedProducts().map((product) => product.id);
    expect(shared).toContain("lpr-3rd-definite-boost-peel");
  });

  it("preserves Deep Hydration ampoule pack counts", () => {
    const program = getProgramBySlug("deep-hydration")!;
    const r06 = resolveProgramItems(program).find((item) => item.productId === "r06-control-solution")!;
    expect(r06.kitQuantity).toBe(4);
    expect(r06.product.innerPackCount).toBe(7);
    expect(formatLineItem(r06)).toBe("R06 Control Solution — 4 packs, 7 × 3.5 ml ampoules per pack.");
    expect(itemsByRole(program, "backbar")).toHaveLength(5);
    expect(itemsByRole(program, "retail")).toHaveLength(1);
    expect(includedProductTypeCount(program)).toBe(6);
  });

  it("preserves Clear Balance ampoule pack counts", () => {
    const program = getProgramBySlug("clear-balance")!;
    const t01 = resolveProgramItems(program).find((item) => item.productId === "t01-control-solution")!;
    const p02 = resolveProgramItems(program).find((item) => item.productId === "p02-control-solution")!;
    expect(formatLineItem(t01)).toBe("T01 Control Solution — 2 packs, 7 × 3.5 ml ampoules per pack.");
    expect(formatLineItem(p02)).toBe("P02 Control Solution — 2 packs, 7 × 3.5 ml ampoules per pack.");
  });

  it("preserves STS Barrier Repair quantities including retail support", () => {
    const program = getProgramBySlug("sts-barrier-repair")!;
    const s05 = resolveProgramItems(program).find((item) => item.productId === "s05-control-solution")!;
    const roseRetail = resolveProgramItems(program).find((item) => item.productId === "royal-rose-modeling-mask-150g")!;
    expect(formatLineItem(s05)).toBe("S05 Control Solution — 4 packs, 7 × 3.5 ml ampoules per pack.");
    expect(formatLineItem(roseRetail)).toBe("Royal Rose Modeling Mask — 150 g × 5");
    expect(itemsByRole(program, "retail")).toHaveLength(3);
  });

  it("preserves Glass Skin Glow melting-mask quantity", () => {
    const program = getProgramBySlug("glass-skin-glow")!;
    const mask = resolveProgramItems(program).find((item) => item.productId === "reju-control-melting-mask-70g")!;
    expect(formatLineItem(mask)).toBe("Reju Control Melting Mask — 70 g × 15");
  });
});
