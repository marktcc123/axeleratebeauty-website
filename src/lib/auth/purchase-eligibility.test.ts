import { describe, expect, it } from "vitest";
import {
  canPurchase,
  isAwaitingManualActivation,
  nextPriceTierWithoutDowngrade,
  selfServeOrganizationInsert,
} from "./purchase-eligibility";

describe("self-serve Tier 3 registration defaults", () => {
  it("assigns approved + tier 3 server-side and never binds a commercial model", () => {
    const row = selfServeOrganizationInsert({
      name: "Belle Brows & Beauty",
      businessType: "salon",
      website: null,
      phone: "555",
      addressLine1: "1 Main",
      city: "LA",
      state: "CA",
      postalCode: "90001",
      licenseInfo: null,
    });
    expect(row.verification_status).toBe("approved");
    expect(row.price_tier).toBe(3);
    expect(row.commercial_model).toBeNull();
    expect(row.name).toBe("Belle Brows & Beauty");
  });
});

describe("canPurchase gates", () => {
  const base = {
    userId: "u1",
    organizationId: "o1",
    activeLocationId: "l1",
    verificationStatus: "approved" as const,
    emailVerified: true,
  };

  it("allows approved self-serve buyers with a store and verified email", () => {
    expect(canPurchase(base)).toBe(true);
  });

  it("blocks pending historical accounts and unverified email", () => {
    expect(canPurchase({ ...base, verificationStatus: "pending" })).toBe(false);
    expect(canPurchase({ ...base, emailVerified: false })).toBe(false);
    expect(canPurchase({ ...base, verificationStatus: "suspended" })).toBe(false);
    expect(isAwaitingManualActivation("pending")).toBe(true);
  });

  it("does not trust missing org or store", () => {
    expect(canPurchase({ ...base, organizationId: null })).toBe(false);
    expect(canPurchase({ ...base, activeLocationId: null })).toBe(false);
  });
});

describe("price tier downgrade guard", () => {
  it("keeps Tier 1 / Tier 2 when a lower tier is requested", () => {
    expect(nextPriceTierWithoutDowngrade(1, 3)).toBe(1);
    expect(nextPriceTierWithoutDowngrade(2, 3)).toBe(2);
    expect(nextPriceTierWithoutDowngrade(3, 2)).toBe(2);
    expect(nextPriceTierWithoutDowngrade(null, 3)).toBe(3);
  });
});
