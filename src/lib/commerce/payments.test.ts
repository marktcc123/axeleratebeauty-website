import { describe, expect, it } from "vitest";
import { PaymentConsistencyError, assertPayableMatch, checkoutReadiness, interpretClaim } from "./payments";

describe("payment consistency", () => {
  const order = {
    id: "ord_1",
    currency: "usd",
    subtotalCents: 10000,
    stripeCheckoutSessionId: "cs_1",
    paymentStatus: "pending",
    totalCents: 10000,
  };

  it("rejects an unknown session or incomplete paid amounts", () => {
    expect(() =>
      assertPayableMatch(order, {
        checkoutSessionId: "cs_other",
        currency: "usd",
        taxCents: 800,
        shippingCents: 1200,
        totalCents: 12000,
      }),
    ).toThrow(PaymentConsistencyError);
    expect(() =>
      assertPayableMatch(order, {
        checkoutSessionId: "cs_1",
        currency: "usd",
        taxCents: null,
        shippingCents: 0,
        totalCents: 10000,
      }),
    ).toThrow(/incomplete/);
  });

  it("does not treat a missing order as already processed", () => {
    expect(interpretClaim("succeeded")).toBe("succeeded");
    expect(interpretClaim("claimed")).toBe("claimed");
    expect(interpretClaim("reclaimed")).toBe("reclaimed");
    expect(interpretClaim("in_progress")).toBe("in_progress");
  });

  it("blocks checkout when tax or shipping is unknown", () => {
    expect(checkoutReadiness({ stripeConfigured: true, automaticTax: false, shippingRateId: "shr_1" }).ok).toBe(false);
    expect(checkoutReadiness({ stripeConfigured: true, automaticTax: true, shippingRateId: null }).ok).toBe(false);
    expect(checkoutReadiness({ stripeConfigured: true, automaticTax: true, shippingRateId: "shr_1" }).ok).toBe(true);
  });
});
