import { catalogSource } from "@/lib/config";
import { createServiceSupabase } from "@/lib/supabase/server";
import type { InventoryStatus } from "@/lib/types";

export type AuthorizedOffer = {
  productId: string;
  priceCents: number;
  currency: string;
  availableQuantity: number | null;
  inventoryStatus?: InventoryStatus;
  source: "product_offer" | "supabase_cache";
};

export async function getAuthorizedOffers(organizationId: string, locationId: string, productIds: string[]) {
  const offers = new Map<string, AuthorizedOffer>();
  if (productIds.length === 0) return offers;

  const service = await createServiceSupabase();
  if (!service) return offers;

  const now = new Date().toISOString();
  const { data: assigned } = await service
    .from("product_offers")
    .select("product_id, price_cents, currency, location_id, organization_id, effective_to")
    .in("product_id", productIds)
    .or(`organization_id.eq.${organizationId},organization_id.is.null`)
    .or(`location_id.eq.${locationId},location_id.is.null`)
    .or(`effective_to.is.null,effective_to.gt.${now}`);

  for (const row of assigned ?? []) {
    const existing = offers.get(row.product_id);
    const specificity = (row.location_id ? 2 : 0) + (row.organization_id ? 1 : 0);
    const current = existing ? (existing.source === "product_offer" ? 1 : 0) : -1;
    if (!existing || specificity >= current) {
      offers.set(row.product_id, {
        productId: row.product_id,
        priceCents: row.price_cents,
        currency: row.currency,
        availableQuantity: null,
        source: "product_offer",
      });
    }
  }

  if (catalogSource() === "zoho_commerce") {
    return offers;
  }

  const missing = productIds.filter((id) => !offers.has(id));
  if (missing.length === 0) return offers;

  const { data: cached } = await service
    .from("products")
    .select("id, professional_price_cents, currency, available_quantity, inventory_status, publication_status")
    .in("id", missing);

  for (const row of cached ?? []) {
    if (row.professional_price_cents == null) continue;
    offers.set(row.id, {
      productId: row.id,
      priceCents: row.professional_price_cents,
      currency: row.currency,
      availableQuantity: row.available_quantity ?? null,
      inventoryStatus: row.inventory_status,
      source: "supabase_cache",
    });
  }

  return offers;
}
