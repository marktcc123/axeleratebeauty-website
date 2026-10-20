# Product content model (display fields)

Status: **code ready for transitional JSON; column migration not applied.**  
Keep `CATALOG_SOURCE=supabase_cache`. No production Zoho writes.

## Field ownership (unique source of truth)

| Customer UI | Preferred source | Transitional source | Never |
| --- | --- | --- | --- |
| Name | `products.name` | — | Hardcoded JSX |
| SKU | `products.sku` | — | — |
| Short list blurb | `products.short_description` | `shipping_attributes.short_description` | Invented marketing |
| Pack / spec | `products.pack_label` | `shipping_attributes.pack_label` or `contents` summary | Category-as-pack |
| Sell unit | `products.unit_label` | `shipping_attributes.unit_label` / `unit_of_measure` | — |
| Long description | `products.description` | — | Empty “TBD” modules |
| Professional use | `products.intended_use` | — | — |
| Highlights / usage / precautions | existing columns | — | Fake certifications |
| Images | `products.images[]` URLs | — | Stock photo as this SKU |
| Customer price | `product_offers` / pricing resolve | — | Public price without auth |
| Sellable flag | `publication_status` + inventory | — | — |

## JSON backfill rules (`20261021_product_display_fields.sql`)

- Copy JSON → column **only when column IS NULL**.
- Do **not** clear or rewrite `shipping_attributes`.
- Re-running the migration is safe (`IF NOT EXISTS` + null-only updates).
- After operators edit dedicated columns, JSON leftovers are ignored by `mapPublicProduct` once columns are selected.

## Public catalog view / app sync

1. Migration refreshes `catalog_products` to expose `short_description`, `pack_label`, `unit_label` (still no prices).
2. Grants remain SELECT-only for anon/authenticated.
3. Until migration is applied, `CATALOG_PUBLIC_COLUMNS` **must not** list the new columns (Preview would 500).
4. After apply: append `CATALOG_DISPLAY_COLUMNS_AFTER_MIGRATION` in `src/lib/catalog-columns.ts` and redeploy.
5. `mapPublicProduct` already prefers column values when present, else JSON.

## Zoho mapping (future; unverified)

| Website | Likely Zoho Commerce | Notes |
| --- | --- | --- |
| sku | Variant SKU | Join key |
| name | Product/variant name | — |
| description | Description HTML/text | Strip HTML on ingest |
| short_description | Custom field or truncated description | Confirm API |
| pack_label | Custom field / attributes | Confirm API |
| unit_label | UOM / custom field | Confirm API |
| images[] | Media URLs | Absolute HTTPS only |
| price | Price book / offer | Not in `catalog_products` |

Do not assume every content field syncs until a live Commerce read proves it.

## Deploy compatibility

| Phase | DB | Website |
| --- | --- | --- |
| Now | No new columns | Reads JSON via `shipping_attributes` |
| After SQL apply | Columns + view | Still works (JSON fallback) |
| After SELECT append | Columns selected | Columns preferred |

## Melting Mask 70 sample

See `docs/MELTING_MASK_70_CONTENT_CHECKLIST.md`. Staging SKU `STG-MELTING-MASK` is a fixture product; marketing assets for Reju Control Melting Mask 70 g exist in-repo but are **not** auto-bound until an operator attaches them (DB write).
