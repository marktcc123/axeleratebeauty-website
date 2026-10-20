import type { CartItem, CartState, CheckoutClaim } from "@/lib/types";

const MAX_CLEARED_ORDERS = 50;
const MAX_CLAIMS = 5;

export function emptyCart(): CartState {
  return { items: [], version: 0, clearedOrderNumbers: [] };
}

function asCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CartItem => Boolean(item?.productId) && Number(item.quantity) > 0)
    .map((item) => ({
      productId: String(item.productId),
      quantity: Math.min(99, Math.max(1, Number(item.quantity))),
      ...(typeof item.lineId === "string" && item.lineId ? { lineId: item.lineId } : {}),
    }));
}

export function ensureCartLineIds(cart: CartState): CartState {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      lineId: item.lineId ?? crypto.randomUUID(),
    })),
  };
}

export function parseCart(raw: string | undefined): CartState {
  if (!raw) return emptyCart();
  try {
    const parsed = JSON.parse(raw) as Partial<CartState>;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    const version = Number.isInteger(parsed.version) && Number(parsed.version) >= 0 ? Number(parsed.version) : 0;
    const clearedOrderNumbers = Array.isArray(parsed.clearedOrderNumbers)
      ? parsed.clearedOrderNumbers.filter((value): value is string => typeof value === "string").slice(-MAX_CLEARED_ORDERS)
      : [];
    return {
      items: asCartItems(parsed.items),
      version,
      clearedOrderNumbers,
    };
  } catch {
    return emptyCart();
  }
}

export function parseCheckoutClaims(raw: string | undefined): CheckoutClaim[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .flatMap((claim) => {
        if (!claim || typeof claim !== "object") return [];
        const record = claim as Partial<CheckoutClaim>;
        if (typeof record.orderNumber !== "string" || record.orderNumber.length === 0) return [];
        return [{
          orderNumber: record.orderNumber,
          items: asCartItems(record.items),
          cartVersion: Number.isInteger(record.cartVersion) ? Number(record.cartVersion) : 0,
        }];
      })
      .slice(-MAX_CLAIMS);
  } catch {
    return [];
  }
}

export function upsertItem(cart: CartState, productId: string, quantity: number, lineId?: string): CartState {
  const existing = cart.items.find((item) => item.productId === productId);
  const items = cart.items.filter((item) => item.productId !== productId);
  if (quantity > 0) {
    items.push({
      productId,
      quantity,
      lineId: lineId ?? existing?.lineId,
    });
  }
  return { ...cart, items };
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
    next = upsertItem(next, update.productId, update.quantity, update.lineId);
  }
  return next;
}

export function markOrderCleared(cart: CartState, orderNumber: string): CartState {
  if (cart.clearedOrderNumbers.includes(orderNumber)) return cart;
  return {
    ...cart,
    clearedOrderNumbers: [...cart.clearedOrderNumbers, orderNumber].slice(-MAX_CLEARED_ORDERS),
  };
}

export function subtractCartItems(cart: CartState, purchased: CartItem[]): CartState {
  let next = cart;
  for (const item of purchased) {
    const current = item.lineId
      ? next.items.find((entry) => entry.lineId === item.lineId)
      : next.items.find((entry) => entry.productId === item.productId && !entry.lineId)
        ?? next.items.find((entry) => entry.productId === item.productId);
    if (!current) continue;
    next = upsertItem(next, current.productId, Math.max(0, current.quantity - item.quantity), current.lineId);
  }
  return next;
}

export function mergeCheckoutClaim(claims: CheckoutClaim[], claim: CheckoutClaim): CheckoutClaim[] {
  return [...claims.filter((entry) => entry.orderNumber !== claim.orderNumber), claim].slice(-MAX_CLAIMS);
}
