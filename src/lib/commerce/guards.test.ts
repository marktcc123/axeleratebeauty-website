import { describe, expect, it } from "vitest";
import {
  CommerceError,
  assertApprovedBuyer,
  assertPurchasableProduct,
  authorizedPriceLabel,
  cartTotals,
  normalizeQuantity,
  pricedCart,
  publicPriceLabel,
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
    expect(() => assertApprovedBuyer({ userId: "u1", verificationStatus: "pending", activeLocationId: "loc1" })).toThrow(CommerceError);
  });

  it("blocks checkout without an authorized store", () => {
    expect(() => assertApprovedBuyer({ userId: "u1", verificationStatus: "approved" })).toThrow(CommerceError);
  });

  it("blocks draft products", () => {
    expect(() => assertPurchasableProduct({ ...product, publicationStatus: "draft" })).toThrow(CommerceError);
  });

  it("rejects client-side price substitution by using catalog prices", () => {
    const lines = pricedCart([{ productId: "p1", quantity: 2 }], [product]);
    expect(lines[0].unitPriceCents).toBe(75000);
    expect(cartTotals(lines).merchandiseCents).toBe(150000);
    expect(cartTotals(lines).totalCents).toBeNull();
    expect(cartTotals(lines).shippingPending).toBe(true);
  });

  it("rejects invalid quantities", () => {
    expect(() => normalizeQuantity(0)).toThrow(CommerceError);
  });

  it("blocks suspended buyers", () => {
    expect(() => assertApprovedBuyer({ userId: "u1", verificationStatus: "suspended", activeLocationId: "loc1" })).toThrow(CommerceError);
  });

  it("blocks unpublished products in priced carts", () => {
    expect(() => pricedCart([{ productId: "p1", quantity: 1 }], [{ ...product, publicationStatus: "archived" }])).toThrow(
      CommerceError,
    );
  });

  it("blocks purchase when no authorized price exists", () => {
    expect(() => assertPurchasableProduct({ ...product, professionalPriceCents: null })).toThrow(CommerceError);
  });

  it("keeps public marketing prices gated on publicPriceVisible", () => {
    expect(
      publicPriceLabel({
        professionalPriceCents: 1200,
        publicPriceVisible: false,
        currency: "USD",
      }),
    ).toBe("Professional Pricing Available Upon Account Approval");
    expect(
      publicPriceLabel({
        professionalPriceCents: 1200,
        publicPriceVisible: true,
        currency: "USD",
      }),
    ).toBe("$12.00");
  });

  it("shows authorized partner prices without requiring publicPriceVisible", () => {
    expect(
      authorizedPriceLabel({
        professionalPriceCents: 1200,
        currency: "USD",
      }),
    ).toBe("$12.00");
    expect(
      authorizedPriceLabel({
        professionalPriceCents: null,
        currency: "USD",
      }),
    ).toBe("Price pending for this store");
  });
});
