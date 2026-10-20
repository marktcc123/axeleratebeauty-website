import { cookies } from "next/headers";
import { parseCart } from "@/lib/cart-state";
import type { CartState } from "@/lib/types";

export { applyCartQuantityUpdates, cartQuantitiesDirty, emptyCart, parseCart, upsertItem } from "@/lib/cart-state";

const COOKIE = "dermabell_cart";

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
