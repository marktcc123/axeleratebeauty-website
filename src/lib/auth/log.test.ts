import { describe, expect, it } from "vitest";
import { redactAuthLog } from "./log";

describe("auth log redaction", () => {
  it("keeps only stage, code, status, and configuration", () => {
    expect(
      redactAuthLog({
        stage: "password_reset_request",
        code: "over_email_send_rate_limit",
        status: 429,
        configured: true,
      }),
    ).toEqual({
      stage: "password_reset_request",
      code: "over_email_send_rate_limit",
      status: 429,
      configured: true,
    });
  });
});
