import { NextResponse } from "next/server";
import { draftSettlement } from "@/lib/settlement";
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

  const { data: claimed, error: claimError } = await service.rpc("claim_processed_event", {
    p_provider: "stripe",
    p_event_id: event.id,
    p_event_type: event.type,
  });

  if (claimError) {
    await service.from("webhook_failures").insert({
      provider: "stripe",
      event_id: event.id,
      error: claimError.message,
    });
    return NextResponse.json({ error: "Event claim failed." }, { status: 500 });
  }
  if (claimed === false) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true, ignored: "unpaid" });
      }

      const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;
      const { data: orderId, error: paidError } = await service.rpc("mark_order_paid", {
        p_checkout_session_id: session.id,
        p_payment_intent: paymentIntent,
        p_tax_cents: session.total_details?.amount_tax ?? null,
        p_shipping_cents: session.shipping_cost?.amount_total ?? session.total_details?.amount_shipping ?? null,
        p_total_cents: session.amount_total ?? null,
        p_shipping_address: session.collected_information?.shipping_details?.address ?? null,
      });

      if (paidError) throw paidError;
      if (!orderId) {
        return NextResponse.json({ received: true, idempotent: true });
      }

      const { data: items } = await service.from("order_items").select("product_id, quantity").eq("order_id", orderId);
      for (const item of items ?? []) {
        if (!item.product_id) continue;
        const { data: decremented } = await service.rpc("decrement_tracked_inventory", {
          p_product_id: item.product_id,
          p_qty: item.quantity,
        });
        if (decremented === false) {
          await service.from("audit_events").insert({
            action: "inventory_shortfall",
            entity_type: "order",
            entity_id: orderId,
            metadata: { product_id: item.product_id, quantity: item.quantity, stripe_event_id: event.id },
          });
        }
      }

      const { data: order } = await service
        .from("orders")
        .select("id, organization_id, total_cents, tax_cents, shipping_cents, order_kind")
        .eq("id", orderId)
        .maybeSingle();

      if (order && order.order_kind !== "contract_installment") {
        const { data: organization } = await service
          .from("organizations")
          .select("commercial_model")
          .eq("id", order.organization_id)
          .maybeSingle();
        const settlement = draftSettlement({
          commercialModel: organization?.commercial_model ?? null,
          customerTotalCents: order.total_cents,
          taxCents: order.tax_cents ?? 0,
          shippingCents: order.shipping_cents ?? 0,
        });
        if (settlement) {
          await service.from("settlement_records").insert({
            order_id: order.id,
            organization_id: order.organization_id,
            commercial_model: settlement.commercialModel,
            rule_version: settlement.ruleVersion,
            customer_total_cents: settlement.customerTotalCents,
            tax_cents: settlement.taxCents,
            shipping_cents: settlement.shippingCents,
            processor_fee_cents: settlement.processorFeeCents,
            supplier_cost_cents: settlement.supplierCostCents,
            commission_base_cents: settlement.commissionBaseCents,
            commission_cents: settlement.commissionCents,
            status: settlement.status,
            notes: settlement.notes,
          });
        }
      }

      await service.from("audit_events").insert({
        action: "purchase_completed",
        entity_type: "order",
        entity_id: orderId,
        metadata: { stripe_event_id: event.id },
      });
    }

    if (event.type === "charge.refunded" || event.type === "refund.created") {
      const object = event.data.object as { payment_intent?: string; amount_refunded?: number; amount?: number };
      const paymentIntent = typeof object.payment_intent === "string" ? object.payment_intent : null;
      if (paymentIntent) {
        const { data: order } = await service
          .from("orders")
          .select("id, payment_status")
          .eq("stripe_payment_intent_id", paymentIntent)
          .maybeSingle();
        if (order) {
          await service
            .from("orders")
            .update({ payment_status: "refunded", status: "refunded" })
            .eq("id", order.id)
            .neq("payment_status", "refunded");
          await service.from("audit_events").insert({
            action: "refund_recorded",
            entity_type: "order",
            entity_id: order.id,
            metadata: { stripe_event_id: event.id, amount: object.amount_refunded ?? object.amount },
          });
        }
      }
    }
  } catch (error) {
    await service.from("webhook_failures").insert({
      provider: "stripe",
      event_id: event.id,
      error: error instanceof Error ? error.message : "Webhook processing failed",
    });
    await service.from("processed_events").delete().eq("provider", "stripe").eq("event_id", event.id);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
