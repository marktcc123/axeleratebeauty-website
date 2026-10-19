export type WebhookClaim = "claimed" | "reclaimed" | "in_progress" | "succeeded";

export type PayableAmounts = {
  currency: string;
  subtotalCents: number;
  taxCents: number | null;
  shippingCents: number | null;
  totalCents: number | null;
};

export class PaymentConsistencyError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "order_not_found"
      | "currency_mismatch"
      | "amount_incomplete"
      | "amount_below_subtotal"
      | "paid_amount_mismatch"
      | "session_mismatch",
  ) {
    super(message);
    this.name = "PaymentConsistencyError";
  }
}

export function interpretClaim(result: string | null): WebhookClaim {
  if (result === "claimed" || result === "reclaimed" || result === "in_progress" || result === "succeeded") {
    return result;
  }
  throw new Error("Unknown webhook claim result.");
}

export function assertPayableMatch(
  order: {
    id: string;
    currency: string;
    subtotalCents: number;
    stripeCheckoutSessionId?: string | null;
    paymentStatus?: string | null;
    totalCents?: number | null;
  },
  paid: {
    checkoutSessionId: string;
    currency: string | null;
    taxCents: number | null;
    shippingCents: number | null;
    totalCents: number | null;
  },
) {
  if (order.stripeCheckoutSessionId && order.stripeCheckoutSessionId !== paid.checkoutSessionId) {
    throw new PaymentConsistencyError("Stripe session does not match the order.", "session_mismatch");
  }
  if (!paid.currency || paid.currency.toLowerCase() !== order.currency.toLowerCase()) {
    throw new PaymentConsistencyError("Currency does not match the order.", "currency_mismatch");
  }
  if (paid.totalCents == null || paid.taxCents == null || paid.shippingCents == null) {
    throw new PaymentConsistencyError("Paid tax, shipping, or total is incomplete.", "amount_incomplete");
  }
  if (paid.totalCents < order.subtotalCents) {
    throw new PaymentConsistencyError("Paid total is below the merchandise subtotal.", "amount_below_subtotal");
  }
  if (order.paymentStatus === "paid" && order.totalCents != null && order.totalCents !== paid.totalCents) {
    throw new PaymentConsistencyError("Paid total does not match the stored order.", "paid_amount_mismatch");
  }
}

export function checkoutReadiness(input: {
  stripeConfigured: boolean;
  automaticTax: boolean;
  shippingRateId?: string | null;
}) {
  if (!input.stripeConfigured) return { ok: false, reason: "Stripe is not configured." };
  if (!input.automaticTax) return { ok: false, reason: "Automatic tax is not configured, so checkout cannot start." };
  if (!input.shippingRateId) return { ok: false, reason: "A Stripe shipping rate is not configured, so checkout cannot start." };
  return { ok: true, reason: null };
}

export const STRIPE_CHECKOUT_PAYMENT_METHODS = ["card"] as const; // Stripe Checkout allowed_payment_method_types filter.
