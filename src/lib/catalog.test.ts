import { describe, expect, it } from "vitest";
import { stripProtectedPrice } from "./catalog";
import type { Product } from "./types";

const product: Product = {
  id: "p1",
  sku: "KIT-001",
  slug: "sample",
  name: "Sample",
  description: null,
  intendedUse: null,
  shortDescription: null,
  packLabel: null,
  unitLabel: null,
  category: "professional_kit",
  highlights: [],
  contents: [],
  usageNotes: null,
  precautions: null,
  images: [],
  currency: "USD",
  professionalPriceCents: 75000,
  publicPriceVisible: true,
  inventoryStatus: "in_stock",
  availableQuantity: 5,
  shippingAttributes: {},
  publicationStatus: "active",
  reorderEligible: true,
  relatedProductIds: [],
};

describe("public catalog isolation", () => {
  it("strips professional prices and quantities from public product payloads", () => {
    const publicProduct = stripProtectedPrice(product);
    expect(publicProduct.professionalPriceCents).toBeNull();
    expect(publicProduct.publicPriceVisible).toBe(false);
    expect(publicProduct.availableQuantity).toBeNull();
  });
});
