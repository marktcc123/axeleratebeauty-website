# Dermabell Professional — Commerce Handoff

Operating entity: **AXELERATE INC.**  
Brand: **Axelerate Beauty / Dermabell Professional**  
Review branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1

All customer purchases are intended to be collected by Axelerate on the website, then settled internally with AOETO. Customer screens never show commission, supplier cost, or internal ownership. Historical payment recipients are not rewritten.

This increment does **not** deploy production, charge cards, send customer email, merge to main, or run production migrations.

## Current status

| Area | Status |
| --- | --- |
| Phase 1 permission, price isolation, checkout, inquiry persist | Code + temporary-database migration tests passed; staging/production Supabase apply is still pending |
| Phase 2 Zoho CRM server layer, mapping, retry | Implemented; waiting for Zoho OAuth credentials |
| Phase 3 HQ/store authorization and partner portal | Implemented against new tables; waiting for migration + real accounts |
| Phase 4 Zoho Commerce catalog switch | Client + `CATALOG_SOURCE` flag only. Keep `supabase_cache` until one-SKU verification |
| Phase 5 billing, refunds, AOETO settlement drafts | Semantic fields and refund adjustments implemented. No live Books posting |
| Phase 6 public UX, a11y, SEO | Partial: homepage paths, noindex, labels, reduced motion |

## Review-fix notes (this increment)

- Migration order is columns first, then tables, then `catalog_products`, then policies/functions. Existing same-name policies from `schema.sql` are dropped before recreate.
- Public catalog reads only `catalog_products` columns. Database errors are thrown (`CatalogError`); they are not converted into an empty warehouse.
- Payment, event, inventory, and refund RPCs revoke `PUBLIC` / `anon` / `authenticated` execute. `protect_profile_privileges` never treats `current_user` as caller authorization.
- Inventory decrement locks the product row, uses a conditional quantity update, and deletes any movement if the update does not apply exactly one row.
- Replayed `mark_order_paid` calls leave `partially_refunded` / `refunded` in place.
- Refunds lock the order (then existing refund rows) before summing. `succeeded` and `failed` are not overwritten by a later `pending` event.
- Webhook claim is not completion. Failed or stale claims can be reclaimed. Missing orders fail. Card is the only Checkout payment method; async success/failure events are handled.
- Refunds dedupe by Stripe refund ID, accumulate succeeded amounts, and mark the order refunded only when the total is covered.
- Checkout requires Stripe Tax + `STRIPE_SHIPPING_RATE_ID`. Unknown tax/shipping is never treated as $0. Session create uses an idempotency key; unlinkable sessions are expired.
- Belle and Brow Arc are both Tier 1. Tier 2 = Tier 1 × 1.20; Tier 3 = Tier 2 × 1.20. Location > headquarters > tier. No customer tier or valid price means no purchase.
- Belle purchase cost and Brow Arc commission base are independent. Belle unit cost = Excel E ÷ 0.6. Brow Arc commission is 15% of a confirmed supplier-price base. Missing base stays `cost_missing`.
- CRM Product ID, Commerce Product ID, and Variant ID are stored separately.
- Cart quantity edits are optimistic on the client, then serialized to one cookie write of the latest snapshot. Checkout stays locked while quantity is dirty or saving. Checkout still re-prices from the server cart.
- Checkout uses a client form + `useActionState`. Failures return a readable error; success still redirects to Stripe. Diagnostic logs record stage, code/status, and association IDs only.
- Continue shopping points to `/partner/catalog`. Homepage revalidation was removed from quantity saves.
- Order history treats query failure as an error, not an empty list. Line items come from order snapshots; reorder links come from the authorized catalog, not a nested `products` embed.
- Checkout success shows processing, paid, or query failure from the server order. Cart cleanup runs only in a Server Action after the signed-in user can access a paid order, using the checkout snapshot, cart version, and line IDs. Pending payment does not clear the cart. A same SKU removed and re-added after checkout gets a new line ID and is not subtracted. Webhooks cannot clear the browser cookie.

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

## Database migration

Apply in a staging/project SQL editor, never blindly on production:

1. `supabase/schema.sql` if the project is new
2. `supabase/migrations/20261019_phase1_security.sql`
3. `supabase/migrations/20261019_phase1_rpc_hardening.sql`
4. `supabase/staging/seed_internal_test.sql` on staging only

Rollback: `supabase/migrations/20261019_phase1_security_rollback.sql`  
Rollback restores the older public product policy and drops new tables. It does not delete paid orders. Review before running.

Temporary-database verification (not production, not `npm build`):

- `npm test` / `npm run test:db` loads bootstrap + `schema.sql` + both Phase 1 migrations into PGlite.
- Those tests are a **single PGlite connection**. They do not prove hosted multi-connection concurrency.
- PGlite does not ship `pgcrypto`. The test skips that one `CREATE EXTENSION` line; `gen_random_uuid()` comes from core Postgres.
- Staging console steps and env var names: `supabase/staging/CHECKLIST.md`.

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
| `STRIPE_AUTOMATIC_TAX` | Must be `true` before a payable Session can be created |
| `STRIPE_SHIPPING_RATE_ID` | Required Stripe shipping rate. Unknown shipping is never $0 |
| `CATALOG_SOURCE` | Keep `supabase_cache` until Commerce verification |
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

- Brow Arc: `7644545000000710001` (commission, price tier 1)
- Belle Brows & Beauty: `7644545000000710002` (wholesale, price tier 1)
- AOETO USA INC.: `7644545000000710003` (internal, not a website buyer)

Flora is not a sales customer and is not seeded.

### Zoho Commerce

Official admin product API: `GET https://commerce.zoho.com/store/api/v1/products` with `X-com-zoho-store-organizationid`.  
The public storefront API is **not** used for customer or supplier prices. `purchase_rate` must stay server-side.

Do not set `CATALOG_SOURCE=zoho_commerce` until one real SKU is read, priced, and ordered in a sandbox.

### Stripe

1. Sandbox first.
2. Webhooks: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `refund.created`, `refund.updated`, `refund.failed`, `charge.refunded`.
3. Endpoint: `/api/webhooks/stripe`.
4. Checkout payment methods: `card` only. Async card-adjacent events are processed; other methods are not enabled.
5. Enable Stripe Tax and create a shipping rate before opening checkout.

## Commercial rules encoded in code

- **Brow Arc (commission):** 15% of confirmed supplier-price sales. Missing `commission_base_cents` → `cost_missing`. Never use Belle purchase cost, $0, or the customer selling price. Tax, shipping, fees, and refunds are separate. No automatic AOETO due date.
- **Belle Brows / Axelerate direct (wholesale):** store sale and `purchase_cost_cents` (Excel E ÷ 0.6) stay independent from Brow Arc. Missing cost is not profit.
- Refund adjustments are new settlement rows; they do not rewrite the original sale.
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

1. Apply the Phase 1 migration on the intended Supabase project. Do not treat `npm build` as migration proof.
2. Confirm email auth, `/auth/callback`, and reset email templates.
3. Create the first platform admin with `app.allow_privilege_write=on` or a service-role write. Never allow self-promotion.
4. Map verified Zoho Accounts and set the customer price tier. Invite existing chain staff; do not let them type into Brow Arc / Belle Brows.
5. Publish only approved SKUs, with CRM / Commerce / variant IDs stored separately.
6. Set `STRIPE_AUTOMATIC_TAX=true` and `STRIPE_SHIPPING_RATE_ID` after tax and shipping review.
7. Use Stripe sandbox, then one internal live test.
8. Keep `CATALOG_SOURCE=supabase_cache` until Commerce verification succeeds.
9. Do not enable Books dual-posting while website settlement records exist.

## 实际通过

- Local `npm test` on a single PGlite connection, including:
  - `schema.sql` + `20261019_phase1_security.sql` + `20261019_phase1_rpc_hardening.sql`
  - Failed tracked decrement leaves no inventory movement
  - Paid-event replay does not overwrite `partially_refunded` or `refunded`
  - Late `pending` refunds do not replace `succeeded` or `failed`
  - Sequential same-connection refund totals
  - Staging seed creates Melting Mask 1200/1440/1728 and split Zoho IDs
  - Earlier catalog, privilege, claim, and settlement assertions
  - Cart quantity merge/dirty checks and checkout log redaction
  - Order list failure vs empty vs ready, cross-org denial, paid-only cart subtract, and one-time cleared-order marker
  - Same-SKU remove-and-readd after checkout is not subtracted by the paid snapshot
- `npm run lint` and `npm run build` are compiled separately; they do **not** replace the migration test.

## 尚未验证

- Hosted Supabase apply of schema + both migrations
- Hosted / multi-connection inventory or refund concurrency (PGlite single-connection tests are not this proof)
- Live Stripe sandbox charge, refund, or webhook delivery
- Production RLS against a live project
- Zoho CRM live Account read or Lead create
- Zoho Commerce SKU read, customer price book, or order
- Email deliverability and confirmation-mail templates
- Books posting or AOETO payout with verified real costs
- Browser checkout with tax + shipping rate configured
- Production apply of any SQL in this branch
- Real staging email delivery and first-click password recovery. Local tests do **not** prove the recovery inbox flow.
- Browser cart quantity clicks, cookie persistence, and Stripe Checkout redirect. Local unit tests do **not** prove this UI.
- Real webhook delivery driving the success-page refresh, and browser cart cleanup after Stripe return. Local unit tests do **not** prove this flow.
- Stripe Tax with at least one active registration. Recent sandbox sessions show `automatic_tax.status=complete` and `amount_tax=0` because tax registrations are empty; that is not proof that website tax mapping is wrong.
- Partial and full sandbox refunds against website order/settlement totals.
- Cross-company and unauthorized-store reads against the hosted staging database.
- Preview browser flows while Vercel Deployment Protection is on.
