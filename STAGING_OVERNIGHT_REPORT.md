# Staging Overnight Report

Task source: `STAGING_NIGHT_TASK.md` (+ product UX continuation brief)  
Branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1  
Staging Supabase: `rwxwvbhfbezqkgnaqvrq` (`axelerate-beauty-staging`)  
Fixed Preview alias: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app

Backlog: `PRODUCT_IMPROVEMENT_BACKLOG.md`  
Zoho map: `docs/ZOHO_FIELD_MAP.md`

## Deploy ↔ HEAD (correct this run)

| Item | Value |
| --- | --- |
| Local HEAD at report write | *(filled after push — see §4)* |
| Preview alias | fixed URL above |
| Prior lag | Report previously pinned deploy commit `0f63089` while HEAD moved to `22efa1d`. Browser must re-check after UX deploy. |
| Refund tests | **Not repeated** this run (already done on `DB-MVG7294C`) |

## Acceptance matrix

Legend: **IV** = implemented & verified · **IU** = implemented, not yet verified on latest Preview · **NI** = not implemented · **XB** = external block

### Security / pricing (prior night — keep)

| Item | Status | Notes |
| --- | --- | --- |
| `catalog_products` SELECT-only for anon/authenticated | IV | MCP read-back prior night |
| Approved Tier 1 Melting Mask `$12.00` on catalog | IV | Playwright prior night; re-verify after UX deploy |
| Public pages do not show professional dollars | IU | Re-check public `/professional-kits` / programs |
| Checkout locked without Stripe tax + shipping rate | IV | Existing code path |
| Cart qty save + reload consistency | IU | Re-walk Phase 3 |
| Reorder uses current authorized price (not history) | IU | Copy + server `reorderAuthorizedProduct`; stop before pay |
| Partial/full refund UI readable | IU | StatusBadge; no new Stripe refunds |
| Cross-company / unauthorized store hosted identity | XB | No second isolated login |
| Stripe Tax registrations | XB | Sandbox registrations empty → tax $0 expected |
| Zoho live CRM/Commerce write | XB | No `ZOHO_*` on Preview; map docs only |
| CATALOG_SOURCE stays `supabase_cache` | IV | Not flipped |

### Information architecture (this run)

| Item | Status | Notes |
| --- | --- | --- |
| Partner core = Catalog / Orders / Account | IU | SiteHeader partner mode |
| Billing + Support + Profile hubbed | IU | `/partner/account`; old URLs redirect |
| Approved login → Catalog | IV | `auth` action + dashboard redirect |
| Marketing vs purchase nav not stacked | IU | Partner workspace replaces marketing links |
| Current store + cart + account easy to find | IU | Store strip + header Cart/Account |
| Dashboard only for non-purchasing states | IU | Pending / suspended / no locations |

### Purchase UX (this run)

| Item | Status | Notes |
| --- | --- | --- |
| Catalog replenishment rows (name/SKU/price/qty/Add) | IU | `ReplenishmentRow` |
| Catalog qty ± steppers | IU | Match cart pattern |
| Cart shows store, lines, pending ship/tax, save lock | IU | `CartEditor` denser layout |
| Orders payment/fulfillment badges + reorder CTA | IU | `StatusBadge` + ReorderButton feedback |
| Empty / no-price / OOS fixtures (local) | IV | `replenishment-row-state` unit tests |
| Desktop 1440 / mobile 390 / 320 overflow | IU | Playwright after deploy |
| Second friction pass after first screenshots | IU | After Phase 3 walk |

## 1. Customer flow before → after

**Public / new client**

- Before: For Professionals emphasized “programs” without clear Login → Catalog path.
- After: Steps name Catalog after approval; Login CTA added beside register.

**Approved buyer**

- Before: Marketing header + PartnerNav both present; Billing/Support/Profile separate; catalog used marketing-style cards.
- After: One partner header (Catalog / Orders / Account / Cart); store strip only; Account hub; catalog is a replenishment list with ± qty and Add; cart denser; orders show badges and “Add again at current price” with error feedback.

**Operator**

- No commercial rule changes. Refund/settlement behavior unchanged. Zoho still mapping-only.

## 2. Page changes (product, not just file list)

| Surface | Change |
| --- | --- |
| Site header | Partner workspace mode on `/partner/*` (except login/register) and `/cart` when signed in |
| Store strip | `PartnerChrome` = ordering store + org label only |
| Catalog | Search/filter kept; list rows replace card grid for reorder |
| Cart | Clear store context, line money, pending ship/tax, save lock |
| Orders | Badges; historical “was $X”; reorder at current price |
| Account | Profile + billing snippets + support form |
| Billing / Support / Profile URLs | Redirect to Account anchors |
| Dashboard | Approved → Catalog; others get status + Account link |
| For Professionals | Clearer post-approval Catalog path |

## 3. Evidence screenshots

Committed under `docs/ux-evidence/` after Preview deploy (same viewport pairs):

| File | Viewport | State |
| --- | --- | --- |
| `catalog-1440.png` / `catalog-390.png` | 1440 / 390 | Logged-in Tier 1 catalog |
| `cart-1440.png` / `cart-390.png` | 1440 / 390 | Cart with lines if present |
| `orders-1440.png` | 1440 | Refunded/paid history (read-only) |
| `public-home-1440.png` | 1440 | Logged-out public (no pro $) |
| `catalog-320-overflow.png` | 320 | Narrow overflow check |

*(Paths filled when captures land; do not treat pre-UX local `verify-*.png` as this commit.)*

## 4. Latest commit and Preview

| Field | Value |
| --- | --- |
| Feature commit (UX) | *(post-push)* |
| Preview deploy id | *(post-deploy)* |
| Alias matches HEAD? | *(verify via Vercel / HTML comment or build)* |

## 5. Scenario acceptance (Phase 3)

| # | Scenario | Result |
| --- | --- | --- |
| 1 | Tier 1 find → add → change qty → cart | Pending Preview walk |
| 2 | Reorder from history; stop before pay | Pending |
| 3 | View partial/full refund order copy | Pending (no new refunds) |
| 4 | Mobile same path | Pending |
| 5 | Logged-out public; no pro price leak | Pending |
| 6 | Multi-store / pending / no price | Local unit + code paths; hosted XB |

## 6. Tests

- `npm test`: 82 passed (includes replenishment state fixtures)
- `npm run lint`: clean
- `npm run build`: success (includes `/partner/account`)

## 7. Incomplete / priority

1. **P0** Confirm Preview deploy SHA == HEAD; finish Playwright matrix rows IU→IV  
2. **P1** Hosted multi-store identity (XB)  
3. **P1** Stripe Tax registration (XB)  
4. **P2** Zoho OAuth (XB) — field map ready  
5. **P3** Deferred backlog B07/B08/B12/B13

## 8. Zoho

- Done: `docs/ZOHO_FIELD_MAP.md`, existing mapping modules, local tests  
- Not done: live sync, Commerce catalog switch, Books posting  
- Dependency: Preview `ZOHO_*` credentials; keep `CATALOG_SOURCE=supabase_cache`

## 9. Check first tomorrow (3)

1. Preview `/partner/catalog` — partner header only, Melting Mask `$12.00`, ± Add  
2. `/cart` — store label, qty save, checkout still locked while dirty  
3. `/partner/orders` — badges + “Add again at current price” (stop before Stripe)

## Prior night (preserved)

Refunds on `DB-MVG7294C` ($5 + $12 → `refunded_cents=1700`) — **do not repeat**.  
Grants + authorized price fix remain in force.
