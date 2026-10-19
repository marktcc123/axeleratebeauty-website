"use server";

import { revalidatePath } from "next/cache";
import { readCart, upsertItem, writeCart } from "@/lib/cart-cookie";
import { getAuthorizedProductsByIds, getPublishedProduct } from "@/lib/catalog";
import { CommerceError, normalizeQuantity } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

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
    return { error: error instanceof CommerceError ? error.message : "Unable to update the cart." };
  }
}

export async function updateCartItem(productId: string, quantity: number) {
  const cart = await readCart();
  if (quantity < 1) {
    await writeCart(upsertItem(cart, productId, 0));
  } else {
    await writeCart(upsertItem(cart, productId, normalizeQuantity(quantity)));
  }
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function removeCartItem(productId: string) {
  const cart = await readCart();
  await writeCart(upsertItem(cart, productId, 0));
  revalidatePath("/cart");
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
