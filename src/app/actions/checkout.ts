"use server";

import { redirect } from "next/navigation";
import { readCart } from "@/lib/cart-cookie";
import { getProductsByIds } from "@/lib/catalog";
import { CommerceError, assertApprovedBuyer, pricedCart } from "@/lib/commerce/guards";
import { isStripeConfigured, siteUrl, stripeAutomaticTax } from "@/lib/config";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { createServiceSupabase } from "@/lib/supabase/server";

function orderNumber() {
  return `DB-${Date.now().toString(36).toUpperCase()}`;
}

export async function startCheckout() {
  if (!isStripeConfigured()) {
    return { error: "Checkout is not connected. Configure Stripe sandbox credentials before collecting payment." };
  }

  const session = await getSession();
  try {
    assertApprovedBuyer(session);
  } catch (error) {
    return {
      error: error instanceof CommerceError ? error.message : "Purchasing is not available.",
      redirectTo: session.userId ? "/partner/dashboard" : "/partner/login",
    };
  }

  const cart = await readCart();
  const products = await getProductsByIds(cart.items.map((item) => item.productId));
  let lines;
  try {
    lines = pricedCart(cart.items, products);
  } catch (error) {
    return { error: error instanceof CommerceError ? error.message : "The cart could not be priced." };
  }

  const stripe = getStripe();
  const service = await createServiceSupabase();
  if (!stripe || !service || !session.organizationId || !session.userId) {
    return { error: "Checkout is not fully configured." };
  }

  const totals = {
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };

  const { data: order, error: orderError } = await service
    .from("orders")
    .insert({
      order_number: orderNumber(),
      organization_id: session.organizationId,
      user_id: session.userId,
      status: "pending_payment",
      payment_status: "pending",
      fulfillment_status: "unfulfilled",
      subtotal_cents: totals.subtotalCents,
      shipping_cents: 0,
      tax_cents: 0,
      total_cents: totals.subtotalCents,
      currency: "USD",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { error: "The order could not be created." };
  }

  await service.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      sku: line.product.sku,
      name: line.product.name,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
    })),
  );

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.email ?? undefined,
    client_reference_id: order.id,
    success_url: `${siteUrl()}/checkout/success?order=${order.order_number}`,
    cancel_url: `${siteUrl()}/checkout/cancel`,
    automatic_tax: stripeAutomaticTax() ? { enabled: true } : undefined,
    shipping_address_collection: { allowed_countries: ["US"] },
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: line.product.currency.toLowerCase(),
        unit_amount: line.unitPriceCents,
        product_data: {
          name: line.product.name,
          metadata: { sku: line.product.sku, product_id: line.product.id },
        },
      },
    })),
    metadata: {
      order_id: order.id,
      organization_id: session.organizationId,
    },
  });

  await service
    .from("orders")
    .update({ stripe_checkout_session_id: checkout.id })
    .eq("id", order.id);

  if (!checkout.url) {
    return { error: "Stripe did not return a checkout URL." };
  }

  redirect(checkout.url);
}

export async function startCheckoutForm() {
  await startCheckout();
}
