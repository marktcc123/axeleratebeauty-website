import { describe, expect, it } from "vitest";
import {
  isBrowseOnlyProduct,
  isPostgresUuid,
  postgresUuids,
  productCardPurchaseEnabled,
  variantIsPurchasable,
} from "./catalog-browse";
import type { Product } from "./types";

const base: Product = {
  id: "p1",
  sku: "BC-1",
  slug: "sample",
  name: "Sample",
  description: null,
  intendedUse: null,
  shortDescription: null,
  packLabel: "70g / 220g",
  unitLabel: "each",
  category: "Masks",
  highlights: [],
  contents: [],
  usageNotes: null,
  precautions: null,
  images: [],
  currency: "USD",
  professionalPriceCents: 1200,
  publicPriceVisible: false,
  inventoryStatus: "untracked",
  availableQuantity: null,
  shippingAttributes: {
    catalogSource: "official-retail-1019",
    orderingMode: "priced",
    priceBridge: true,
    variants: [
      { id: "v70", barcode: "8809645782874", packLabel: "70g", comingSoon: false },
      { id: "v220", barcode: "8809645783581", packLabel: "220g", comingSoon: false },
    ],
  },
  publicationStatus: "active",
  reorderEligible: true,
  relatedProductIds: [],
};

describe("catalog browse helpers", () => {
  it("keeps multi-variant price-bridge cards on View details", () => {
    expect(productCardPurchaseEnabled(base)).toBe(false);
  });

  it("allows purchase only for the bridged Melting Mask barcode", () => {
    expect(variantIsPurchasable(base, { barcode: "8809645782874" })).toBe(true);
    expect(variantIsPurchasable(base, { barcode: "8809645783581" })).toBe(false);
  });

  it("marks unpriced official items browse-only", () => {
    expect(
      isBrowseOnlyProduct({
        ...base,
        professionalPriceCents: null,
        shippingAttributes: { catalogSource: "official-retail-1019", orderingMode: "browse_only" },
      }),
    ).toBe(true);
  });

  it("filters Preview official IDs out of Postgres UUID lookups", () => {
    expect(isPostgresUuid("orp-d9dfd1aebb62")).toBe(false);
    expect(isPostgresUuid("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(true);
    expect(postgresUuids(["orp-d9dfd1aebb62", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"])).toEqual([
      "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    ]);
  });
});
