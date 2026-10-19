import { describe, expect, it } from "vitest";
import {
  CommerceError,
  assertApprovedBuyer,
  assertPurchasableProduct,
  cartTotals,
  normalizeQuantity,
  pricedCart,
} from "./guards";
import type { Product } from "@/lib/types";

const product: Product = {
  id: "p1",
  sku: "KIT-001",
  slug: "sample",
  name: "Sample",
  description: null,
  intendedUse: null,
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

describe("commerce guards", () => {
  it("blocks unapproved buyers", () => {
    expect(() => assertApprovedBuyer({ userId: "u1", verificationStatus: "pending" })).toThrow(CommerceError);
  });

  it("blocks draft products", () => {
    expect(() => assertPurchasableProduct({ ...product, publicationStatus: "draft" })).toThrow(CommerceError);
  });

  it("rejects client-side price substitution by using catalog prices", () => {
    const lines = pricedCart([{ productId: "p1", quantity: 2 }], [product]);
    expect(lines[0].unitPriceCents).toBe(75000);
    expect(cartTotals(lines).totalCents).toBe(150000);
  });

  it("rejects invalid quantities", () => {
    expect(() => normalizeQuantity(0)).toThrow(CommerceError);
  });

  it("blocks suspended buyers", () => {
    expect(() => assertApprovedBuyer({ userId: "u1", verificationStatus: "suspended" })).toThrow(CommerceError);
  });

  it("blocks unpublished products in priced carts", () => {
    expect(() => pricedCart([{ productId: "p1", quantity: 1 }], [{ ...product, publicationStatus: "archived" }])).toThrow(
      CommerceError,
    );
  });
});
