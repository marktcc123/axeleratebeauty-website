# Melting Mask 70 — content sample checklist

Internal planning only. **Customer UI must not claim formal product content is complete** while staging still shows fixture SKU copy.

## Identity

| Item | Status | Source |
| --- | --- | --- |
| Marketing name | Confirmed in marketing data | `Reju Control Melting Mask` (`src/data/catalog-products.ts`) |
| Size | Confirmed in marketing data | `70 g` |
| Staging commerce SKU | Fixture only | `STG-MELTING-MASK` / slug `staging-melting-mask` |
| Formal SKU for B2B catalog | **Need from you** | Not confirmed for staging commerce row |
| Program kit qty (Glass Skin) | Marketing only | 15 × 70 g in facial program data |

## Assets already in repo (not auto-attached to staging SKU)

| Asset | Path | Suggested use |
| --- | --- | --- |
| Pack shot | `public/images/retail/melting-pack.webp` | Primary pack image candidate |
| Hero | `public/images/retail/melting-hero.webp` | Optional gallery / hero |
| Duo lifestyle | `public/images/retail/melting-luxe.webp` | Optional; not sole pack proof |

Attaching these to `products.images` requires an approved DB/content update (out of agent write scope).

## Minimal list you need to supply / confirm

| # | Field | Status | Notes |
| --- | --- | --- | --- |
| 1 | Primary pack image approved for this SKU | **Missing bind** | File exists; confirm it is the correct Melting Mask 70 packaging |
| 2 | Optional secondary images | Optional | Hero / lifestyle if approved |
| 3 | Pack / size label | Partial | Marketing says `70 g`; confirm customer string e.g. `70 g jar` |
| 4 | Sell unit | **Missing** | e.g. `per jar` / `per unit` |
| 5 | Inner pack count (if sold as multipack) | **Missing / N/A** | Marketing `innerPackCount` is null |
| 6 | Short list blurb (1 line) | **Missing** | Do not reuse unapproved claims |
| 7 | Long description | **Missing** for commerce SKU | Staging description is fixture text today |
| 8 | Professional use / usage notes | **Missing** unless you approve copy | Hide empty modules until provided |
| 9 | Precautions | **Missing** unless approved | Hide until provided |
| 10 | Authorized Tier prices | Staging fixture | Tier 1/2/3 1200/1440/1728 ¢ — confirm before production |

## Marketing copy fragments (not published as commerce fact)

From `src/data/products.ts` highEssential (site marketing):

> “Occlusive peel-off mask that drives active penetration for a glass-skin finish.”

Treat as **unverified for B2B catalog** until you approve it for the sellable SKU.

## Customer page behavior until filled

- Empty optional modules stay hidden.
- Missing images → neutral “No image” plate (not a borrowed pack shot).
- Layout readiness ≠ content completeness.
