/**
 * Columns selected from catalog_products today.
 * After `20261021_product_display_fields.sql` is applied on a project, append:
 *   "short_description", "pack_label", "unit_label"
 * Do not add them before the view exists — Preview would fail.
 */
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

/** Enable in code only after the display-fields migration has been applied. */
export const CATALOG_DISPLAY_COLUMNS_AFTER_MIGRATION = [
  "short_description",
  "pack_label",
  "unit_label",
] as const;

export const CATALOG_PUBLIC_SELECT = CATALOG_PUBLIC_COLUMNS.join(", ");

export const CATALOG_HIDDEN_COLUMNS = [
  "professional_price_cents",
  "public_price_visible",
  "available_quantity",
] as const;
