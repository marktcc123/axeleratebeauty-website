import { describe, expect, it, vi } from "vitest";
import { PaymentConsistencyError } from "./payments";
import { handleStripeEvent } from "./stripe-webhook";

function createService(overrides: {
  claim?: string;
  order?: Record<string, unknown> | null;
  rpcErrors?: Record<string, string>;
  writeErrors?: Record<string, string>;
}) {
  const rpc = vi.fn(async (fn: string) => {
    if (overrides.rpcErrors?.[fn]) return { data: null, error: { message: overrides.rpcErrors[fn] } };
    if (fn === "claim_webhook_event") return { data: overrides.claim ?? "claimed", error: null };
    if (fn === "mark_order_paid") return { data: overrides.order?.id ?? null, error: null };
    if (fn === "apply_inventory_decrement") return { data: true, error: null };
    if (fn === "apply_refund") return { data: "refund_row", error: null };
    return { data: null, error: null };
  });

  const from = vi.fn((table: string) => {
    const result = {
      data: table === "orders" ? overrides.order ?? null : table === "order_items" ? [] : { commercial_model: "commission" },
      error: overrides.writeErrors?.[table] ? { message: overrides.writeErrors[table] } : null,
    };
    const builder = {
      select: () => builder,
      eq: () => builder,
      maybeSingle: async () => result,
      insert: async () => result,
      update: () => builder,
      then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
    };
    return builder;
  });

  return { rpc, from };
}

const paidSession = {
  id: "cs_1",
  payment_status: "paid",
  payment_intent: "pi_1",
  currency: "usd",
  amount_total: 12000,
  total_details: { amount_tax: 800, amount_shipping: 1200 },
  shipping_cost: { amount_total: 1200 },
};

describe("stripe webhook recovery", () => {
  it("does not complete an in-progress claim", async () => {
    const service = createService({ claim: "in_progress" });
    const result = await handleStripeEvent(service, {
      id: "evt_busy",
      type: "checkout.session.completed",
      data: { object: paidSession },
    });
    expect(result.retry).toBe(true);
    expect(service.rpc).not.toHaveBeenCalledWith("complete_webhook_event", expect.anything());
  });

  it("treats a missing order as a failure, not success", async () => {
    const service = createService({ order: null });
    await expect(
      handleStripeEvent(service, {
        id: "evt_missing",
        type: "checkout.session.completed",
        data: { object: paidSession },
      }),
    ).rejects.toBeInstanceOf(PaymentConsistencyError);
    expect(service.rpc).toHaveBeenCalledWith(
      "fail_webhook_event",
      expect.objectContaining({ p_event_id: "evt_missing" }),
    );
  });

  it("fails a paid event when tax is unknown instead of treating it as zero", async () => {
    const service = createService({
      order: {
        id: "ord_1",
        currency: "usd",
        subtotal_cents: 10000,
        total_cents: 10000,
        payment_status: "pending",
        stripe_checkout_session_id: "cs_1",
        organization_id: "org_1",
        order_kind: "replenishment",
      },
    });
    await expect(
      handleStripeEvent(service, {
        id: "evt_tax",
        type: "checkout.session.completed",
        data: {
          object: {
            ...paidSession,
            total_details: { amount_tax: null, amount_shipping: 1200 },
          },
        },
      }),
    ).rejects.toBeInstanceOf(PaymentConsistencyError);
  });

  it("retries after a failed mark-paid attempt", async () => {
    const service = createService({
      claim: "reclaimed",
      order: {
        id: "ord_1",
        currency: "usd",
        subtotal_cents: 10000,
        total_cents: 10000,
        payment_status: "pending",
        stripe_checkout_session_id: "cs_1",
        organization_id: "org_1",
        order_kind: "replenishment",
      },
    });
    const result = await handleStripeEvent(service, {
      id: "evt_retry",
      type: "checkout.session.async_payment_succeeded",
      data: { object: paidSession },
    });
    expect(result.received).toBe(true);
    expect(service.rpc).toHaveBeenCalledWith("mark_order_paid", expect.objectContaining({ p_checkout_session_id: "cs_1" }));
    expect(service.rpc).toHaveBeenCalledWith("complete_webhook_event", expect.objectContaining({ p_event_id: "evt_retry" }));
  });
});
