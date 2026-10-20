-- OPTIONAL display fields for partner catalog / Zoho Commerce mapping.
-- DO NOT apply on production from this overnight agent run.
-- Staging apply requires explicit operator approval (Supabase write boundary).
--
-- Purpose: let operators store pack/unit/short copy without hardcoding JSX.
-- Until applied, the website reads pack_label / unit_label from shipping_attributes JSON
-- and falls back to contents / category (see product-presentation.ts).

alter table public.products
  add column if not exists pack_label text,
  add column if not exists unit_label text,
  add column if not exists short_description text;

comment on column public.products.pack_label is 'Customer-facing pack/spec line, e.g. Box of 10';
comment on column public.products.unit_label is 'Sell unit, e.g. per kit / per jar';
comment on column public.products.short_description is 'Optional one-line list blurb; prefer over truncating long description';

-- Recreate / refresh catalog_products view only after reviewing the live view definition
-- in the target project. Do not drop the view blindly from this file.
-- After apply, extend CATALOG_PUBLIC_COLUMNS + mapPublicProduct, then Zoho Commerce map.
