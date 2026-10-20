"use server";

import { revalidatePath } from "next/cache";
import { applyCartQuantityUpdates, readCart, upsertItem, writeCart } from "@/lib/cart-cookie";
import { getAuthorizedProductsByIds, getPublishedProduct } from "@/lib/catalog";
import { CommerceError, normalizeQuantity } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import type { CartItem } from "@/lib/types";
import { canPurchase } from "@/lib/types";

function cartError(error: unknown) {
  if (error instanceof CommerceError) return error.message;
  if (error instanceof Error && error.message === "invalid_quantity") {
    return "Enter a quantity between 1 and 99.";
  }
  if (error instanceof Error && error.message === "unknown_cart_item") {
    return "That item is no longer in the cart.";
  }
  return "Unable to update the cart.";
}

export async function addToCart(productId: string, quantity = 1) {
  const session = await getSession();
  if (!canPurchase(session)) {
    return { error: "Create and verify a professional account, then select a store before purchasing.", redirectTo: "/partner/register" };
  }

  try {
    const products = await getAuthorizedProductsByIds([productId], session);
    const product = products[0];
    if (!product || product.publicationStatus !== "active" || product.professionalPriceCents == null) {
      return { error: "This product is not available for the selected store." };
    }
    const cart = await readCart();
    const nextQty = normalizeQuantity((cart.items.find((item) => item.productId === productId)?.quantity ?? 0) + quantity);
    await writeCart(upsertItem(cart, productId, nextQty));
    revalidatePath("/cart");
    return { error: null };
  } catch (error) {
    return { error: cartError(error) };
  }
}

export async function saveCartQuantities(updates: CartItem[]) {
  const cart = await readCart();
  try {
    const next = applyCartQuantityUpdates(cart, updates);
    await writeCart(next);
    revalidatePath("/cart");
    return { error: null, items: next.items };
  } catch (error) {
    return { error: cartError(error), items: cart.items };
  }
}

export async function updateCartItem(productId: string, quantity: number) {
  return saveCartQuantities([{ productId, quantity }]);
}

export async function removeCartItem(productId: string) {
  return saveCartQuantities([{ productId, quantity: 0 }]);
}

export async function reorderProduct(slug: string) {
  const session = await getSession();
  if (!canPurchase(session)) {
    return { error: "Approved accounts can reorder from order history.", redirectTo: "/partner/login" };
  }
  const product = await getPublishedProduct(slug);
  if (!product?.reorderEligible) {
    return { error: "This product is not currently available to reorder." };
  }
  return addToCart(product.id, 1);
}
