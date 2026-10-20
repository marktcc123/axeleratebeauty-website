# Staging Overnight Report

Task source: `STAGING_NIGHT_TASK.md` (+ product UX continuation brief)  
Branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1  
Staging Supabase: `rwxwvbhfbezqkgnaqvrq` (`axelerate-beauty-staging`)  
Fixed Preview alias: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app

Backlog: `PRODUCT_IMPROVEMENT_BACKLOG.md`  
Zoho map: `docs/ZOHO_FIELD_MAP.md`  
Evidence: `docs/ux-evidence/`

## Deploy ↔ HEAD

| Item | Value |
| --- | --- |
| Feature UX commit | `18c6372f6c1e581eb9b22a217f43eebbc6c73bce` |
| HEAD (orders filter + evidence) | `893d6d7697221120a0ca4b563ca413a92db845f6` |
| Preview deploy for `18c6372` | `dpl_9z1iiHVUGHe4LkTMrNsEvDpjFWVR` → `https://axeleratebeauty-website-8w4o7gns4-axelerateglobal.vercel.app` |
| Preview deploy for `893d6d7` | `dpl_ifH2X9oZ1oJCmLRkVSks9EEv2YV2` → `https://axeleratebeauty-website-ezq6c4y6c-axelerateglobal.vercel.app` |
| Alias | fixed Preview URL above |
| Prior report lag | Old report pinned `0f63089` while HEAD had moved to `22efa1d`. Corrected after UX deploys. |
| Refund tests | **Not repeated** (`DB-MVG7294C` already covered) |

## Acceptance matrix

Legend: **IV** implemented & verified · **IU** implemented, not verified on latest · **NI** not implemented · **XB** external block

### Security / pricing (prior night — retained)

| Item | Status | Notes |
| --- | --- | --- |
| `catalog_products` SELECT-only for anon/authenticated | IV | Prior MCP read-back |
| Approved Tier 1 Melting Mask `$12.00` | IV | Playwright after UX deploy |
| Public marketing does not show professional dollars | IV | `/professional-programs`: approval copy, no `$12` |
| Checkout requires Stripe tax + shipping rate | IV | Existing lock |
| Cart qty save survives reload | IV | 3→4 → reload still 4 / Line $48.00 |
| Reorder uses current authorized price | IV | “Add again…” → cart; stop before Checkout |
| Partial/full refund UI readable | IV | `DB-MVG7294C` shows `refunded` badge (no new refunds) |
| Cross-company / unauthorized store hosted identity | XB | No second isolated login |
| Stripe Tax registrations | XB | Sandbox empty → tax $0 expected |
| Zoho live write | XB | No Preview `ZOHO_*` |
| `CATALOG_SOURCE=supabase_cache` | IV | Unchanged |

### Information architecture

| Item | Status | Notes |
| --- | --- | --- |
| Core = Catalog / Orders / Account | IV | Partner workspace header |
| Billing / Support / Profile hubbed | IV | `/partner/account` + redirects |
| Approved login → Catalog | IV | Auth + dashboard redirect |
| No stacked marketing+purchase nav | IV | Partner mode replaces marketing links |
| Store + cart + account findable | IV | Store strip + header Cart/Account |
| Dashboard for non-purchasing only | IV | Pending / suspended / no store |

### Purchase UX

| Item | Status | Notes |
| --- | --- | --- |
| Catalog replenishment rows | IV | Name / SKU / $12 / ± / Add |
| Catalog ± steppers | IV | Playwright +1 then Add → Cart (2) |
| Cart store + pending ship/tax + save lock | IV | Snapshot + qty persist |
| Orders badges + reorder CTA | IV | refunded/paid/failed badges |
| Hide failed checkout noise | IV | Alias after `893d6d7`: “24 failed… hidden”; first row `DB-MVG7294C` refunded |
| Empty / no-price / OOS fixtures | IV | Unit tests `replenishment-row-state` |
| Desktop 1440 / mobile 390 / 320 overflow | IV | Screenshots; 320 `overflowX=false` |
| Second friction pass | IV | Orders failed-noise filter shipped |

## 1. Customer flow before → after

| Persona | Before | After |
| --- | --- | --- |
| New client | For Professionals unclear vs Catalog | Steps + Login CTA; public programs show approval copy, not dollars |
| Approved buyer | Marketing header + PartnerNav stack; Billing/Support/Profile separate; card catalog | One partner header; Account hub; replenishment list; denser cart; order badges + reorder |
| Operator | Failed checkouts buried real orders | Failed attempts hidden by default |

**Navigation count (approved Tier 1, measured):** Catalog → set qty → Add → Cart link = **2 navigations** after land (header Cart). Reorder from Orders → Cart = **1 click** (stops before Checkout).

## 2. Page changes

| Surface | Change |
| --- | --- |
| Site header | Partner workspace on `/partner/*` (ex login/register) + `/cart` when signed in |
| Store strip | Ordering store + org only |
| Catalog | Replenishment rows + search |
| Cart | Store, lines, pending ship/tax, autosave |
| Orders | Status badges; hide failed by default; reorder CTA |
| Account | Profile + billing + support |
| Billing/Support/Profile URLs | Redirect to Account |
| Dashboard | Approved → Catalog |
| For Professionals | Post-approval Catalog path |

## 3. Screenshots (`docs/ux-evidence/`)

| File | Viewport | State |
| --- | --- | --- |
| `catalog-1440.png` | 1440 | Partner header, Melting Mask `$12.00`, ± Add |
| `catalog-390.png` | 390 | Mobile catalog + store strip |
| `catalog-320-overflow.png` | 320 | No horizontal overflow (`overflowX=false`) |
| `cart-1440.png` / `cart-390.png` | 1440 / 390 | Store + Melting Mask line |
| `orders-1440.png` | 1440 | Pre-filter history (includes noise era) |
| `orders-filtered-1440.png` | 1440 | After `893d6d7`: failed hidden; refunded first |
| `public-programs-1440.png` | 1440 | Approval copy, no `$12` |
| `public-kits-1440.png` | narrow capture | Approval language |

## 4. Scenario results (Phase 3)

| # | Scenario | Result |
| --- | --- | --- |
| 1 | Tier 1 find → add → qty → cart | **Pass** — `$12.00`, Added 2, Cart (2), line money |
| 2 | Reorder; stop before pay | **Pass** — cart + Checkout visible, not clicked |
| 3 | Refunded order UI | **Pass** — `refunded` / `unfulfilled` on `DB-MVG7294C` |
| 4 | Mobile select + cart | **Pass** — 390 screenshots; hamburger partner nav |
| 5 | Logged-out public no pro $ | **Pass** — programs approval copy; no `$12` (fresh cookie clear kept Vercel SSO) |
| 6 | Multi-store / pending / no price | **Partial** — unit fixtures for no-price/OOS; multi-store UI auto-select coded; hosted multi-identity **XB** |

## 5. Tests

- `npm test`: 82 passed  
- `npm run lint`: clean  
- `npm run build`: success (pre-push of `18c6372`)

## 6. Incomplete / priority

1. **P1** Hosted multi-store / unauthorized identity (**XB**)  
2. **P1** Stripe Tax registration (**XB**)  
3. **P2** Zoho OAuth (**XB**) — field map ready  
4. **P3** Footer session-aware Login link (B18)  
5. **P3** Staging SKU public detail 404 (B17)

## 7. Zoho

- Done: `docs/ZOHO_FIELD_MAP.md`, mapping modules, local tests  
- Not done: live CRM/Commerce/Books  
- Dependency: `ZOHO_*` on Preview; keep `CATALOG_SOURCE=supabase_cache`

## 8. Check first tomorrow (3)

1. Preview `/partner/catalog` — partner header, `$12.00`, ± Add  
2. `/cart` — qty persist after reload  
3. `/partner/orders` — paid/refunded first; failed hidden unless `?showFailed=1`

## Prior night (preserved)

Refunds on `DB-MVG7294C` ($5 + $12 → `refunded_cents=1700`) — do not repeat.  
Grants + `authorizedPriceLabel` remain in force.
