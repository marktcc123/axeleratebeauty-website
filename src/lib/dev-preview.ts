import type { SessionContext } from "@/lib/types";

export function isLocalPreviewHost(hostname?: string | null) {
  if (!hostname) return false;
  const host = hostname.split(":")[0]?.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function isDevPreviewEnabled(hostname?: string | null) {
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") return false;
  if (process.env.DEV_PREVIEW_AUTH !== "true") return false;
  return isLocalPreviewHost(hostname);
}

export const DEV_PREVIEW_SESSION: SessionContext = {
  userId: "dev-preview-user",
  email: "preview@localhost",
  fullName: "Local Preview",
  isPlatformAdmin: true,
  organizationId: "dev-preview-org",
  organizationName: "Preview Salon",
  verificationStatus: "approved",
  orgRole: "company_admin",
  locations: [
    {
      id: "dev-preview-location",
      name: "Preview Store",
      city: "Los Angeles",
      state: "CA",
      role: "hq_admin",
    },
  ],
  activeLocationId: "dev-preview-location",
};
