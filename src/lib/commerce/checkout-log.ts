export type CheckoutLogStage =
  | "order_create"
  | "order_items_create"
  | "stripe_session_create"
  | "order_session_link";

export function redactCheckoutLog(input: {
  stage: CheckoutLogStage;
  code?: string | null;
  status?: number | null;
  orderId?: string | null;
  orderNumber?: string | null;
  stripeSessionId?: string | null;
}) {
  return {
    stage: input.stage,
    code: input.code ?? null,
    status: input.status ?? null,
    orderId: input.orderId ?? null,
    orderNumber: input.orderNumber ?? null,
    stripeSessionId: input.stripeSessionId ?? null,
  };
}

export function logCheckoutEvent(input: {
  stage: CheckoutLogStage;
  code?: string | null;
  status?: number | null;
  orderId?: string | null;
  orderNumber?: string | null;
  stripeSessionId?: string | null;
}) {
  console.info("checkout.event", redactCheckoutLog(input));
}

export function stripeErrorFields(error: unknown) {
  if (!error || typeof error !== "object") {
    return { code: "stripe_error", status: null as number | null };
  }
  const record = error as { code?: unknown; statusCode?: unknown; type?: unknown };
  return {
    code: typeof record.code === "string" ? record.code : typeof record.type === "string" ? record.type : "stripe_error",
    status: typeof record.statusCode === "number" ? record.statusCode : null,
  };
}

export function isNextRedirectError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT"),
  );
}
