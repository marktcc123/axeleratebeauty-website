export type OrderLogStage = "orders_list" | "order_status" | "cart_clear";

export function redactOrderLog(input: {
  stage: OrderLogStage;
  code?: string | null;
  status?: number | null;
  orderId?: string | null;
  orderNumber?: string | null;
  organizationId?: string | null;
}) {
  return {
    stage: input.stage,
    code: input.code ?? null,
    status: input.status ?? null,
    orderId: input.orderId ?? null,
    orderNumber: input.orderNumber ?? null,
    organizationId: input.organizationId ?? null,
  };
}

export function logOrderEvent(input: {
  stage: OrderLogStage;
  code?: string | null;
  status?: number | null;
  orderId?: string | null;
  orderNumber?: string | null;
  organizationId?: string | null;
}) {
  console.info("order.event", redactOrderLog(input));
}
