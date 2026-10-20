import { isPaymentConfirmed } from "@/lib/commerce/order-access";

export type OrderMoneyInput = {
  payment_status: string;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  refunded_cents: number | null | undefined;
  tax_pending?: boolean | null;
  shipping_pending?: boolean | null;
};

/**
 * Customer-facing money rows from persisted order fields only.
 * Never invent refunds or mark unpaid totals as paid.
 */
export function orderMoneyPresentation(order: OrderMoneyInput) {
  const confirmed = isPaymentConfirmed(order.payment_status);
  const refundedCents = Math.max(0, order.refunded_cents ?? 0);
  const totalCents = order.total_cents;
  const showRefundBlock = confirmed && refundedCents > 0;

  return {
    merchandiseCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    shippingPending: Boolean(order.shipping_pending),
    taxCents: order.tax_cents,
    taxPending: Boolean(order.tax_pending),
    orderTotalCents: totalCents,
    orderTotalCaption: confirmed
      ? "Order total"
      : order.payment_status === "failed"
        ? "Order total (not paid)"
        : "Order total (awaiting payment)",
    showPaidAmount: confirmed,
    paidCaption: showRefundBlock ? "Amount paid" : "Amount paid",
    paidCents: confirmed ? totalCents : null,
    showRefunded: showRefundBlock,
    refundedCents: showRefundBlock ? refundedCents : null,
    showNetPaid: showRefundBlock,
    netPaidCents: showRefundBlock ? Math.max(0, totalCents - refundedCents) : null,
  };
}
