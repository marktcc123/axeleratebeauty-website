import { getZohoConfig } from "./config";
import { ZohoError, redactZohoLog, zohoErrorFromResponse } from "./errors";

type TokenCache = {
  accessToken: string;
  apiDomain: string;
  expiresAt: number;
};

let cache: TokenCache | null = null;

export async function getZohoAccessContext() {
  if (cache && cache.expiresAt > Date.now() + 60_000) {
    return cache;
  }

  const config = getZohoConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
  });

  const response = await fetch(`${config.accountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("zoho.oauth.refresh_failed", redactZohoLog(text));
    throw zohoErrorFromResponse(response.status, text);
  }

  let payload: { access_token?: string; api_domain?: string; expires_in?: number; error?: string };
  try {
    payload = JSON.parse(text);
  } catch {
    throw new ZohoError("Zoho token response was not JSON.", "invalid_response");
  }

  if (!payload.access_token) {
    throw new ZohoError(payload.error ?? "Zoho did not return an access token.", "unauthorized", true);
  }

  cache = {
    accessToken: payload.access_token,
    apiDomain: payload.api_domain ?? config.fallbackApiDomain,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };
  return cache;
}

export function invalidateZohoAccessToken() {
  cache = null;
}

export async function zohoRequest(path: string, init: RequestInit = {}, attempt = 0): Promise<Response> {
  const context = await getZohoAccessContext();
  const url = path.startsWith("http") ? path : `${context.apiDomain.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${context.accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if ((response.status === 401 || response.status === 403) && attempt === 0) {
    invalidateZohoAccessToken();
    return zohoRequest(path, init, 1);
  }

  return response;
}
