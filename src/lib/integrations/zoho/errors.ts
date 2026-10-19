export class ZohoError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_configured"
      | "unauthorized"
      | "rate_limited"
      | "temporary"
      | "invalid_response"
      | "conflict"
      | "not_found",
    public readonly retryable = false,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ZohoError";
  }
}

export function zohoErrorFromResponse(status: number, body: string) {
  if (status === 401 || status === 403) {
    return new ZohoError("Zoho rejected the access token.", "unauthorized", true, status);
  }
  if (status === 429) {
    return new ZohoError("Zoho rate limit reached.", "rate_limited", true, status);
  }
  if (status >= 500) {
    return new ZohoError("Zoho is temporarily unavailable.", "temporary", true, status);
  }
  return new ZohoError(body.slice(0, 240) || "Zoho request failed.", "invalid_response", false, status);
}

export function redactZohoLog(value: unknown) {
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  return raw
    .replace(/access_token=([^&\s]+)/gi, "access_token=[redacted]")
    .replace(/refresh_token=([^&\s]+)/gi, "refresh_token=[redacted]")
    .replace(/"access_token"\s*:\s*"[^"]+"/gi, '"access_token":"[redacted]"')
    .replace(/"refresh_token"\s*:\s*"[^"]+"/gi, '"refresh_token":"[redacted]"')
    .replace(/Zoho-oauthtoken\s+\S+/gi, "Zoho-oauthtoken [redacted]");
}
