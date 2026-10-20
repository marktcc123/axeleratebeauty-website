import { cookies } from "next/headers";
import { ensureCartLineIds, mergeCheckoutClaim, parseCart, parseCheckoutClaims } from "@/lib/cart-state";
import type { CartState, CheckoutClaim } from "@/lib/types";

export {
  applyCartQuantityUpdates,
  cartQuantitiesDirty,
  emptyCart,
  ensureCartLineIds,
  parseCart,
  parseCheckoutClaims,
  subtractCartItems,
  upsertItem,
} from "@/lib/cart-state";

const CART_COOKIE = "dermabell_cart";
const CLAIMS_COOKIE = "dermabell_checkout_claims";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function readCart(): Promise<CartState> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

export async function writeCart(cart: CartState) {
  const store = await cookies();
  const stamped = ensureCartLineIds(cart);
  const next: CartState = {
    items: stamped.items,
    version: stamped.version + 1,
    clearedOrderNumbers: stamped.clearedOrderNumbers,
  };
  store.set(CART_COOKIE, JSON.stringify(next), cookieOptions());
  return next;
}

export async function readCheckoutClaims(): Promise<CheckoutClaim[]> {
  const store = await cookies();
  return parseCheckoutClaims(store.get(CLAIMS_COOKIE)?.value);
}

export async function addCheckoutClaim(claim: CheckoutClaim) {
  const store = await cookies();
  const next = mergeCheckoutClaim(await readCheckoutClaims(), claim);
  store.set(CLAIMS_COOKIE, JSON.stringify(next), cookieOptions());
}

export async function writeCheckoutClaims(claims: CheckoutClaim[]) {
  const store = await cookies();
  store.set(CLAIMS_COOKIE, JSON.stringify(claims), cookieOptions());
}
