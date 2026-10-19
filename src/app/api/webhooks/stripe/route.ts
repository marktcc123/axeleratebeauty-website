import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  const service = await createServiceSupabase();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !service || !signature || !secret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: "unpaid" });
    }

    const { data: existing } = await service
      .from("orders")
      .select("id, payment_status")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ received: true, ignored: "unknown_order" });
    }
    if (existing.payment_status === "paid") {
      return NextResponse.json({ received: true, idempotent: true });
    }

    await service
      .from("orders")
      .update({
        payment_status: "paid",
        status: "paid",
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        tax_cents: session.total_details?.amount_tax ?? 0,
        shipping_cents: session.shipping_cost?.amount_total ?? session.total_details?.amount_shipping ?? 0,
        total_cents: session.amount_total ?? undefined,
        shipping_address: session.collected_information?.shipping_details?.address ?? null,
      })
      .eq("id", existing.id);

    const { data: items } = await service
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", existing.id);

    for (const item of items ?? []) {
      if (!item.product_id) continue;
      const { data: product } = await service
        .from("products")
        .select("available_quantity, inventory_status")
        .eq("id", item.product_id)
        .maybeSingle();
      if (!product || product.available_quantity == null || product.inventory_status === "untracked") continue;
      const nextQuantity = Math.max(0, product.available_quantity - item.quantity);
      await service
        .from("products")
        .update({
          available_quantity: nextQuantity,
          inventory_status: nextQuantity === 0 ? "out_of_stock" : product.inventory_status,
        })
        .eq("id", item.product_id);
    }

    await service.from("audit_events").insert({
      action: "purchase_completed",
      entity_type: "order",
      entity_id: existing.id,
      metadata: { stripe_event_id: event.id },
    });
  }

  return NextResponse.json({ received: true });
}
