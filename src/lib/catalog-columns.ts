export const CATALOG_PUBLIC_COLUMNS = [
  "id",
  "sku",
  "slug",
  "name",
  "description",
  "intended_use",
  "category",
  "highlights",
  "contents",
  "usage_notes",
  "precautions",
  "images",
  "currency",
  "inventory_status",
  "shipping_attributes",
  "publication_status",
  "reorder_eligible",
  "related_product_ids",
  "zoho_crm_product_id",
  "zoho_commerce_product_id",
  "zoho_variant_id",
  "product_kind",
  "created_at",
  "updated_at",
] as const;

export const CATALOG_PUBLIC_SELECT = CATALOG_PUBLIC_COLUMNS.join(", ");

export const CATALOG_HIDDEN_COLUMNS = [
  "professional_price_cents",
  "public_price_visible",
  "available_quantity",
] as const;
