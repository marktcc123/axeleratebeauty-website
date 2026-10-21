# Dermabell asset map (staging candidates)

**License note:** Public images collected for design reference / staging candidates. Production publish still needs brand authorization. Do not hotlink CDN long-term.

## Series / home (collection use — not SKUs)

| Local file | Source page | Source URL | Use | Size (bytes) | Match / auth |
| --- | --- | --- | --- | --- | --- |
| `public/images/brand-ref/series/high-essential.png` | `/` | `https://cdn.imweb.me/thumbnail/20260504/8b7021816113f.png` | collection | 491453 | staging candidate |
| `public/images/brand-ref/series/professional.png` | `/` | `https://cdn.imweb.me/thumbnail/20260504/7fa8b15449e8f.png` | collection | 531165 | staging candidate |
| `public/images/brand-ref/series/fit-formance.png` | `/` | `https://cdn.imweb.me/thumbnail/20260504/7517cbb50d5de.png` | collection | 607431 | staging candidate |
| `public/images/brand-ref/series/modeling-pack.png` | `/` | `https://cdn.imweb.me/thumbnail/20260504/de336282ff2ca.png` | collection | 714306 | staging candidate |
| `public/images/brand-ref/series/home-texture-01.png` | `/` | `https://cdn.imweb.me/thumbnail/20260417/bd13866a5fc62.png` | hero / texture | 1018427 | staging candidate |

## Product candidates

| Official name | Source page | Source image URL | Local candidate | EN resource | Website SKU | Match status |
| --- | --- | --- | --- | --- | --- | --- |
| High-Essential Reju Control Melting Mask | `/b2b` | `https://cdn.imweb.me/thumbnail/20260804/1162af8f08531.png` | `…/b2b-candidates/he-reju-control-melting-mask.png` | Drive `151Nx8CPJXi57nQXRiTJfotIoJcT681cQ` | Staging slug `staging-melting-mask` / `STG-MELTING-MASK` (fixture) | **pending_size_verify** — Axelerate sells 70; pack size on jar not confirmed → UI does not auto-bind |
| Expert Formula Lab Infuse Glaze Melting Mask | `/b2b` | `https://cdn.imweb.me/thumbnail/20260805/29e75872edc8a.png` | `…/b2b-candidates/expert-infuse-glaze-melting-mask.png` | Gamma `…-110g-EN-…` / CN `…-120g-…` | none | **mismatch_different_sku** — negative control only |
| Existing retail pack | (repo) | — | `public/images/retail/melting-pack.webp` | — | marketing `reju-control-melting-mask-70g` | **local_candidate** — not auto-bound to commerce fixture |

## Existing in-repo assets (already used elsewhere)

| Path | Typical use | Notes |
| --- | --- | --- |
| `public/images/retail/*.webp` | marketing / programs | Confirm before commerce bind |
| `public/images/ampoules/*` | programs | Not auto Shop SKUs |
| `public/images/training/*` | Professional Programs band | OK |
| `public/images/family/*`, `studio/*` | brand / lifestyle | Not SKU proof |

## Status summary

| Bucket | Count / note |
| --- | --- |
| Matched & applied to sellable UI | **0** product pack images (pending size verify) |
| Pending confirmation | Melting Mask 70 ↔ High-Essential Melting Mask pack + EN guide |
| Explicit mismatch | Infuse Glaze Melting Mask 110g/120g materials |
| Missing | Confirmed ingredients, how-to, and pack label on staging commerce rows (ops/DB) |

## Content ↔ commerce wiring

| Concern | Source of truth |
| --- | --- |
| Price, inventory, publication | Supabase cache / offers (`CATALOG_SOURCE=supabase_cache`) |
| Brand images / EN guides | `src/data/brand-content.ts` + local `public/images/brand-ref/*` |
| Pack / unit / short / resources JSON | `shipping_attributes` transitional; columns in unapplied `20261021_product_display_fields.sql` |
| Apply confirmed image | Set `matchStatus: "confirmed"` and `applyResources: true` in brand-content — still prefer writing `products.images` when DB write is approved |

Code path: `withBrandPresentation()` only injects images when `matchStatus === "confirmed"`.
