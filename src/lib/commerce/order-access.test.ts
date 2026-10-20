import { describe, expect, it } from "vitest";
import type { SessionContext } from "@/lib/types";
import {
  CHECKOUT_RETURN_SELECT,
  PARTNER_ORDERS_SELECT,
  asCheckoutReturnOrder,
  canViewOrder,
  checkoutReturnKind,
  classifyOrderList,
  isPaymentConfirmed,
  purchasedQuantitiesToSubtract,
} from "./order-access";

const session: SessionContext = {
  userId: "user-1",
  email: null,
  fullName: null,
  isPlatformAdmin: false,
  organizationId: "org-a",
  organizationName: "Salon A",
  verificationStatus: "approved",
  orgRole: "member",
  locations: [{ id: "loc-1", name: "Store 1", city: null, state: null, role: "buyer" }],
  activeLocationId: "loc-1",
};

describe("partner order access", () => {
  it("does not embed products into the order history query", () => {
    expect(PARTNER_ORDERS_SELECT).toContain("subtotal_cents");
    expect(PARTNER_ORDERS_SELECT).toContain("total_cents");
    expect(PARTNER_ORDERS_SELECT).toContain("refunded_cents");
    expect(PARTNER_ORDERS_SELECT).toContain("order_items(name, quantity, sku, product_id, unit_price_cents)");
    expect(PARTNER_ORDERS_SELECT).not.toContain("products(");
    expect(CHECKOUT_RETURN_SELECT).not.toContain("products(");
  });

  it("distinguishes query failure from a real empty list", () => {
    expect(classifyOrderList({ configured: true, error: { code: "42501" }, data: [] })).toEqual({
      status: "error",
      orders: [],
    });
    expect(classifyOrderList({ configured: false, data: [] }).status).toBe("error");
    expect(classifyOrderList({ configured: true, error: null, data: [] }).status).toBe("empty");
    expect(classifyOrderList({ configured: true, error: null, data: [{ id: "1" }] }).status).toBe("ready");
  });

  it("rejects orders from another organization or unauthorized store", () => {
    expect(canViewOrder(session, { organization_id: "org-b", location_id: "loc-1" })).toBe(false);
    expect(canViewOrder(session, { organization_id: "org-a", location_id: "loc-2" })).toBe(false);
    expect(canViewOrder(session, { organization_id: "org-a", location_id: "loc-1" })).toBe(true);
    expect(canViewOrder({ ...session, userId: null }, { organization_id: "org-a", location_id: "loc-1" })).toBe(false);
  });

  it("only treats confirmed payment statuses as paid", () => {
    expect(isPaymentConfirmed("pending")).toBe(false);
    expect(isPaymentConfirmed("paid")).toBe(true);
    expect(checkoutReturnKind({ queryError: true, order: null, session })).toBe("query_failed");
    expect(checkoutReturnKind({ order: { payment_status: "pending", organization_id: "org-a", location_id: "loc-1" }, session })).toBe("pending");
    expect(checkoutReturnKind({ order: { payment_status: "paid", organization_id: "org-b", location_id: "loc-1" }, session })).toBe("missing");
  });

  it("reads checkout return rows without keeping unrelated profile fields", () => {
    const order = asCheckoutReturnOrder({
      id: "ord_1",
      order_number: "DB-1",
      payment_status: "paid",
      status: "paid",
      organization_id: "org-a",
      location_id: "loc-1",
      email: "hidden@example.com",
      order_items: [{ product_id: "p1", quantity: 2 }],
    });
    expect(order?.order_number).toBe("DB-1");
    expect(JSON.stringify(order)).not.toContain("hidden@");
  });

  it("intersects checkout snapshot with paid items so later cart edits are kept", () => {
    expect(purchasedQuantitiesToSubtract(
      [{ productId: "a", quantity: 2 }, { productId: "b", quantity: 1 }],
      [{ productId: "a", quantity: 2 }, { productId: "c", quantity: 9 }],
    )).toEqual([{ productId: "a", quantity: 2 }]);
  });

  it("does not subtract a same-SKU line that was removed and added again after checkout", () => {
    expect(purchasedQuantitiesToSubtract(
      [{ productId: "a", quantity: 2, lineId: "line-paid" }],
      [{ productId: "a", quantity: 2 }],
      [{ productId: "a", quantity: 1, lineId: "line-new" }],
    )).toEqual([]);
  });
});
