export const KNOWN_ZOHO_ACCOUNT_CANDIDATES = [
  {
    label: "Brow Arc",
    zohoAccountId: "7644545000000710001",
    commercialModel: "commission" as const,
    priceTier: 1 as const,
    note: "Commission sales. Verify the live Zoho Account before binding website permissions. Price tier 1.",
  },
  {
    label: "Belle Brows & Beauty",
    zohoAccountId: "7644545000000710002",
    commercialModel: "wholesale" as const,
    priceTier: 1 as const,
    note: "Wholesale resale. Verify the live Zoho Account before binding website permissions.",
  },
  {
    label: "AOETO USA INC.",
    zohoAccountId: "7644545000000710003",
    commercialModel: "internal" as const,
    note: "Internal / supplier counterpart. Not a website purchasing customer.",
  },
] as const;

export const FIELD_OWNERS = {
  inquiry: "website",
  organizationProfile: "website",
  /** Purchase gate for historical/suspended accounts — not the same as email verification or price tier. */
  verificationStatus: "website_admin",
  /**
   * Default Tier 3 on independent self-serve signup (website).
   * Tier 1 / Tier 2 upgrades are website_admin (or mapped Commerce price books later).
   * Zoho sync must never downgrade an existing Tier 1 / Tier 2.
   */
  priceTier: "website_admin",
  zohoAccountId: "admin_mapping",
  crmFollowUp: "zoho",
  productSku: "zoho_commerce",
  productPrice: "zoho_commerce",
  publicationStatus: "zoho_commerce",
  websiteOrder: "website",
  paymentStatus: "stripe",
  settlement: "internal",
} as const;

export function verificationToCrmStatus(status: string | null) {
  if (status === "approved") return "Approved Partner";
  if (status === "suspended") return "Suspended";
  if (status === "rejected") return "Rejected";
  return "Pending Review";
}

export function shouldIgnoreInboundCrmWrite(origin: string | null) {
  return origin === "website";
}
