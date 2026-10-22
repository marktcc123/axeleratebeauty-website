import { CATALOG_PUBLIC_SELECT } from "@/lib/catalog-columns";
import {
  getOfficialRetailProductBySlug,
  getOfficialRetailProductsByIds,
  listOfficialRetailProducts,
  OFFICIAL_PRICE_BRIDGES,
  officialRetailCatalogEnabled,
  productBarcodes,
} from "@/lib/catalog-official-retail";
import { catalogSource, isZohoCommerceConfigured } from "@/lib/config";
import { getAuthorizedOffers } from "@/lib/pricing";
import { getSession } from "@/lib/session";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import type { Product, PublicationStatus, SessionContext } from "@/lib/types";
import { canPurchase } from "@/lib/types";

export class CatalogError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "CatalogError";
  }
}

type PublicProductRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  intended_use: string | null;
  /** Present only after display-fields migration + view refresh. */
  short_description?: string | null;
  pack_label?: string | null;
  unit_label?: string | null;
  category: string;
  highlights: string[] | null;
  contents: Product["contents"] | null;
  usage_notes: string | null;
  precautions: string | null;
  images: string[] | null;
  currency: string;
  inventory_status: Product["inventoryStatus"];
  shipping_attributes: Record<string, unknown> | null;
  publication_status: PublicationStatus;
  reorder_eligible: boolean;
  related_product_ids: string[] | null;
  zoho_crm_product_id?: string | null;
  zoho_commerce_product_id?: string | null;
  zoho_variant_id?: string | null;
  product_kind?: Product["productKind"];
};

function trimmedOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapPublicProduct(row: PublicProductRow): Product {
  const shipping = row.shipping_attributes ?? {};
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    description: row.description,
    intendedUse: row.intended_use,
    // Prefer dedicated columns when migration is applied; otherwise JSON transitional keys.
    shortDescription:
      trimmedOrNull(row.short_description) ?? trimmedOrNull(shipping.short_description),
    packLabel: trimmedOrNull(row.pack_label) ?? trimmedOrNull(shipping.pack_label),
    unitLabel:
      trimmedOrNull(row.unit_label) ??
      trimmedOrNull(shipping.unit_label) ??
      trimmedOrNull(shipping.unit_of_measure),
    category: row.category,
    highlights: row.highlights ?? [],
    contents: row.contents ?? [],
    usageNotes: row.usage_notes,
    precautions: row.precautions,
    images: row.images ?? [],
    currency: row.currency,
    professionalPriceCents: null,
    publicPriceVisible: false,
    inventoryStatus: row.inventory_status,
    availableQuantity: null,
    shippingAttributes: shipping,
    publicationStatus: row.publication_status,
    reorderEligible: row.reorder_eligible,
    relatedProductIds: row.related_product_ids ?? [],
    zohoCrmProductId: row.zoho_crm_product_id ?? null,
    zohoCommerceProductId: row.zoho_commerce_product_id ?? null,
    zohoVariantId: row.zoho_variant_id ?? null,
    productKind: row.product_kind ?? "replenishment",
  };
}

async function readPublicRows(ids?: string[], slug?: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  let query = supabase.from("catalog_products").select(CATALOG_PUBLIC_SELECT);
  if (ids) query = query.in("id", ids);
  else if (slug) query = query.eq("slug", slug);
  else query = query.order("name");

  const { data, error } = await query;
  if (error) {
    throw new CatalogError(`Catalog query failed: ${error.message}`, error);
  }
  return ((data ?? []) as unknown) as PublicProductRow[];
}

export function stripProtectedPrice(product: Product): Product {
  return {
    ...product,
    professionalPriceCents: null,
    publicPriceVisible: false,
    availableQuantity: null,
  };
}

async function listSupabasePublishedProducts() {
  try {
    const rows = await readPublicRows();
    return rows
      .filter((row) => row.product_kind !== "internal_lot" && row.product_kind !== "full_system")
      .map(mapPublicProduct);
  } catch {
    return [] as Product[];
  }
}

/**
 * Preview / feature catalog: official retail spreadsheet products are the browseable source.
 * Supabase rows remain available for priced bridges; STG fixtures are not converted into formal barcodes.
 */
export async function listPublishedProducts() {
  if (officialRetailCatalogEnabled()) {
    const official = listOfficialRetailProducts();
    if (official.length > 0) return official;
  }
  return listSupabasePublishedProducts();
}

export async function getPublishedProduct(slug: string) {
  if (officialRetailCatalogEnabled()) {
    const official = getOfficialRetailProductBySlug(slug);
    if (official) return official;
  }
  try {
    const rows = await readPublicRows(undefined, slug);
    const row = rows[0];
    if (!row || row.product_kind === "internal_lot") return null;
    return mapPublicProduct(row);
  } catch {
    return null;
  }
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  if (officialRetailCatalogEnabled()) {
    const official = getOfficialRetailProductsByIds(ids);
    if (official.length > 0) return official;
  }
  try {
    const rows = await readPublicRows(ids);
    return rows.map(mapPublicProduct);
  } catch {
    return [];
  }
}

async function resolveBridgeStagingIds(products: Product[]) {
  const slugByOfficialId = new Map<string, string>();
  for (const product of products) {
    for (const barcode of productBarcodes(product)) {
      const bridge = OFFICIAL_PRICE_BRIDGES[barcode];
      if (bridge) slugByOfficialId.set(product.id, bridge.stagingSlug);
    }
  }
  if (slugByOfficialId.size === 0) return new Map<string, string>();

  const stagingIdByOfficialId = new Map<string, string>();
  for (const [officialId, slug] of slugByOfficialId) {
    try {
      const rows = await readPublicRows(undefined, slug);
      const row = rows[0];
      if (row?.id) stagingIdByOfficialId.set(officialId, row.id);
    } catch {
      // Bridge optional when staging row missing.
    }
  }
  return stagingIdByOfficialId;
}

function applyOffer(
  product: Product,
  offer: { priceCents: number; currency: string; availableQuantity: number | null; inventoryStatus?: Product["inventoryStatus"] } | undefined,
  purchaseProductId?: string,
): Product {
  if (!offer) {
    return {
      ...stripProtectedPrice(product),
      shippingAttributes: {
        ...product.shippingAttributes,
        orderingMode: "browse_only",
      },
    };
  }
  return {
    ...product,
    professionalPriceCents: offer.priceCents,
    currency: offer.currency,
    availableQuantity: offer.availableQuantity,
    inventoryStatus: offer.inventoryStatus ?? product.inventoryStatus,
    reorderEligible: true,
    shippingAttributes: {
      ...product.shippingAttributes,
      orderingMode: "priced",
      // Cart/checkout must charge the staged commerce row; display identity stays official.
      ...(purchaseProductId && purchaseProductId !== product.id
        ? { purchaseProductId, priceBridge: true }
        : {}),
    },
  };
}

export async function listAuthorizedProducts(session?: SessionContext | null) {
  const current = session ?? (await getSession());
  const products = await listPublishedProducts();
  if (!canPurchase(current)) return products.map(stripProtectedPrice);

  const bridgeIds = await resolveBridgeStagingIds(products);
  const lookupIds = [
    ...new Set([
      ...products.map((product) => product.id),
      ...bridgeIds.values(),
    ]),
  ];
  const offers = await getAuthorizedOffers(current.organizationId!, current.activeLocationId!, lookupIds);

  return products.map((product) => {
    const direct = offers.get(product.id);
    if (direct) return applyOffer(product, direct);
    const bridgedStagingId = bridgeIds.get(product.id);
    const bridged = bridgedStagingId ? offers.get(bridgedStagingId) : undefined;
    return applyOffer(product, bridged, bridgedStagingId);
  });
}

export async function getAuthorizedProductsByIds(ids: string[], session?: SessionContext | null) {
  const current = session ?? (await getSession());
  // Cart may hold staging purchase IDs while Shop links use official slugs/ids.
  const official = officialRetailCatalogEnabled() ? getOfficialRetailProductsByIds(ids) : [];
  const missing = ids.filter((id) => !official.some((product) => product.id === id));
  let supabaseProducts: Product[] = [];
  if (missing.length > 0) {
    try {
      const rows = await readPublicRows(missing);
      supabaseProducts = rows.map(mapPublicProduct);
    } catch {
      supabaseProducts = [];
    }
  }
  const products = [...official, ...supabaseProducts];
  if (!canPurchase(current)) return products.map(stripProtectedPrice);

  const bridgeIds = await resolveBridgeStagingIds(products);
  const lookupIds = [...new Set([...ids, ...bridgeIds.values(), ...products.map((p) => p.id)])];
  const offers = await getAuthorizedOffers(current.organizationId!, current.activeLocationId!, lookupIds);

  return products.map((product) => {
    const direct = offers.get(product.id);
    if (direct) return applyOffer(product, direct);
    const bridgedStagingId = bridgeIds.get(product.id);
    const bridged = bridgedStagingId ? offers.get(bridgedStagingId) : undefined;
    return applyOffer(product, bridged, bridgedStagingId);
  });
}

export async function listAllProductsForAdmin() {
  const session = await getSession();
  if (!session.isPlatformAdmin) return [];
  const supabase = await createServiceSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw new CatalogError(`Admin catalog query failed: ${error.message}`, error);
  return (data as Array<PublicProductRow & { professional_price_cents?: number | null; available_quantity?: number | null }>).map(
    (row) => ({
      ...mapPublicProduct(row),
      professionalPriceCents: row.professional_price_cents ?? null,
      availableQuantity: row.available_quantity ?? null,
    }),
  );
}

export function catalogSwitchReady() {
  return catalogSource() === "zoho_commerce" && isZohoCommerceConfigured();
}
