import { describe, expect, it } from "vitest";
import { orderMoneyPresentation } from "./order-money";

const base = {
  subtotal_cents: 1200,
  tax_cents: 0,
  shipping_cents: 500,
  total_cents: 1700,
  tax_pending: false,
  shipping_pending: false,
};

describe("orderMoneyPresentation", () => {
  it("does not present unpaid totals as paid", () => {
    const pending = orderMoneyPresentation({ ...base, payment_status: "pending", refunded_cents: 0 });
    expect(pending.showPaidAmount).toBe(false);
    expect(pending.paidCents).toBeNull();
    expect(pending.orderTotalCaption).toContain("awaiting payment");
    expect(pending.showRefunded).toBe(false);

    const failed = orderMoneyPresentation({ ...base, payment_status: "failed", refunded_cents: 0 });
    expect(failed.showPaidAmount).toBe(false);
    expect(failed.orderTotalCaption).toContain("not paid");
  });

  it("shows refunded and net paid from persisted refunded_cents only", () => {
    const full = orderMoneyPresentation({
      ...base,
      payment_status: "refunded",
      refunded_cents: 1700,
    });
    expect(full.showPaidAmount).toBe(true);
    expect(full.paidCents).toBe(1700);
    expect(full.showRefunded).toBe(true);
    expect(full.refundedCents).toBe(1700);
    expect(full.netPaidCents).toBe(0);

    const partial = orderMoneyPresentation({
      ...base,
      payment_status: "partially_refunded",
      refunded_cents: 500,
    });
    expect(partial.netPaidCents).toBe(1200);
  });

  it("ignores refund amounts when payment was never confirmed", () => {
    const view = orderMoneyPresentation({
      ...base,
      payment_status: "failed",
      refunded_cents: 500,
    });
    expect(view.showRefunded).toBe(false);
    expect(view.netPaidCents).toBeNull();
  });
});
