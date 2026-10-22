export const AUTH_ERROR_KEYS = [
  "otp_expired",
  "access_denied",
  "missing_code",
  "missing_verifier",
  "exchange_failed",
  "not_configured",
  "implicit_link",
  "session_required",
  "rate_limited",
  "unavailable",
] as const;

export type AuthErrorKey = (typeof AUTH_ERROR_KEYS)[number];

const AUTH_ERROR_MESSAGES: Record<AuthErrorKey, string> = {
  otp_expired: "This reset or confirmation link has expired. Request a new email and use the latest link once.",
  access_denied: "This sign-in request was denied. Request a new email if you still need access.",
  missing_code: "This reset link is incomplete. Request a new email from the sign-in page.",
  missing_verifier: "This browser is missing the reset verification cookie. Open Forgot password on this same site and browser, then use the newest email once.",
  exchange_failed: "The reset link could not be verified. Request a new email and try again.",
  not_configured: "Account services are not configured yet.",
  implicit_link: "This email link is not compatible with the current sign-in flow. Request a new reset email from this website.",
  session_required: "Sign in with a valid reset link before choosing a new password.",
  rate_limited: "Please wait before requesting another reset email.",
  unavailable: "Password reset is temporarily unavailable. Try again later.",
};

export const AUTH_STATUS_MESSAGES = {
  password_updated: "Your password was updated. Sign in with the new password.",
  reset_sent: "If an account exists, a reset email will be sent.",
} as const;

export function isAuthErrorKey(value: string | null | undefined): value is AuthErrorKey {
  return Boolean(value && (AUTH_ERROR_KEYS as readonly string[]).includes(value));
}

export function authErrorMessage(key: string | null | undefined) {
  if (!isAuthErrorKey(key)) return null;
  return AUTH_ERROR_MESSAGES[key];
}

export function authStatusMessage(status: string | null | undefined) {
  if (status === "password_updated") return AUTH_STATUS_MESSAGES.password_updated;
  if (status === "reset_sent") return AUTH_STATUS_MESSAGES.reset_sent;
  return null;
}

export function classifyExchangeError(error: { code?: string | null; message?: string | null } | null) {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();
  if (code === "otp_expired" || message.includes("otp_expired") || message.includes("expired")) {
    return "otp_expired" satisfies AuthErrorKey;
  }
  if (code === "access_denied") return "access_denied" satisfies AuthErrorKey;
  if (code === "pkce_code_verifier_not_found" || message.includes("code verifier") || message.includes("pkce")) {
    return "missing_verifier" satisfies AuthErrorKey;
  }
  return "exchange_failed" satisfies AuthErrorKey;
}

export function classifyLoginFailure(error: { code?: string | null; status?: number | null; message?: string | null } | null) {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return {
      userMessage: "Invalid email or password.",
      logCode: code || "invalid_credentials",
      kind: "invalid_credentials" as const,
    };
  }
  return {
    userMessage: "Sign-in is temporarily unavailable. Try again later.",
    logCode: code || "auth_api_error",
    kind: "api" as const,
  };
}

export function classifyResetSendError(error: { code?: string | null; status?: number | null } | null) {
  const code = error?.code ?? "";
  const status = error?.status ?? null;
  if (code === "over_email_send_rate_limit" || status === 429) {
    return { userMessage: AUTH_ERROR_MESSAGES.rate_limited, logCode: code || "over_email_send_rate_limit", key: "rate_limited" as const };
  }
  if (status && status >= 500) {
    return { userMessage: AUTH_ERROR_MESSAGES.unavailable, logCode: code || "reset_unavailable", key: "unavailable" as const };
  }
  if (code) {
    return { userMessage: AUTH_ERROR_MESSAGES.unavailable, logCode: code, key: "unavailable" as const };
  }
  return null;
}

export function mapCallbackQueryError(error: string | null, errorCode: string | null): AuthErrorKey | null {
  const value = (errorCode || error || "").toLowerCase();
  if (!value) return null;
  if (value === "otp_expired" || value.includes("otp_expired")) return "otp_expired";
  if (value === "access_denied" || value.includes("access_denied")) return "access_denied";
  if (isAuthErrorKey(value)) return value;
  return "exchange_failed";
}
