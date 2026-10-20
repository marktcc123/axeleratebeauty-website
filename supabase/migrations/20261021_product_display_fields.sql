-- Product display fields for partner catalog / Zoho Commerce mapping.
-- DO NOT apply from an agent overnight run without operator approval.
-- Supabase write boundary: staging apply is manual; production apply is separate.
--
-- Deploy order (compatibility):
-- 1. Website already reads pack/unit/short from shipping_attributes JSON (safe without this migration).
-- 2. Apply this migration on the target project (adds columns, backfill, refreshes catalog_products).
-- 3. Append CATALOG_DISPLAY_COLUMNS_AFTER_MIGRATION to CATALOG_PUBLIC_COLUMNS in
--    src/lib/catalog-columns.ts and redeploy so dedicated columns are selected.
--
-- Ownership after apply:
--   pack_label, unit_label, short_description → products columns (source of truth)
--   shipping_attributes.pack_label|unit_label|short_description → legacy; not overwritten here
--   description / intended_use / images / contents → unchanged existing columns

begin;

alter table public.products
  add column if not exists pack_label text,
  add column if not exists unit_label text,
  add column if not exists short_description text;

comment on column public.products.pack_label is 'Customer-facing pack/spec, e.g. 70 g jar / Box of 10';
comment on column public.products.unit_label is 'Sell unit, e.g. per jar / per kit';
comment on column public.products.short_description is 'Optional one-line list blurb';

-- Backfill only when the new column is null; never overwrite operator-edited columns.
update public.products
set pack_label = nullif(trim(shipping_attributes ->> 'pack_label'), '')
where pack_label is null
  and nullif(trim(shipping_attributes ->> 'pack_label'), '') is not null;

update public.products
set unit_label = coalesce(
  nullif(trim(shipping_attributes ->> 'unit_label'), ''),
  nullif(trim(shipping_attributes ->> 'unit_of_measure'), '')
)
where unit_label is null
  and coalesce(
    nullif(trim(shipping_attributes ->> 'unit_label'), ''),
    nullif(trim(shipping_attributes ->> 'unit_of_measure'), '')
  ) is not null;

update public.products
set short_description = nullif(trim(shipping_attributes ->> 'short_description'), '')
where short_description is null
  and nullif(trim(shipping_attributes ->> 'short_description'), '') is not null;

-- Refresh public catalog view (same security_invoker posture as phase1).
-- Does not expand price / available_quantity into the public view.
create or replace view public.catalog_products
with (security_invoker = false) as
select
  id, sku, slug, name, description, intended_use,
  short_description, pack_label, unit_label,
  category, highlights, contents,
  usage_notes, precautions, images, currency, inventory_status, shipping_attributes,
  publication_status, reorder_eligible, related_product_ids,
  zoho_crm_product_id, zoho_commerce_product_id, zoho_variant_id, product_kind,
  created_at, updated_at
from public.products
where publication_status = 'active';

revoke all on table public.catalog_products from public, anon, authenticated;
grant select on table public.catalog_products to anon, authenticated;

commit;
