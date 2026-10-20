import { classifyExchangeError, mapCallbackQueryError, type AuthErrorKey } from "./messages";
import { safeAuthNext, type AuthNextPath } from "./paths";

export type AuthCallbackDecision =
  | { action: "error"; key: AuthErrorKey }
  | { action: "exchange"; next: AuthNextPath; code: string };

export function decideAuthCallback(input: {
  configured: boolean;
  code: string | null;
  error: string | null;
  errorCode: string | null;
  next: string | null;
}): AuthCallbackDecision {
  if (!input.configured) {
    return { action: "error", key: "not_configured" };
  }

  const queryError = mapCallbackQueryError(input.error, input.errorCode);
  if (queryError) {
    return { action: "error", key: queryError };
  }

  if (!input.code) {
    return { action: "error", key: "missing_code" };
  }

  return {
    action: "exchange",
    next: safeAuthNext(input.next, "/partner/reset"),
    code: input.code,
  };
}

export function exchangeFailureKey(error: { code?: string | null; message?: string | null } | null) {
  return classifyExchangeError(error);
}
