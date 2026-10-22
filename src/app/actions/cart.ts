"use server";

import { revalidatePath } from "next/cache";
import {
  applyCartQuantityUpdates,
  readCart,
  readCheckoutClaims,
  upsertItem,
  writeCart,
  writeCheckoutClaims,
} from "@/lib/cart-cookie";
import { markOrderCleared, subtractCartItems } from "@/lib/cart-state";
import { getAuthorizedProductsByIds, getPublishedProduct } from "@/lib/catalog";
import { asCheckoutReturnOrder, canViewOrder, CHECKOUT_RETURN_SELECT, isPaymentConfirmed, purchasedQuantitiesToSubtract } from "@/lib/commerce/order-access";
import { logOrderEvent } from "@/lib/commerce/order-log";
import { CommerceError, normalizeQuantity } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";
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
    return {
      error: "Confirm your email and complete your business profile before purchasing.",
      redirectTo: "/partner/register",
    };
  }

  try {
    const products = await getAuthorizedProductsByIds([productId], session);
    const product = products[0];
    if (!product || product.publicationStatus !== "active" || product.professionalPriceCents == null) {
      return { error: "This product is not available for online ordering yet." };
    }
    if (product.shippingAttributes?.comingSoon === true || product.shippingAttributes?.orderingMode === "browse_only") {
      return { error: "This product is not available for online ordering yet." };
    }
    const cartProductId =
      typeof product.shippingAttributes?.purchaseProductId === "string" && product.shippingAttributes.purchaseProductId
        ? product.shippingAttributes.purchaseProductId
        : product.id;
    const cart = await readCart();
    const existing = cart.items.find((item) => item.productId === cartProductId);
    const nextQty = normalizeQuantity((existing?.quantity ?? 0) + quantity);
    await writeCart(upsertItem(cart, cartProductId, nextQty, existing?.lineId ?? crypto.randomUUID()));
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
    return { error: "Sign in with a shopping-ready account to reorder.", redirectTo: "/partner/login" };
  }
  const product = await getPublishedProduct(slug);
  if (!product?.reorderEligible) {
    return { error: "This product is not currently available to reorder." };
  }
  return addToCart(product.id, 1);
}

export async function reorderAuthorizedProduct(productId: string) {
  const session = await getSession();
  if (!canPurchase(session)) {
    return { error: "Sign in with a shopping-ready account to reorder.", redirectTo: "/partner/login" };
  }
  const products = await getAuthorizedProductsByIds([productId], session);
  const product = products[0];
  if (!product?.reorderEligible || product.publicationStatus !== "active" || product.professionalPriceCents == null) {
    return { error: "This product is not currently available to reorder." };
  }
  return addToCart(product.id, 1);
}

export async function clearPaidOrderFromCart(orderNumber: string) {
  const session = await getSession();
  if (!session.userId || !session.organizationId) {
    return { error: "Sign in to update the cart.", cleared: false };
  }
  if (!orderNumber) {
    return { error: "Missing order.", cleared: false };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    logOrderEvent({ stage: "cart_clear", code: "not_configured", orderNumber });
    return { error: "Cart cleanup is not configured.", cleared: false };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(CHECKOUT_RETURN_SELECT)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    logOrderEvent({
      stage: "cart_clear",
      code: error.code ?? "order_lookup_failed",
      orderNumber,
      organizationId: session.organizationId,
    });
    return { error: "The order could not be verified.", cleared: false };
  }

  const order = asCheckoutReturnOrder(data);
  if (!canViewOrder(session, order) || !order) {
    logOrderEvent({
      stage: "cart_clear",
      code: "forbidden",
      orderNumber,
      organizationId: session.organizationId,
    });
    return { error: "That order is not available on this account.", cleared: false };
  }

  if (!isPaymentConfirmed(order.payment_status)) {
    logOrderEvent({
      stage: "cart_clear",
      code: "pending",
      orderId: order.id,
      orderNumber: order.order_number,
      organizationId: session.organizationId,
    });
    return { error: null, cleared: false };
  }

  const cart = await readCart();
  if (cart.clearedOrderNumbers.includes(order.order_number)) {
    logOrderEvent({
      stage: "cart_clear",
      code: "already_cleared",
      orderId: order.id,
      orderNumber: order.order_number,
      organizationId: session.organizationId,
    });
    return { error: null, cleared: false };
  }

  const claims = await readCheckoutClaims();
  const claim = claims.find((entry) => entry.orderNumber === order.order_number);
  if (!claim) {
    logOrderEvent({
      stage: "cart_clear",
      code: "missing_claim",
      orderId: order.id,
      orderNumber: order.order_number,
      organizationId: session.organizationId,
    });
    return { error: null, cleared: false };
  }

  const paidItems = (order.order_items ?? []).flatMap((item) => (
    item.product_id && item.quantity > 0
      ? [{ productId: item.product_id, quantity: item.quantity }]
      : []
  ));
  const purchased = purchasedQuantitiesToSubtract(claim.items, paidItems, cart.items);
  const next = markOrderCleared(subtractCartItems(cart, purchased), order.order_number);
  await writeCart(next);
  await writeCheckoutClaims(claims.filter((entry) => entry.orderNumber !== order.order_number));
  revalidatePath("/cart");
  logOrderEvent({
    stage: "cart_clear",
    code: "ok",
    orderId: order.id,
    orderNumber: order.order_number,
    organizationId: session.organizationId,
  });
  return { error: null, cleared: true };
}
