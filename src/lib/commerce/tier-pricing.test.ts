import { describe, expect, it } from "vitest";
import { resolveAuthorizedPrice, tierPriceFromTier1, type OfferRow } from "./tier-pricing";

const now = new Date("2026-10-19T12:00:00Z");

function offer(partial: Partial<OfferRow> & Pick<OfferRow, "priceCents">): OfferRow {
  return {
    productId: "p1",
    currency: "USD",
    organizationId: null,
    locationId: null,
    priceTier: 1,
    effectiveFrom: "2026-01-01T00:00:00Z",
    effectiveTo: null,
    ...partial,
  };
}

describe("tier pricing", () => {
  it("computes Tier 2 and Tier 3 from Tier 1 without using a flat low price", () => {
    expect(tierPriceFromTier1(10000, 1)).toBe(10000);
    expect(tierPriceFromTier1(10000, 2)).toBe(12000);
    expect(tierPriceFromTier1(10000, 3)).toBe(14400);
  });

  it("prefers location, then headquarters, then tier", () => {
    const offers = [
      offer({ priceCents: 10000, priceTier: 1 }),
      offer({ priceCents: 15000, organizationId: "org1", priceTier: null }),
      offer({ priceCents: 18000, locationId: "loc1", organizationId: "org1", priceTier: null }),
    ];
    expect(
      resolveAuthorizedPrice(offers, { productId: "p1", organizationId: "org1", locationId: "loc1", priceTier: 2, now })
        ?.priceCents,
    ).toBe(18000);
    expect(
      resolveAuthorizedPrice(offers, { productId: "p1", organizationId: "org1", locationId: "loc2", priceTier: 2, now })
        ?.priceCents,
    ).toBe(15000);
  });

  it("uses the tier formula when only a Tier 1 list price exists", () => {
    const resolved = resolveAuthorizedPrice([offer({ priceCents: 20000, priceTier: 1 })], {
      productId: "p1",
      organizationId: "org1",
      locationId: "loc1",
      priceTier: 3,
      now,
    });
    expect(resolved?.source).toBe("tier_formula");
    expect(resolved?.priceCents).toBe(28800);
  });

  it("rejects expired offers and missing customer tiers", () => {
    const expired = offer({ priceCents: 10000, effectiveTo: "2026-01-02T00:00:00Z" });
    expect(
      resolveAuthorizedPrice([expired], { productId: "p1", organizationId: "org1", locationId: "loc1", priceTier: 1, now }),
    ).toBeNull();
    expect(
      resolveAuthorizedPrice([offer({ priceCents: 10000 })], {
        productId: "p1",
        organizationId: "org1",
        locationId: "loc1",
        priceTier: null,
        now,
      }),
    ).toBeNull();
  });
});
