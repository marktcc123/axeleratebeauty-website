import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import type { Product, PublicationStatus } from "@/lib/types";

type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  intended_use: string | null;
  category: string;
  highlights: string[] | null;
  contents: Product["contents"] | null;
  usage_notes: string | null;
  precautions: string | null;
  images: string[] | null;
  currency: string;
  professional_price_cents: number | null;
  public_price_visible: boolean;
  inventory_status: Product["inventoryStatus"];
  available_quantity: number | null;
  shipping_attributes: Record<string, unknown> | null;
  publication_status: PublicationStatus;
  reorder_eligible: boolean;
  related_product_ids: string[] | null;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    description: row.description,
    intendedUse: row.intended_use,
    category: row.category,
    highlights: row.highlights ?? [],
    contents: row.contents ?? [],
    usageNotes: row.usage_notes,
    precautions: row.precautions,
    images: row.images ?? [],
    currency: row.currency,
    professionalPriceCents: row.professional_price_cents,
    publicPriceVisible: row.public_price_visible,
    inventoryStatus: row.inventory_status,
    availableQuantity: row.available_quantity,
    shippingAttributes: row.shipping_attributes ?? {},
    publicationStatus: row.publication_status,
    reorderEligible: row.reorder_eligible,
    relatedProductIds: row.related_product_ids ?? [],
  };
}

export async function listPublishedProducts() {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("publication_status", "active")
    .order("name");
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

export async function getPublishedProduct(slug: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("publication_status", "active")
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as ProductRow);
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").in("id", ids);
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

export async function listAllProductsForAdmin() {
  const supabase = await createServiceSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}
