import type { CartItem, CartState } from "@/lib/types";

export function emptyCart(): CartState {
  return { items: [] };
}

export function parseCart(raw: string | undefined): CartState {
  if (!raw) return emptyCart();
  try {
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    return {
      items: parsed.items
        .filter((item): item is CartItem => Boolean(item?.productId) && Number(item.quantity) > 0)
        .map((item) => ({ productId: String(item.productId), quantity: Math.min(99, Math.max(1, Number(item.quantity))) })),
    };
  } catch {
    return emptyCart();
  }
}

export function upsertItem(cart: CartState, productId: string, quantity: number): CartState {
  const items = cart.items.filter((item) => item.productId !== productId);
  if (quantity > 0) items.push({ productId, quantity });
  return { items };
}

export function cartQuantitiesDirty(local: CartItem[], saved: CartItem[]) {
  if (local.length !== saved.length) return true;
  const savedById = new Map(saved.map((item) => [item.productId, item.quantity]));
  return local.some((item) => savedById.get(item.productId) !== item.quantity);
}

export function applyCartQuantityUpdates(cart: CartState, updates: CartItem[]): CartState {
  const allowed = new Set(cart.items.map((item) => item.productId));
  let next = cart;
  for (const update of updates) {
    if (!allowed.has(update.productId)) {
      throw new Error("unknown_cart_item");
    }
    if (!Number.isInteger(update.quantity) || update.quantity < 0 || update.quantity > 99) {
      throw new Error("invalid_quantity");
    }
    next = upsertItem(next, update.productId, update.quantity);
  }
  return next;
}
