import { draftSettlement } from "@/lib/settlement";
import { PaymentConsistencyError, assertPayableMatch, interpretClaim } from "./payments";

type QueryResult<T = unknown> = { data: T; error: { message: string } | null };

type QueryBuilder<T = unknown> = {
  select: (columns: string) => QueryBuilder<T>;
  insert: (values: Record<string, unknown> | Record<string, unknown>[]) => QueryBuilder<T>;
  update: (values: Record<string, unknown>) => QueryBuilder<T>;
  eq: (column: string, value: unknown) => QueryBuilder<T>;
  maybeSingle: () => Promise<QueryResult<T | null>>;
} & PromiseLike<QueryResult<T>>;

type Service = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<QueryResult>;
  from: (table: string) => QueryBuilder;
};

type StripeObject = Record<string, unknown>;

type OrderRow = {
  id: string;
  currency: string;
  subtotal_cents: number;
  total_cents: number | null;
  payment_status: string;
  stripe_checkout_session_id: string | null;
  organization_id: string;
  order_kind: string;
};

type OrderItemRow = { product_id: string | null; quantity: number };
type OrganizationRow = { commercial_model: "commission" | "wholesale" | "internal" | null };

function isRecord(value: unknown): value is StripeObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function nested(value: unknown, key: string) {
  return isRecord(value) ? value[key] : undefined;
}

async function settleQuery<T>(builder: unknown) {
  return (await (builder as Promise<QueryResult<T>>));
}

export async function handleStripeEvent(service: Service, event: {
  id: string;
  type: string;
  data: { object: object };
}) {
  const payload = isRecord(event.data.object) ? event.data.object : {};
  const { data: claimRaw, error: claimError } = await service.rpc("claim_webhook_event", {
    p_provider: "stripe",
    p_event_id: event.id,
    p_event_type: event.type,
  });
  if (claimError) throw new Error(claimError.message);
  const claim = interpretClaim(typeof claimRaw === "string" ? claimRaw : null);
  if (claim === "succeeded") return { received: true, idempotent: true };
  if (claim === "in_progress") return { received: false, retry: true, reason: "in_progress" };

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await settlePaidSession(service, payload, event.id);
    } else if (event.type === "checkout.session.async_payment_failed") {
      await markCheckoutFailed(service, payload);
    } else if (event.type === "refund.created" || event.type === "refund.updated" || event.type === "refund.failed") {
      await applyRefundObject(service, payload, event.type === "refund.failed" ? "failed" : undefined);
    } else if (event.type === "charge.refunded") {
      await applyChargeRefunds(service, payload);
    }

    const { error: completeError } = await service.rpc("complete_webhook_event", {
      p_provider: "stripe",
      p_event_id: event.id,
    });
    if (completeError) throw new Error(completeError.message);
    return { received: true };
  } catch (error) {
    await service.rpc("fail_webhook_event", {
      p_provider: "stripe",
      p_event_id: event.id,
      p_error: error instanceof Error ? error.message : "Webhook processing failed",
    });
    throw error;
  }
}

async function settlePaidSession(service: Service, session: StripeObject, eventId: string) {
  if (session.payment_status !== "paid") {
    throw new Error("Checkout session is not paid.");
  }
  const sessionId = readString(session.id);
  if (!sessionId) throw new PaymentConsistencyError("No order matches this Stripe session.", "order_not_found");

  const { data: order, error: orderError } = await settleQuery<OrderRow | null>(
    service
      .from("orders")
      .select("id, currency, subtotal_cents, total_cents, payment_status, stripe_checkout_session_id, organization_id, order_kind")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle(),
  );
  if (orderError) throw new Error(orderError.message);
  if (!order) throw new PaymentConsistencyError("No order matches this Stripe session.", "order_not_found");

  const taxCents = readNumber(nested(session.total_details, "amount_tax"));
  const shippingCents =
    readNumber(nested(session.shipping_cost, "amount_total")) ??
    readNumber(nested(session.total_details, "amount_shipping"));
  const totalCents = readNumber(session.amount_total);

  assertPayableMatch(
    {
      id: order.id,
      currency: order.currency,
      subtotalCents: order.subtotal_cents,
      stripeCheckoutSessionId: order.stripe_checkout_session_id,
      paymentStatus: order.payment_status,
      totalCents: order.total_cents,
    },
    {
      checkoutSessionId: sessionId,
      currency: readString(session.currency),
      taxCents,
      shippingCents,
      totalCents,
    },
  );

  const { data: orderId, error: paidError } = await service.rpc("mark_order_paid", {
    p_checkout_session_id: sessionId,
    p_payment_intent: readString(session.payment_intent),
    p_currency: session.currency,
    p_tax_cents: taxCents,
    p_shipping_cents: shippingCents,
    p_total_cents: totalCents,
    p_shipping_address: nested(nested(session.collected_information, "shipping_details"), "address") ?? null,
  });
  if (paidError) throw new Error(paidError.message);
  if (!orderId) throw new PaymentConsistencyError("No order matches this Stripe session.", "order_not_found");

  const { data: items, error: itemsError } = await settleQuery<OrderItemRow[]>(
    service.from("order_items").select("product_id, quantity").eq("order_id", orderId),
  );
  if (itemsError) throw new Error(itemsError.message);
  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { data: applied, error: inventoryError } = await service.rpc("apply_inventory_decrement", {
      p_order_id: orderId,
      p_product_id: item.product_id,
      p_qty: item.quantity,
    });
    if (inventoryError) throw new Error(inventoryError.message);
    if (applied === false) {
      const { error: auditError } = await settleQuery(
        service.from("audit_events").insert({
          action: "inventory_shortfall",
          entity_type: "order",
          entity_id: orderId,
          metadata: { product_id: item.product_id, quantity: item.quantity, stripe_event_id: eventId },
        }),
      );
      if (auditError) throw new Error(auditError.message);
    }
  }

  if (order.order_kind !== "contract_installment") {
    const { data: organization, error: orgError } = await settleQuery<OrganizationRow | null>(
      service.from("organizations").select("commercial_model").eq("id", order.organization_id).maybeSingle(),
    );
    if (orgError) throw new Error(orgError.message);
    const settlement = draftSettlement({
      commercialModel: organization?.commercial_model ?? null,
      customerTotalCents: totalCents ?? 0,
      taxCents: taxCents ?? 0,
      shippingCents: shippingCents ?? 0,
      purchaseCostCents: null,
      commissionBaseCents: null,
    });
    if (settlement) {
      const { error: settlementError } = await settleQuery(
        service.from("settlement_records").insert({
          order_id: order.id,
          organization_id: order.organization_id,
          commercial_model: settlement.commercialModel,
          record_kind: settlement.recordKind,
          rule_version: settlement.ruleVersion,
          customer_total_cents: settlement.customerTotalCents,
          tax_cents: settlement.taxCents,
          shipping_cents: settlement.shippingCents,
          processor_fee_cents: settlement.processorFeeCents,
          purchase_cost_cents: settlement.purchaseCostCents,
          commission_base_cents: settlement.commissionBaseCents,
          commission_cents: settlement.commissionCents,
          status: settlement.status,
          notes: settlement.notes,
        }),
      );
      if (settlementError && !/duplicate|unique/i.test(settlementError.message)) {
        throw new Error(settlementError.message);
      }
    }
  }

  const { error: auditError } = await settleQuery(
    service.from("audit_events").insert({
      action: "purchase_completed",
      entity_type: "order",
      entity_id: orderId,
      metadata: { stripe_event_id: eventId },
    }),
  );
  if (auditError) throw new Error(auditError.message);
}

async function markCheckoutFailed(service: Service, session: StripeObject) {
  const sessionId = readString(session.id);
  const { data: order, error } = await settleQuery<{ id: string } | null>(
    service.from("orders").select("id").eq("stripe_checkout_session_id", sessionId).maybeSingle(),
  );
  if (error) throw new Error(error.message);
  if (!order) throw new PaymentConsistencyError("No order matches this Stripe session.", "order_not_found");
  const result = await settleQuery(
    service.from("orders").update({ payment_status: "failed", status: "cancelled" }).eq("id", order.id),
  );
  if (result.error) throw new Error(result.error.message);
}

async function applyRefundObject(service: Service, refund: StripeObject, forcedStatus?: "failed") {
  const paymentIntent =
    readString(refund.payment_intent) ??
    readString(nested(refund.payment_intent, "id"));
  const status = forcedStatus ?? (refund.status === "succeeded" ? "succeeded" : refund.status === "failed" ? "failed" : "pending");
  const refundId = readString(refund.id);
  if (!refundId || !paymentIntent) throw new Error("Refund is missing an ID or payment intent.");
  const { data: refundRowId, error } = await service.rpc("apply_refund", {
    p_stripe_refund_id: refundId,
    p_payment_intent: paymentIntent,
    p_amount_cents: refund.amount,
    p_currency: refund.currency,
    p_status: status,
  });
  if (error) throw new Error(error.message);

  if (status === "succeeded") {
    const { data: order, error: orderError } = await settleQuery<OrderRow | null>(
      service.from("orders").select("id, organization_id, total_cents, tax_cents, shipping_cents").eq("stripe_payment_intent_id", paymentIntent).maybeSingle(),
    );
    if (orderError) throw new Error(orderError.message);
    if (order) {
      const { data: organization, error: orgError } = await settleQuery<OrganizationRow | null>(
        service.from("organizations").select("commercial_model").eq("id", order.organization_id).maybeSingle(),
      );
      if (orgError) throw new Error(orgError.message);
      const settlement = draftSettlement({
        commercialModel: organization?.commercial_model ?? null,
        customerTotalCents: readNumber(refund.amount) ?? 0,
        taxCents: 0,
        shippingCents: 0,
        recordKind: "refund_adjustment",
        purchaseCostCents: null,
        commissionBaseCents: null,
      });
      if (settlement) {
        const { error: settlementError } = await settleQuery(
          service.from("settlement_records").insert({
            order_id: order.id,
            organization_id: order.organization_id,
            commercial_model: settlement.commercialModel,
            record_kind: "refund_adjustment",
            related_refund_id: refundRowId,
            rule_version: settlement.ruleVersion,
            customer_total_cents: settlement.customerTotalCents,
            tax_cents: settlement.taxCents,
            shipping_cents: settlement.shippingCents,
            purchase_cost_cents: settlement.purchaseCostCents,
            commission_base_cents: settlement.commissionBaseCents,
            commission_cents: settlement.commissionCents,
            status: settlement.status,
            notes: settlement.notes,
          }),
        );
        if (settlementError && !/duplicate|unique/i.test(settlementError.message)) {
          throw new Error(settlementError.message);
        }
      }
    }
  }
}

async function applyChargeRefunds(service: Service, charge: StripeObject) {
  const refunds = nested(charge.refunds, "data");
  if (!Array.isArray(refunds)) return;
  for (const refund of refunds) {
    if (!isRecord(refund)) continue;
    await applyRefundObject(service, {
      ...refund,
      payment_intent: charge.payment_intent,
      currency: refund.currency ?? charge.currency,
    });
  }
}
