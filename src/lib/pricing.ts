import { resolveAuthorizedPrice, type OfferRow, type PriceTier } from "@/lib/commerce/tier-pricing";
import { createServiceSupabase } from "@/lib/supabase/server";
import type { InventoryStatus } from "@/lib/types";

export type AuthorizedOffer = {
  productId: string;
  priceCents: number;
  currency: string;
  availableQuantity: number | null;
  inventoryStatus?: InventoryStatus;
  source: "location" | "organization" | "tier" | "tier_formula";
};

export async function getAuthorizedOffers(organizationId: string, locationId: string, productIds: string[]) {
  const offers = new Map<string, AuthorizedOffer>();
  if (productIds.length === 0) return offers;

  const service = await createServiceSupabase();
  if (!service) return offers;

  const { data: organization, error: orgError } = await service
    .from("organizations")
    .select("price_tier")
    .eq("id", organizationId)
    .maybeSingle();
  if (orgError) throw new Error(`Price-tier lookup failed: ${orgError.message}`);
  const priceTier = ([1, 2, 3] as const).includes(organization?.price_tier)
    ? (organization?.price_tier as PriceTier)
    : null;
  if (!priceTier) return offers;

  const { data: rows, error } = await service
    .from("product_offers")
    .select("product_id, price_cents, currency, location_id, organization_id, price_tier, effective_from, effective_to")
    .in("product_id", productIds);
  if (error) throw new Error(`Offer lookup failed: ${error.message}`);

  const mapped: OfferRow[] = (rows ?? []).map((row) => ({
    productId: row.product_id,
    priceCents: row.price_cents,
    currency: row.currency,
    organizationId: row.organization_id,
    locationId: row.location_id,
    priceTier: row.price_tier,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
  }));

  const { data: products, error: productError } = await service
    .from("products")
    .select("id, available_quantity, inventory_status")
    .in("id", productIds);
  if (productError) throw new Error(`Stock lookup failed: ${productError.message}`);
  const stock = new Map((products ?? []).map((row) => [row.id, row]));

  for (const productId of productIds) {
    const resolved = resolveAuthorizedPrice(mapped, {
      productId,
      organizationId,
      locationId,
      priceTier,
    });
    if (!resolved) continue;
    const product = stock.get(productId);
    offers.set(productId, {
      productId,
      priceCents: resolved.priceCents,
      currency: resolved.currency,
      availableQuantity: product?.available_quantity ?? null,
      inventoryStatus: product?.inventory_status,
      source: resolved.source,
    });
  }

  return offers;
}
