import { describe, expect, it } from "vitest";
import { applyCartQuantityUpdates, cartQuantitiesDirty, parseCart, upsertItem } from "./cart-state";

describe("cart quantity updates", () => {
  const cart = { items: [{ productId: "a", quantity: 1 }, { productId: "b", quantity: 2 }] };

  it("applies the latest quantity for an existing item without dropping others", () => {
    const next = applyCartQuantityUpdates(cart, [
      { productId: "a", quantity: 4 },
      { productId: "b", quantity: 2 },
    ]);
    expect(next.items).toEqual([
      { productId: "a", quantity: 4 },
      { productId: "b", quantity: 2 },
    ]);
  });

  it("rejects unknown products and invalid quantities", () => {
    expect(() => applyCartQuantityUpdates(cart, [{ productId: "c", quantity: 1 }])).toThrow("unknown_cart_item");
    expect(() => applyCartQuantityUpdates(cart, [{ productId: "a", quantity: 0.5 }])).toThrow("invalid_quantity");
    expect(() => applyCartQuantityUpdates(cart, [{ productId: "a", quantity: 100 }])).toThrow("invalid_quantity");
  });

  it("marks checkout dirty until the latest local quantity matches the saved cart", () => {
    expect(cartQuantitiesDirty(cart.items, cart.items)).toBe(false);
    expect(cartQuantitiesDirty([{ productId: "a", quantity: 3 }, { productId: "b", quantity: 2 }], cart.items)).toBe(true);
  });

  it("removes an item at quantity 0 and keeps the rest of the cookie payload", () => {
    expect(upsertItem(cart, "a", 0).items).toEqual([{ productId: "b", quantity: 2 }]);
    expect(parseCart(JSON.stringify({ items: [{ productId: "a", quantity: 3 }] })).items[0]?.quantity).toBe(3);
  });
});
