import { describe, expect, it } from "vitest";
import { isNextRedirectError, redactCheckoutLog, stripeErrorFields } from "./checkout-log";

describe("checkout diagnostics", () => {
  it("keeps stage, codes, and association ids without secrets", () => {
    const log = redactCheckoutLog({
      stage: "stripe_session_create",
      code: "api_error",
      status: 500,
      orderId: "ord_1",
      orderNumber: "DB-TEST",
      stripeSessionId: "cs_test",
    });
    expect(log).toEqual({
      stage: "stripe_session_create",
      code: "api_error",
      status: 500,
      orderId: "ord_1",
      orderNumber: "DB-TEST",
      stripeSessionId: "cs_test",
    });
    expect(JSON.stringify(log)).not.toContain("sk_");
    expect(JSON.stringify(log)).not.toContain("cookie");
  });

  it("does not treat a Next.js redirect as a checkout failure", () => {
    expect(isNextRedirectError({ digest: "NEXT_REDIRECT;replace;https://checkout.stripe.com/c/pay/cs_test" })).toBe(true);
    expect(isNextRedirectError(new Error("card_declined"))).toBe(false);
  });

  it("reads Stripe error codes without copying the full object", () => {
    expect(stripeErrorFields({ code: "parameter_invalid_empty", statusCode: 400, message: "secret" })).toEqual({
      code: "parameter_invalid_empty",
      status: 400,
    });
  });
});
