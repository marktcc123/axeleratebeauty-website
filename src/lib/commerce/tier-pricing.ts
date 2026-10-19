export type PriceTier = 1 | 2 | 3;

export type OfferRow = {
  productId: string;
  priceCents: number;
  currency: string;
  organizationId: string | null;
  locationId: string | null;
  priceTier: PriceTier | null;
  effectiveFrom: string;
  effectiveTo: string | null;
};

export function isOfferEffective(offer: OfferRow, now: Date) {
  const from = new Date(offer.effectiveFrom);
  if (Number.isNaN(from.getTime()) || from > now) return false;
  if (!offer.effectiveTo) return true;
  const to = new Date(offer.effectiveTo);
  return !Number.isNaN(to.getTime()) && to > now;
}

export function tierPriceFromTier1(tier1Cents: number, tier: PriceTier) {
  if (tier === 1) return tier1Cents;
  const tier2 = Math.round(tier1Cents * 1.2);
  if (tier === 2) return tier2;
  return Math.round(tier2 * 1.2);
}

export function offerSpecificity(offer: OfferRow) {
  if (offer.locationId) return 3;
  if (offer.organizationId) return 2;
  if (offer.priceTier) return 1;
  return 0;
}

export function resolveAuthorizedPrice(
  offers: OfferRow[],
  input: {
    productId: string;
    organizationId: string;
    locationId: string;
    priceTier: PriceTier | null;
    now?: Date;
  },
) {
  if (!input.priceTier) return null;
  const now = input.now ?? new Date();
  const active = offers.filter((offer) => offer.productId === input.productId && isOfferEffective(offer, now));

  const locationOffer = active.find((offer) => offer.locationId === input.locationId);
  if (locationOffer) return { priceCents: locationOffer.priceCents, currency: locationOffer.currency, source: "location" as const };

  const organizationOffer = active.find((offer) => offer.organizationId === input.organizationId && !offer.locationId);
  if (organizationOffer) {
    return { priceCents: organizationOffer.priceCents, currency: organizationOffer.currency, source: "organization" as const };
  }

  const exactTier = active.find((offer) => offer.priceTier === input.priceTier && !offer.organizationId && !offer.locationId);
  if (exactTier) return { priceCents: exactTier.priceCents, currency: exactTier.currency, source: "tier" as const };

  const tier1 = active.find((offer) => offer.priceTier === 1 && !offer.organizationId && !offer.locationId);
  if (tier1) {
    return {
      priceCents: tierPriceFromTier1(tier1.priceCents, input.priceTier),
      currency: tier1.currency,
      source: "tier_formula" as const,
    };
  }

  return null;
}
