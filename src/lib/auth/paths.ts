export const AUTH_NEXT_ALLOWLIST = [
  "/partner/reset",
  "/partner/dashboard",
  "/partner/catalog",
  "/partner/orders",
  "/partner/billing",
  "/partner/profile",
  "/partner/support",
  "/partner/login",
] as const;

export type AuthNextPath = (typeof AUTH_NEXT_ALLOWLIST)[number];

export function safeAuthNext(next: string | null | undefined, fallback: AuthNextPath = "/partner/dashboard"): AuthNextPath {
  if (!next) return fallback;
  const path = next.split("?")[0]?.split("#")[0] ?? "";
  if ((AUTH_NEXT_ALLOWLIST as readonly string[]).includes(path)) {
    return path as AuthNextPath;
  }
  return fallback;
}

export function authCallbackUrl(siteOrigin: string, next: AuthNextPath = "/partner/reset") {
  const origin = siteOrigin.replace(/\/$/, "");
  return `${origin}/auth/callback?next=${next}`;
}

export function loginErrorUrl(origin: string, key: string) {
  return new URL(`/partner/login?error=${encodeURIComponent(key)}`, origin);
}

export function formPassword(formData: FormData) {
  return String(formData.get("password") ?? "");
}

export function formEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

export function canUpdatePassword(userId: string | null | undefined) {
  return Boolean(userId);
}
