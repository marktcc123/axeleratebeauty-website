import type { VerificationStatus } from "@/lib/types";

/** Server-only defaults for new independent (non-invite) businesses. Never accept these from the client. */
export function selfServeOrganizationInsert(input: {
  name: string;
  businessType: string | null;
  website: string | null;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  licenseInfo: string | null;
}) {
  return {
    name: input.name,
    business_type: input.businessType,
    website: input.website,
    phone: input.phone,
    address_line1: input.addressLine1,
    city: input.city,
    state: input.state,
    postal_code: input.postalCode,
    license_info: input.licenseInfo,
    // Self-serve purchase after email verification — not an invite into an existing HQ.
    verification_status: "approved" as const,
    price_tier: 3 as const,
    // Never auto-bind Belle / Brow Arc / other commercial models from typed names.
    commercial_model: null,
  };
}

export type PurchaseGateInput = {
  userId?: string | null;
  organizationId?: string | null;
  activeLocationId?: string | null;
  verificationStatus?: VerificationStatus | null;
  emailVerified?: boolean;
};

/**
 * Purchase eligibility is separate from price tier and from HQ/store invites.
 * - suspended / rejected: blocked
 * - pending: historical manual queue — not auto-activated
 * - approved: may purchase when email verified + org + store present
 */
export function canPurchase(session: PurchaseGateInput | null | undefined) {
  if (!session?.userId || !session.organizationId || !session.activeLocationId) return false;
  if (session.emailVerified === false) return false;
  if (session.verificationStatus === "suspended" || session.verificationStatus === "rejected") return false;
  return session.verificationStatus === "approved";
}

export function isPurchaseSuspended(status: VerificationStatus | null | undefined) {
  return status === "suspended";
}

export function isAwaitingManualActivation(status: VerificationStatus | null | undefined) {
  return status === "pending" || status === "rejected";
}

/** Admin / mapping path: never lower an existing Tier 1 or Tier 2. */
export function nextPriceTierWithoutDowngrade(
  current: number | null | undefined,
  requested: number | null | undefined,
) {
  if (requested == null || ![1, 2, 3].includes(requested)) return current ?? null;
  if (current === 1 || current === 2) {
    if (requested > current) return current;
  }
  return requested;
}
