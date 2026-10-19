# Dermabell Professional — Commerce Handoff

## Technical audit (current repository)

The existing site was a Next.js 16 + Tailwind + Framer Motion marketing landing page. There was:

- No authentication
- No database
- No Shopify, Stripe, or CRM integration
- No cart or checkout
- No admin surface
- Hosting assumed as Vercel via GitHub (`axeleratebeauty-website`)

Existing Full Salon System storytelling, photography, and design tokens were preserved.

## Selected architecture: Option B

**Existing Next.js frontend + Supabase auth/database + Stripe-hosted Checkout.**

Why not Shopify: the brief forbids assuming Shopify Plus / paid B2B. Shopify would also create a second customer-account system unless the entire site moved onto Shopify.

Why not a custom card vault: PCI and tax/shipping should stay on hosted infrastructure.

Tradeoffs:

- Requires a Supabase project and Stripe account
- Tax/shipping accuracy depends on Stripe Tax and shipping configuration
- Admin is a lightweight internal UI; Stripe Dashboard remains the payment console

## What shipped in this increment

- Unified navigation and dual-offer homepage
- `/full-salon-system` consultative funnel (no $10,000 cart item)
- `/professional-programs` catalog and `/professional-programs/[slug]` template
- `/professional-kits` redirects to the programs catalog; prices remain unpublished
- Secure product model with Draft / Active / Archived
- Partner register / login / dashboard / orders / profile
- Cookie cart with server-side price validation
- Stripe Checkout session creation
- Webhook-verified payment confirmation
- Admin review of accounts, products, and fulfillment
- Draft policy pages that are **not** final legal terms

No unpublished kits were invented. The catalog stays empty until an admin enters approved SKUs and prices.

## Configuration steps

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Email auth. Turn on email confirmation for production.
4. Create your user, then set `profiles.is_admin = true` for that user after first login, or insert the profile row manually.
5. Add env vars from `.env.example`.
6. For local UI review only, set `DEV_PREVIEW_AUTH=true` in `.env.local` and restart `npm run dev`. This is ignored in production and on non-localhost hosts. It does not create real accounts or paid orders.
6. Create a Stripe sandbox account.
7. Point webhook `checkout.session.completed` to `/api/webhooks/stripe`.
8. Do not switch to live keys until tax, shipping, and policies are approved.

## How to add and publish the four products

1. Sign in as a platform admin and open `/admin`.
2. Enter official SKU, slug, name, description, intended use, and price in **cents**.
3. Leave status `draft` until contents, images, shipping attributes, and inventory are approved.
4. Set status to `active` only when the launch checklist is complete.
5. Draft and archived products cannot be purchased.

Launch checklist before Active:

- Official name and SKU
- Approved price
- Package contents
- Shipping attributes
- Inventory or fulfillment setting
- Professional-use notes / precautions if required

## How to approve businesses

`/admin` → Business accounts → Approved / Rejected / Suspended.

Pending and rejected accounts cannot checkout. Suspended accounts are blocked server-side.

## How to manage orders

Orders are created as `pending_payment`. They become `paid` only after a verified Stripe webhook. Use `/admin` to add tracking and fulfillment status. Refunds should be processed in Stripe, then recorded on the order.

## Shipping and tax

- Shipping address collection is U.S.-only at checkout.
- Set `STRIPE_AUTOMATIC_TAX=true` only after Stripe Tax is configured.
- Resale exemption must not be assumed. Collect certificates and configure Stripe Tax / accounting separately.

## Refunds

Use Stripe Dashboard or the Stripe refund API. Do not mark an order refunded in the website unless the Stripe refund succeeded.

## Connecting live payments

1. Complete legal policies.
2. Confirm nexus and tax settings with accounting.
3. Replace sandbox keys with live keys.
4. Update the webhook endpoint to production.
5. Place a real low-value test only with an approved internal account.

## Verification run in this increment

- `npm test`: 6 commerce-guard tests passed (unapproved/suspended buyers, draft/archived products, catalog prices, quantity bounds).
- `npm run lint`: passed.
- `npm run build`: passed (Next.js 16.2.11).
- Browser checks on localhost: homepage dual-offer navigation, `/professional-kits` empty catalog, `/full-salon-system` consultative CTAs only, `/cart` empty, `/partner/register` pending-account copy, `/partner/dashboard` and `/admin` redirect to login, unpublished product slug returns 404, `/store-evaluation` inquiry form still works.
- Live Stripe checkout was not executed. No sandbox or live payment was completed.

## Known blockers

- Supabase and Stripe credentials are not in this repository.
- The four kit names, prices, SKUs, images, and contents are not approved yet.
- Policy copy is placeholder text.
- Confirmation emails, CRM sync, file-upload storage, analytics events, and ACH/net terms are not activated.
- Rate limiting still depends on Supabase Auth / hosting defaults; add a dedicated limiter before production.
- No live order has been processed.

## Security notes

- Cart prices from the browser are ignored.
- Product publication and buyer approval are enforced in server actions.
- Webhook signatures are verified.
- Duplicate `checkout.session.completed` events are ignored when already paid.
- Organization-scoped RLS limits customer reads to their own orders and profile.
- Service-role key must remain server-side only.
