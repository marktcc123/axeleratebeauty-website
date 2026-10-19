import { cookies } from "next/headers";
import type { CartItem, CartState } from "@/lib/types";

const COOKIE = "dermabell_cart";

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

export async function readCart(): Promise<CartState> {
  const store = await cookies();
  return parseCart(store.get(COOKIE)?.value);
}

export async function writeCart(cart: CartState) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function upsertItem(cart: CartState, productId: string, quantity: number): CartState {
  const items = cart.items.filter((item) => item.productId !== productId);
  if (quantity > 0) items.push({ productId, quantity });
  return { items };
}
