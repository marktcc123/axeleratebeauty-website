import { describe, expect, it } from "vitest";
import { getZohoConfig } from "./config";
import { ZohoError, redactZohoLog } from "./errors";

describe("zoho integration safety", () => {
  it("does not pretend CRM is connected without server credentials", () => {
    expect(() => getZohoConfig()).toThrow(ZohoError);
  });

  it("redacts tokens from logs", () => {
    const redacted = redactZohoLog('Authorization: Zoho-oauthtoken secret-token refresh_token=abc123');
    expect(redacted).not.toContain("secret-token");
    expect(redacted).not.toContain("abc123");
  });
});
