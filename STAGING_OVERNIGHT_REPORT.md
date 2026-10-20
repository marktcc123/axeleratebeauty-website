# Staging Overnight Report

Task source: `STAGING_NIGHT_TASK.md`  
Branch: `feature/phase1-security-and-commerce-foundation`  
Staging Supabase: `rwxwvbhfbezqkgnaqvrq` (`axelerate-beauty-staging`)  
Fixed Preview: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app

## Commits this night

| SHA | Summary |
| --- | --- |
| `185df98c62f92cb53c2f002dc880754e3f9c9ae1` | Prior: revoke writable catalog_products grants |
| `0f63089415e874a0e1573192d92811d791f9565d` | Authorized partner prices + purchase navigation |
| *(follow-up)* | Cart PartnerNav + Zoho field map + this report refresh |

Latest Preview deploy for `0f63089`: `dpl_557oSFMbRTSwGtQtyfEXpBWEkX6q` → unique URL `https://axeleratebeauty-website-28e197z1g-axelerateglobal.vercel.app` (alias = fixed Preview). READY.

## 1. Findings and evidence

### P0A catalog_products grants
Read-only SQL: `anon`/`authenticated` SELECT only; no INSERT/UPDATE/DELETE; `products` not selectable by browser roles; column write grants = 0; `relacl` `anon=r` / `authenticated=r`. `security_invoker=false` retained (advisor `security_definer_view` still present by design).

### P0B approved prices missing
Playwright before: Add to Cart visible, label still “Professional Pricing Available Upon Account Approval”.  
Cause: `publicPriceLabel` required `publicPriceVisible`; authorized offers only set `professionalPriceCents`.

### Tax = 0
Stripe PI `pi_3USUq0PQR7eBMTCw0LzOrzJI`: `livemode=false`, `amount_details.tax.total_tax_amount=0`, website `tax_cents=0`. Prior session: Tax registrations empty. Not a website “force zero” drop for this payment.

## 2. Customer path before → after

**Before:** Approved Tier 1 saw catalog cards without dollar amounts; dashboard did not prioritize reorder; single-store still showed store picker + “Use this store”; empty cart blamed approval.

**After:** Catalog shows `$12.00` for Melting Mask; Partner nav Catalog/Orders/Billing/Account/Support; approved login redirects to catalog; single store shows static “Ordering store: …”; empty cart tells approved users to browse catalog; cart notes store name ≠ full ship address.

## 3. Changes

- `authorizedPriceLabel` vs `publicPriceLabel` split (`src/lib/commerce/guards.ts`)
- ProductCard + kit detail use authorized label when `canPurchase`
- Cart empty copy, PartnerNav, LocationSelect single-store, dashboard CTAs, login redirect
- `docs/ZOHO_FIELD_MAP.md`
- Task + overnight report files

## 4. Preview URL and SHA

- Deploy: `dpl_557oSFMbRTSwGtQtyfEXpBWEkX6q`
- Commit at deploy: `0f63089415e874a0e1573192d92811d791f9565d`
- Alias: fixed Preview URL above

## 5. Screenshots

- `verify-catalog-priced.png` — Melting Mask **$12.00**, Partner nav, single-store label
- Earlier: `verify-partner-catalog.png` (pre-fix wrong label), `verify-cart.png`, `verify-partner-orders.png`

## 6. Tests / browser acceptance

**Local:** `npm test` 79 passed; `npm run lint` passed (price commit).

**Browser (Playwright, logged-in Preview after deploy):**
- `/partner/catalog`: Melting Mask `$12.00`, Staging Concurrent Stock `$12.00`, Add to Cart, Ordering store LA Tier 1
- `/cart`: empty copy for approved users; store disclaimer
- `/partner/orders`: previously verified readable (paid/failed history)

**Hosted DB (read-only MCP):** grants matrix; order refund totals after Stripe test.

## 7. Not verified / why

- Cross-company / unauthorized-store hosted identity (no second isolated account this run)
- Multi-connection inventory concurrency on hosted DB
- Stripe Tax with a real registration (registrations empty)
- Zoho live API (no `ZOHO_*` on Preview env list)
- Browser mobile viewport pass not exhaustive
- Inventory restock-on-refund not claimed (no rule to convert dollars → units)
- Stripe Idempotency-Key header not available via MCP write params; duplicate after full refund correctly rejected by Stripe (“already been refunded”)

## 8. Test refunds (no secrets)

| Item | Value |
| --- | --- |
| Order | `DB-MVG7294C` |
| PI | `pi_3USUq0PQR7eBMTCw0LzOrzJI` |
| Charge | `ch_3USUq0PQR7eBMTCw0S7LdDBF` |
| Livemode | false (sandbox `acct_1USPyFPQR7eBMTCw`) |
| Original total | 1700¢ ($12 + $5 ship + $0 tax) |
| Partial refund | `re_…TIE5YB8` 500¢ succeeded → order `partially_refunded` / `refunded_cents=500` |
| Remainder | `re_…U9htbX3` 1200¢ succeeded → order `payment_status=refunded`, `status=refunded`, `refunded_cents=1700` |
| Website refund rows | 2 succeeded |
| Settlement | 1 sale + 2 refund_adjustment (all `cost_missing` — expected without cost base) |
| Over-refund attempt | Rejected by Stripe |

## 9. Zoho

See `docs/ZOHO_FIELD_MAP.md`. Preview env has **no** `ZOHO_*` keys. `CATALOG_SOURCE` present (keep `supabase_cache`). Integration code exists under `src/lib/integrations/zoho/` but live CRM/Commerce not callable without credentials.

## 10. SQL for humans

None pending for grants (already applied). Phase 1 + RPC hardening still absent from `supabase_migrations` history (only `catalog_products_select_only` recorded) — optional later reconcile, not run tonight.

## 11. Launch blockers

1. Stripe Tax registrations empty → tax always $0 even when automatic_tax complete  
2. Zoho credentials missing on Preview → cannot verify CRM/Commerce  
3. Settlement `cost_missing` until Belle cost / Brow Arc supplier base entered  
4. Migration history drift vs SQL Editor-applied schema  

## 12. Morning top 3

1. Confirm Melting Mask `$12.00` and Partner nav on Preview (or open `verify-catalog-priced.png`)  
2. Review refunded order `DB-MVG7294C` in Stripe sandbox + website orders UI  
3. Decide whether to add Zoho staging OAuth envs (still keep `CATALOG_SOURCE=supabase_cache`)  

## Metrics definitions (lightweight)

| Metric | Definition | Notes |
| --- | --- | --- |
| HQ/store purchase $ | Sum paid order `subtotal_cents` (or `total_cents` if including ship/tax — pick one and document) | Prefer merchandise vs all-in separately |
| Order count | Count orders with `payment_status` in paid/partially_refunded/refunded as needed | Exclude failed |
| Last purchase | Max `created_at` among paid | |
| Refunds | Sum succeeded `refunds.amount_cents` | Dedup by stripe_refund_id |
| Belle gross margin | customer merchandise − purchase_cost | Blocked while `cost_missing` |
| Brow Arc commission | 15% of confirmed supplier-price base | Blocked while base missing |
| Test vs real | Filter staging orgs / `STG-*` SKUs | Never mix into business KPIs |
