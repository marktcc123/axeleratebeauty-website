"use server";

import { redirect } from "next/navigation";
import { addCheckoutClaim, readCart } from "@/lib/cart-cookie";
import { getAuthorizedProductsByIds } from "@/lib/catalog";
import { isNextRedirectError, logCheckoutEvent, stripeErrorFields } from "@/lib/commerce/checkout-log";
import { CommerceError, assertApprovedBuyer, cartTotals, pricedCart } from "@/lib/commerce/guards";
import { STRIPE_CHECKOUT_PAYMENT_METHODS, checkoutReadiness } from "@/lib/commerce/payments";
import {
  catalogSource,
  isStripeConfigured,
  siteUrl,
  stripeAutomaticTax,
  stripeShippingRateId,
} from "@/lib/config";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { createServiceSupabase } from "@/lib/supabase/server";

export type CheckoutFormState = {
  error: string | null;
};

function orderNumber() {
  return `DB-${Date.now().toString(36).toUpperCase()}`;
}

async function expireOrphanSession(stripe: NonNullable<ReturnType<typeof getStripe>>, sessionId: string) {
  try {
    await stripe.checkout.sessions.expire(sessionId);
  } catch {
    // The session may already be expired or completed; do not treat that as a successful charge.
  }
}

export async function startCheckout(
  previous: CheckoutFormState = { error: null },
  formData?: FormData,
): Promise<CheckoutFormState> {
  void previous;
  void formData;
  const ready = checkoutReadiness({
    stripeConfigured: isStripeConfigured(),
    automaticTax: stripeAutomaticTax(),
    shippingRateId: stripeShippingRateId(),
  });
  if (!ready.ok) {
    return { error: ready.reason };
  }

  const session = await getSession();
  try {
    assertApprovedBuyer(session);
  } catch (error) {
    return {
      error: error instanceof CommerceError ? error.message : "Purchasing is not available.",
    };
  }

  const cart = await readCart();
  const products = await getAuthorizedProductsByIds(
    cart.items.map((item) => item.productId),
    session,
  );
  let lines;
  try {
    lines = pricedCart(cart.items, products);
  } catch (error) {
    return { error: error instanceof CommerceError ? error.message : "The cart could not be priced." };
  }

  const stripe = getStripe();
  const service = await createServiceSupabase();
  const shippingRateId = stripeShippingRateId();
  if (!stripe || !service || !session.organizationId || !session.userId || !session.activeLocationId || !shippingRateId) {
    return { error: "Checkout is not fully configured." };
  }

  const { data: location, error: locationError } = await service
    .from("locations")
    .select("id, name, address_line1, address_line2, city, state, postal_code, country")
    .eq("id", session.activeLocationId)
    .eq("organization_id", session.organizationId)
    .maybeSingle();
  if (locationError) return { error: `Store lookup failed: ${locationError.message}` };
  if (!location) return { error: "Select an authorized store before checkout." };

  const totals = cartTotals(lines);
  const { data: order, error: orderError } = await service
    .from("orders")
    .insert({
      order_number: orderNumber(),
      organization_id: session.organizationId,
      payer_organization_id: session.organizationId,
      location_id: location.id,
      user_id: session.userId,
      status: "pending_payment",
      payment_status: "pending",
      fulfillment_status: "unfulfilled",
      order_kind: "replenishment",
      subtotal_cents: totals.subtotalCents,
      shipping_cents: 0,
      tax_cents: 0,
      shipping_pending: true,
      tax_pending: true,
      total_cents: totals.subtotalCents,
      currency: "USD",
      catalog_source: catalogSource(),
      stripe_idempotency_key: crypto.randomUUID(),
      shipping_address: {
        name: location.name,
        address_line1: location.address_line1,
        address_line2: location.address_line2,
        city: location.city,
        state: location.state,
        postal_code: location.postal_code,
        country: location.country,
      },
    })
    .select("id, order_number, stripe_idempotency_key")
    .single();

  if (orderError || !order) {
    logCheckoutEvent({
      stage: "order_create",
      code: orderError?.code ?? "order_create_failed",
      status: orderError ? 400 : null,
    });
    return { error: "The order could not be created." };
  }

  logCheckoutEvent({
    stage: "order_create",
    code: "ok",
    orderId: order.id,
    orderNumber: order.order_number,
  });

  const { error: itemError } = await service.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      sku: line.product.sku,
      name: line.product.name,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
    })),
  );

  if (itemError) {
    logCheckoutEvent({
      stage: "order_items_create",
      code: itemError.code ?? "order_items_failed",
      orderId: order.id,
      orderNumber: order.order_number,
    });
    const { error: deleteError } = await service.from("orders").delete().eq("id", order.id).eq("payment_status", "pending");
    if (deleteError) {
      logCheckoutEvent({
        stage: "order_items_create",
        code: deleteError.code ?? "order_rollback_failed",
        orderId: order.id,
        orderNumber: order.order_number,
      });
      return { error: "Order items failed and the pending order could not be rolled back." };
    }
    return { error: "Order items could not be saved, so payment was not started." };
  }

  logCheckoutEvent({
    stage: "order_items_create",
    code: "ok",
    orderId: order.id,
    orderNumber: order.order_number,
  });

  await addCheckoutClaim({
    orderNumber: order.order_number,
    items: cart.items,
    cartVersion: cart.version,
  });

  let checkout;
  try {
    checkout = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        allowed_payment_method_types: [...STRIPE_CHECKOUT_PAYMENT_METHODS],
        customer_email: session.email ?? undefined,
        client_reference_id: order.id,
        success_url: `${siteUrl()}/checkout/success?order=${order.order_number}`,
        cancel_url: `${siteUrl()}/checkout/cancel`,
        automatic_tax: { enabled: true },
        shipping_address_collection: { allowed_countries: ["US"] },
        shipping_options: [{ shipping_rate: shippingRateId }],
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
          location_id: location.id,
          order_kind: "replenishment",
        },
      },
      { idempotencyKey: order.stripe_idempotency_key ?? order.id },
    );
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    const stripeError = stripeErrorFields(error);
    logCheckoutEvent({
      stage: "stripe_session_create",
      code: stripeError.code,
      status: stripeError.status,
      orderId: order.id,
      orderNumber: order.order_number,
    });
    await service.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
    return { error: "Payment could not be started. The order was not charged." };
  }

  if (!checkout.url) {
    logCheckoutEvent({
      stage: "stripe_session_create",
      code: "missing_checkout_url",
      orderId: order.id,
      orderNumber: order.order_number,
      stripeSessionId: checkout.id,
    });
    await expireOrphanSession(stripe, checkout.id);
    await service.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
    return { error: "Stripe did not return a checkout URL." };
  }

  logCheckoutEvent({
    stage: "stripe_session_create",
    code: "ok",
    orderId: order.id,
    orderNumber: order.order_number,
    stripeSessionId: checkout.id,
  });

  const { error: linkError } = await service
    .from("orders")
    .update({ stripe_checkout_session_id: checkout.id })
    .eq("id", order.id);
  if (linkError) {
    logCheckoutEvent({
      stage: "order_session_link",
      code: linkError.code ?? "session_link_failed",
      orderId: order.id,
      orderNumber: order.order_number,
      stripeSessionId: checkout.id,
    });
    await expireOrphanSession(stripe, checkout.id);
    return { error: "The payment session could not be linked to the order. The hosted session was expired." };
  }

  logCheckoutEvent({
    stage: "order_session_link",
    code: "ok",
    orderId: order.id,
    orderNumber: order.order_number,
    stripeSessionId: checkout.id,
  });

  redirect(checkout.url);
}
