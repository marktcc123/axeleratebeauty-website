import { describe, expect, it } from "vitest";
import { isBrowseOnlyProduct, productBarcodes } from "./catalog-browse";
import {
  listOfficialRetailProducts,
  loadOfficialRetailCatalog,
  officialProductToCatalogProduct,
} from "./catalog-official-retail";

describe("official retail 1019 catalog", () => {
  it("loads 50 product groups covering 66 source rows", () => {
    const groups = loadOfficialRetailCatalog();
    const variants = groups.flatMap((product) => product.variants);
    expect(groups).toHaveLength(50);
    expect(variants).toHaveLength(66);
    expect(variants.filter((variant) => variant.comingSoon)).toHaveLength(4);
  });

  it("keeps Melting Mask 70g / 220g barcodes as separate variants", () => {
    const product = loadOfficialRetailCatalog().find((entry) =>
      entry.variants.some((variant) => variant.barcode === "8809645782874"),
    );
    expect(product).toBeTruthy();
    const packs = product!.variants.map((variant) => [variant.barcode, variant.packLabel]);
    expect(packs).toEqual([
      ["8809645782874", "70g"],
      ["8809645783581", "220g"],
    ]);
  });

  it("keeps Control Solution 1 vial / 7 vials as variants", () => {
    const product = loadOfficialRetailCatalog().find((entry) => entry.name.includes("B03 Control Solution"));
    expect(product?.variants.map((variant) => variant.packLabel)).toEqual(["3.5ml * 1vial", "3.5ml * 7vial"]);
  });

  it("marks new catalog products browse-only with no price", () => {
    const products = listOfficialRetailProducts();
    expect(products.every((product) => product.professionalPriceCents == null)).toBe(true);
    expect(products.every((product) => isBrowseOnlyProduct(product))).toBe(true);
    expect(productBarcodes(products[0]!).length).toBeGreaterThan(0);
  });

  it("preserves row 59 rename alias without inventing a barcode", () => {
    const product = loadOfficialRetailCatalog().find((entry) =>
      entry.variants.some((variant) => variant.sourceRow === 59),
    );
    const variant = product!.variants[0]!;
    expect(product!.name).toContain("Reju Control Tone Balancing Cream");
    expect(variant.nameAliasEn).toBe("Dermabell High-Essential Aura Tone Balancing Cream");
    expect(variant.comingSoon).toBe(true);
    expect(variant.barcode).toBeNull();
    const mapped = officialProductToCatalogProduct(product!);
    expect(mapped.shippingAttributes.comingSoon).toBe(true);
  });
});
