# Staging Overnight Report

Branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1  
Preview alias: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app  

## HEAD / Preview

| Item | Value |
| --- | --- |
| Commerce redesign | `a46c6ef5228f00c50af02ce79a4cf187cbdd0014` |
| Detail-route fix | `297b73002782d9d1a3054ff8913321755c779bd3` |
| Latest Preview unique | `https://axeleratebeauty-website-kr7ladv68-axelerateglobal.vercel.app` |
| Acceptance | `PRODUCT_EXPERIENCE_ACCEPTANCE.md` |
| Backlog | `PRODUCT_IMPROVEMENT_BACKLOG.md` |
| Evidence | `docs/ux-evidence/v2-*` |

## What was redesigned (product, not file dump)

- Shared **commerce design tokens** (page, title, price, row, buttons, qty)
- **Catalog** replenishment rows: No-image plate, spec line, blurb when present, ± Add + View cart
- **Product detail** structure with optional modules hidden when empty; partner route `/partner/catalog/[slug]`
- **Cart** thumbs + sticky mobile checkout summary
- **Orders / Account** on same page shell
- **Fixtures** `/dev/ui-fixtures` (simulated; ENABLE_UI_FIXTURES or non-production)
- Draft SQL `supabase/migrations/20261021_product_display_fields.sql` **not applied** (DB write boundary)

## Critical fix this round

`next.config` redirected `/professional-kits/:slug` → `/professional-programs/:slug`, causing staging SKU detail **404**. Removed slug redirect; partner list now opens `/partner/catalog/[slug]`.

## Friction reduced

| Before | After |
| --- | --- |
| Marketing + purchase nav stacked / inconsistent shells | Partner workspace + commerce page shell |
| Empty “will appear here” detail blocks | Hidden until content exists |
| Stock photo fallback looked like packaging | Neutral “No image” |
| Detail URL 404 via programs redirect | Partner catalog detail works |
| Cart checkout hard to find on phone | Sticky summary + full-width Checkout |

## Scenario status

| Scenario | Status |
| --- | --- |
| Catalog $12 + Add + feedback | 通过 (`v2-catalog-1440`) |
| Cart lines + pending ship/tax | 通过 |
| Orders refunded first / failed hidden | 通过 |
| Fixtures long-name / no-image | 通过 (SIMULATED local) |
| Partner detail $12 + store strip | 通过 (`v2-detail-fixed-1440`) |
| Real photos / pack_label data | 外部阻塞 |
| Zoho live / DB migration apply | 外部阻塞 |

## Tomorrow — check first

1. `/partner/catalog` → open Melting Mask detail (`/partner/catalog/staging-melting-mask`) — expect `$12.00`, store strip, no 404  
2. Add → View cart on phone 390  
3. `/dev/ui-fixtures` only if `ENABLE_UI_FIXTURES=1` (simulated banner)

## Boundaries kept

No new payments/refunds; no main merge; Supabase read-only; `CATALOG_SOURCE=supabase_cache`; no production Zoho writes.
