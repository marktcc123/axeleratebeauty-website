import { canAccessLocation, type CartItem, type SessionContext } from "@/lib/types";

export const PARTNER_ORDERS_SELECT =
  "id, order_number, created_at, subtotal_cents, total_cents, tax_cents, shipping_cents, tax_pending, shipping_pending, payment_status, fulfillment_status, status, tracking_number, order_kind, location_id, organization_id, order_items(name, quantity, sku, product_id, unit_price_cents)";

export const CHECKOUT_RETURN_SELECT =
  "id, order_number, payment_status, status, organization_id, location_id, order_items(product_id, quantity)";

export type OrderListStatus = "error" | "empty" | "ready";

export function classifyOrderList<T>(input: {
  configured: boolean;
  error?: { code?: string | null; message?: string | null } | null;
  data?: T[] | null;
}): { status: OrderListStatus; orders: T[] } {
  if (!input.configured || input.error) {
    return { status: "error", orders: [] };
  }
  if (!input.data || input.data.length === 0) {
    return { status: "empty", orders: [] };
  }
  return { status: "ready", orders: input.data };
}

export type CheckoutReturnOrder = {
  id: string;
  order_number: string;
  payment_status: string;
  status: string;
  organization_id: string | null;
  location_id: string | null;
  order_items: { product_id: string | null; quantity: number }[] | null;
};

export function asCheckoutReturnOrder(value: unknown): CheckoutReturnOrder | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.order_number !== "string" || typeof row.payment_status !== "string") {
    return null;
  }
  return {
    id: row.id,
    order_number: row.order_number,
    payment_status: row.payment_status,
    status: typeof row.status === "string" ? row.status : "",
    organization_id: typeof row.organization_id === "string" ? row.organization_id : null,
    location_id: typeof row.location_id === "string" ? row.location_id : null,
    order_items: Array.isArray(row.order_items)
      ? row.order_items.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const entry = item as { product_id?: unknown; quantity?: unknown };
          return [{
            product_id: typeof entry.product_id === "string" ? entry.product_id : null,
            quantity: Number(entry.quantity) || 0,
          }];
        })
      : [],
  };
}

export function canViewOrder(
  session: SessionContext,
  order: { organization_id?: string | null; location_id?: string | null } | null,
) {
  if (!session.userId || !session.organizationId || !order) return false;
  if (order.organization_id !== session.organizationId) return false;
  if (order.location_id && !canAccessLocation(session, order.location_id)) return false;
  return true;
}

export function isPaymentConfirmed(paymentStatus: string | null | undefined) {
  return paymentStatus === "paid" || paymentStatus === "partially_refunded" || paymentStatus === "refunded";
}

export function checkoutReturnKind(input: {
  queryError?: boolean;
  order: { payment_status: string; organization_id?: string | null; location_id?: string | null } | null;
  session: SessionContext;
}): "query_failed" | "missing" | "pending" | "paid" | "failed" {
  if (input.queryError) return "query_failed";
  if (!canViewOrder(input.session, input.order) || !input.order) return "missing";
  if (isPaymentConfirmed(input.order.payment_status)) return "paid";
  if (input.order.payment_status === "failed") return "failed";
  return "pending";
}

export function checkoutReturnTitle(kind: "query_failed" | "missing" | "pending" | "paid" | "failed") {
  return {
    query_failed: "Order status could not be loaded.",
    missing: "Order not found.",
    pending: "Payment is still processing.",
    paid: "Payment received.",
    failed: "Payment was not completed.",
  }[kind];
}

export function purchasedQuantitiesToSubtract(snapshot: CartItem[], paidItems: CartItem[]): CartItem[] {
  const paidById = new Map(paidItems.map((item) => [item.productId, item.quantity]));
  return snapshot.flatMap((item) => {
    const paidQty = paidById.get(item.productId);
    if (!paidQty || item.quantity < 1) return [];
    return [{ productId: item.productId, quantity: Math.min(item.quantity, paidQty) }];
  });
}
