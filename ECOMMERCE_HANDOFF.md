# Dermabell Professional — Commerce Handoff

Operating entity: **AXELERATE INC.**  
Brand: **Axelerate Beauty / Dermabell Professional**  
Review branch: `feature/phase1-security-and-commerce-foundation`

All customer purchases are intended to be collected by Axelerate on the website, then settled internally with AOETO. Customer screens never show commission, supplier cost, or internal ownership. Historical payment recipients are not rewritten.

## Current status

| Area | Status |
| --- | --- |
| Phase 1 permission, price isolation, atomic checkout, inquiry persist | Implemented in code; waiting for Supabase migration apply |
| Phase 2 Zoho CRM server layer, mapping, retry | Implemented; waiting for Zoho OAuth credentials |
| Phase 3 HQ/store authorization and partner portal | Implemented against new tables; waiting for migration + real accounts |
| Phase 4 Zoho Commerce catalog switch | Client + `CATALOG_SOURCE` flag only. One-SKU verification not run |
| Phase 5 billing, refunds, AOETO settlement drafts | Foundation only. No live Books posting |
| Phase 6 public UX, a11y, SEO | Partial: homepage paths, noindex, labels, reduced motion |

This increment does **not** deploy production, charge cards, send customer email, or run destructive production migrations.

## Architecture

- **Next.js**: public brand site + partner portal + protected server actions
- **Supabase**: transitional auth, RLS, orders, sync jobs, product cache
- **Stripe Checkout**: hosted payment. Success page is never payment proof
- **Zoho CRM**: customers, contacts, inquiries, follow-up (when configured)
- **Zoho Commerce**: intended future source of purchasable SKUs and customer prices
- **Zoho Books**: future invoices and payables. Not enabled
- **Catalyst**: later option only. Auth is not being rewritten onto it

### Who owns which data

| Data | Source of truth | Website role |
| --- | --- | --- |
| Marketing pages, programs, approved case stories | Website | Author and publish |
| Login identity | Supabase Auth | Authenticate |
| Approval / suspend / store assignment | Website admin | Controls portal access |
| Zoho Account / Contact IDs | Admin mapping after live CRM read | Store IDs only; never bind by company name |
| CRM follow-up notes | Zoho CRM | Sync inbound later; ignore website-origin loops |
| Purchasable SKU, publish state, customer price | Zoho Commerce after one-SKU verification | Local `products` becomes read-only cache |
| Checkout order, Stripe IDs, payment status | Website + Stripe | Persist even if Zoho sync fails |
| Supplier cost, commission, AOETO payable | Internal `settlement_records` | Never shown to customers |
| In-transit AOETO lots | `inbound_shipments` | Not sellable SKUs |
| Laredo contract text | Existing contract | Installments stay on the contract; no extra sales orders |

Field owners are also listed in `src/lib/integrations/zoho/mappings.ts`.

## Phase 1 fixes shipped

1. **Profile privileges.** Users can update `full_name` only. Trigger blocks `is_admin`, `role`, and `organization_id` changes except via service role.
2. **Protected prices.** Public catalog reads `catalog_products` / explicit columns. `professional_price_cents` is not selected for anonymous or unapproved users. `product_offers` has no public SELECT.
3. **Checkout.** Order items must insert before Stripe session creation. Failed item writes delete the pending order. Amounts are integer cents from authorized offers, not the browser.
4. **Webhooks.** `claim_processed_event` is unique per Stripe event. `mark_order_paid` updates only when not already paid. Inventory uses `decrement_tracked_inventory`. Processing failures are stored and the event claim is released so Stripe can retry.
5. **Auth.** New registrations create a **new pending organization**. Existing companies are joined only through an admin invite token matched to email. Confirmation goes to `/auth/callback`. Password reset goes to `/partner/reset`.
6. **Inquiries.** Success is returned only after the row is saved. Mailto is an optional backup, not completion proof.

## Database migration

Apply in a staging/project SQL editor, never blindly on production:

1. `supabase/schema.sql` if the project is new
2. `supabase/migrations/20261019_phase1_security.sql`

Rollback: `supabase/migrations/20261019_phase1_security_rollback.sql`  
Rollback restores the older public product policy and drops new tables. It does not delete paid orders. Review before running.

Compatibility: the app still starts without the migration. Location memberships and the catalog view will be empty/unavailable, so purchasing stays locked instead of inventing data.

## Environment variables

See `.env.example`. No real secrets belong in git.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL and auth redirects |
| `DEV_PREVIEW_AUTH` | Localhost-only fake approved session |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/server user client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged writes after identity checks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js if used |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Checkout + webhook verify |
| `STRIPE_AUTOMATIC_TAX` | Enable only after Stripe Tax is configured |
| `CATALOG_SOURCE` | `supabase_cache` (default) or `zoho_commerce` |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` | Server OAuth only |
| `ZOHO_ACCOUNTS_URL` / `ZOHO_API_DOMAIN` | Data-center accounts host and fallback API host. Runtime uses `api_domain` from token refresh |
| `ZOHO_COMMERCE_ORG_ID` / `ZOHO_COMMERCE_API_DOMAIN` | Commerce admin API, not the public storefront |

## Zoho and payment console setup

### Zoho CRM

1. Create a server-side OAuth client. Do not expose secrets with `NEXT_PUBLIC_`.
2. Use the correct accounts host for the data center.
3. Minimum scopes used by this repo: Leads create/read, Accounts read, Contacts create/read, Deals create/read.
4. Store a refresh token in `ZOHO_REFRESH_TOKEN`.
5. Known HQ IDs are **candidates only**. An admin must open `/admin`, enter the exact ID, and let the server read the Account before binding:

- Brow Arc: `7644545000000710001` (commission)
- Belle Brows & Beauty: `7644545000000710002` (wholesale)
- AOETO USA INC.: `7644545000000710003` (internal, not a website buyer)

Flora is not a sales customer and is not seeded.

### Zoho Commerce

Official admin product API: `GET https://commerce.zoho.com/store/api/v1/products` with `X-com-zoho-store-organizationid`.  
The public storefront API is **not** used for customer or supplier prices. `purchase_rate` must stay server-side.

Do not set `CATALOG_SOURCE=zoho_commerce` until one real SKU is read, priced, and ordered in a sandbox. Until then the local catalog is a transitional cache.

### Stripe

1. Sandbox first.
2. Webhooks: `checkout.session.completed`, plus refund events (`charge.refunded` / `refund.created`).
3. Endpoint: `/api/webhooks/stripe`.
4. Collect U.S. shipping. Do not advertise free shipping or tax.

## Commercial rules encoded in code

- **Brow Arc (commission):** 15% of supplier-price sales, including replenishment. Missing supplier cost → `cost_missing`. Never use $0 or the customer selling price as the base. Tax, shipping, fees, and refunds are separate. No automatic AOETO due date.
- **Belle Brows / Axelerate direct (wholesale):** store sale, purchase cost, fees, and payable separately. Missing cost is not profit.
- One website order = one store. HQ users may switch authorized stores.
- Laredo $10,500 / 3×$3,500 stays a contract. Estimated dates do not complete training or trigger collection. The $3,000 bonus is not receivable until verified.
- Five AOETO ocean lots are inbound supply, not five customer orders and not sellable SKUs.

## Partner portal routes

- `/partner/register` `/partner/login` `/partner/reset` `/partner/dashboard`
- `/partner/catalog` `/partner/orders` `/partner/billing` `/partner/profile` `/partner/support`
- `/cart` `/checkout/success` `/checkout/cancel`

Customer-facing copy stays in English and does not mention CRM fields or settlement math.

## Public site

Homepage now has two paths: Full Salon System consultation and professional login/reorder. Full Salon System remains consultative. Policy pages remain drafts and are noindexed.

## Launch checklist before real charges

1. Apply the Phase 1 migration on the intended Supabase project.
2. Confirm email auth, `/auth/callback`, and reset email templates.
3. Create the first platform admin in SQL (`profiles.is_admin = true`). Never allow self-promotion.
4. Map verified Zoho Accounts. Invite existing chain staff; do not let them type into Brow Arc / Belle Brows.
5. Publish only approved SKUs, linked by SKU / Zoho Product ID.
6. Finish shipping, tax, resale-certificate, and legal policy review.
7. Use Stripe sandbox, then one internal live test.
8. Keep `CATALOG_SOURCE=supabase_cache` until Commerce verification succeeds.
9. Do not enable Books dual-posting while website settlement records exist.

## Verification

- `npm test`: 24 passed (commerce guards, public price strip, settlement drafts, Zoho-not-configured).
- `npm run lint`: passed.
- `npm run build`: passed (Next.js 16.2.11).
- Browser on localhost with `DEV_PREVIEW_AUTH`: homepage dual CTAs, Full Salon System remains consultative, cart shows store selector and empty state, partner dashboard/catalog/billing render without fake products or fake paid orders, register copy states that a typed company name does not join an existing group, privacy policy stays a draft, inquiry submit does not claim success when validation fails.
- Live Stripe checkout was not executed.
- Zoho CRM/Commerce live calls were not executed. Missing credentials correctly throw `not_configured` instead of a fake success.

Intentionally **not** claimed as passing:

- Live Stripe payment or refund
- Live Zoho CRM lead create
- Zoho Commerce SKU read, customer price book, or order
- Concurrent inventory under production load
- Email deliverability and confirmation-mail templates
- Production RLS against a live project
- Books posting or AOETO payout calculation with real costs
