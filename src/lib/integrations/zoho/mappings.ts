export const KNOWN_ZOHO_ACCOUNT_CANDIDATES = [
  {
    label: "Brow Arc",
    zohoAccountId: "7644545000000710001",
    commercialModel: "commission" as const,
    note: "Commission sales. Verify the live Zoho Account before binding website permissions.",
  },
  {
    label: "Belle Brows & Beauty",
    zohoAccountId: "7644545000000710002",
    commercialModel: "wholesale" as const,
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
  verificationStatus: "website_admin",
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
