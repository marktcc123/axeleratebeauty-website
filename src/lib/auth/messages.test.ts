import { describe, expect, it } from "vitest";
import { decideAuthCallback } from "./callback";
import { classifyLoginFailure, classifyResetSendError, authErrorMessage, authStatusMessage } from "./messages";
import { canUpdatePassword, formPassword, safeAuthNext } from "./paths";
import { exchangeFailureKey } from "./callback";

describe("auth recovery decisions", () => {
  it("keeps a generic message when reset sending is rate limited or misconfigured", () => {
    expect(classifyResetSendError({ code: "over_email_send_rate_limit", status: 429 })?.key).toBe("rate_limited");
    expect(classifyResetSendError({ code: "unexpected_failure", status: 500 })?.userMessage).toContain(
      "temporarily unavailable",
    );
    expect(classifyResetSendError(null)).toBeNull();
  });

  it("does not treat a missing auth code as success", () => {
    expect(
      decideAuthCallback({
        configured: true,
        code: null,
        error: null,
        errorCode: null,
        next: "/partner/reset",
      }),
    ).toEqual({ action: "error", key: "missing_code" });
    expect(
      decideAuthCallback({
        configured: false,
        code: "auth-code",
        error: null,
        errorCode: null,
        next: "/partner/reset",
      }),
    ).toEqual({ action: "error", key: "not_configured" });
  });

  it("maps expired and denied callback query errors without rendering URL text", () => {
    expect(
      decideAuthCallback({
        configured: true,
        code: null,
        error: "access_denied",
        errorCode: "otp_expired",
        next: "https://evil.example/phish",
      }),
    ).toEqual({ action: "error", key: "otp_expired" });
    expect(authErrorMessage("otp_expired")).not.toContain("http");
  });

  it("exchanges a present code onto a allowlisted next path", () => {
    expect(
      decideAuthCallback({
        configured: true,
        code: "auth-code",
        error: null,
        errorCode: null,
        next: "/partner/reset",
      }),
    ).toEqual({ action: "exchange", next: "/partner/reset", code: "auth-code" });
    expect(safeAuthNext("/partner/reset")).toBe("/partner/reset");
    expect(safeAuthNext("//evil.example")).toBe("/partner/dashboard");
    expect(safeAuthNext("/partner/unknown")).toBe("/partner/dashboard");
  });

  it("classifies login failures without leaking API details to the user", () => {
    const credentials = classifyLoginFailure({ code: "invalid_credentials", status: 400 });
    expect(credentials.kind).toBe("invalid_credentials");
    expect(credentials.userMessage).toBe("Invalid email or password.");
    const api = classifyLoginFailure({ code: "unexpected_failure", status: 503 });
    expect(api.kind).toBe("api");
    expect(api.userMessage).not.toContain("unexpected_failure");
  });

  it("keeps password characters untrimmed", () => {
    const formData = new FormData();
    formData.set("password", "  secret-pass  ");
    expect(formPassword(formData)).toBe("  secret-pass  ");
  });

  it("rejects password updates without an authenticated user", () => {
    expect(canUpdatePassword(null)).toBe(false);
    expect(canUpdatePassword("user-1")).toBe(true);
    expect(authStatusMessage("password_updated")).toContain("Sign in");
  });

  it("maps a missing PKCE verifier after code exchange", () => {
    expect(exchangeFailureKey({ code: "pkce_code_verifier_not_found", message: "code verifier not found" })).toBe(
      "missing_verifier",
    );
  });
});
