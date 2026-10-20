import { describe, expect, it } from "vitest";
import {
  applyCartQuantityUpdates,
  cartQuantitiesDirty,
  emptyCart,
  markOrderCleared,
  parseCart,
  parseCheckoutClaims,
  subtractCartItems,
  upsertItem,
} from "./cart-state";

describe("cart quantity updates", () => {
  const cart = {
    ...emptyCart(),
    items: [{ productId: "a", quantity: 1 }, { productId: "b", quantity: 2 }],
  };

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

  it("reads a legacy cart cookie without version as version 0", () => {
    const parsed = parseCart(JSON.stringify({ items: [{ productId: "a", quantity: 2 }] }));
    expect(parsed.version).toBe(0);
    expect(parsed.clearedOrderNumbers).toEqual([]);
  });

  it("subtracts a paid snapshot once and keeps items added after checkout", () => {
    const current = {
      ...emptyCart(),
      version: 4,
      items: [{ productId: "a", quantity: 3 }, { productId: "b", quantity: 1 }],
    };
    const afterPaid = markOrderCleared(
      subtractCartItems(current, [{ productId: "a", quantity: 2 }]),
      "DB-1",
    );
    expect(afterPaid.items).toEqual([{ productId: "b", quantity: 1 }, { productId: "a", quantity: 1 }]);
    expect(afterPaid.clearedOrderNumbers).toEqual(["DB-1"]);
    expect(markOrderCleared(afterPaid, "DB-1").clearedOrderNumbers).toEqual(["DB-1"]);
  });

  it("parses checkout claims without copying unknown fields", () => {
    const claims = parseCheckoutClaims(JSON.stringify([
      { orderNumber: "DB-1", items: [{ productId: "a", quantity: 2 }], cartVersion: 3, email: "hidden@example.com" },
    ]));
    expect(claims).toEqual([{ orderNumber: "DB-1", items: [{ productId: "a", quantity: 2 }], cartVersion: 3 }]);
    expect(JSON.stringify(claims)).not.toContain("hidden@");
  });
});
