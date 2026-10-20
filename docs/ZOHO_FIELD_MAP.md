# Zoho field map and system responsibilities (staging prep)

Status: **credentials not verified in this overnight run**. Keep `CATALOG_SOURCE=supabase_cache`. Do not write production Zoho data.

## System ownership

| System | Owns | Reads |
| --- | --- | --- |
| Zoho CRM | HQ Account, Contacts, deal/follow-up notes | Website org mapping IDs |
| Zoho Commerce | Purchasable SKU, publish state, customer price books (intended) | Website cache after verification |
| Zoho Books | Invoice, receipt, refund accounting (future) | Stripe payment/refund facts |
| Supabase | Auth identity, org/store authorization, order cache, sync job rows | Stripe webhooks, Zoho sync results |
| Stripe | PaymentIntent / Checkout Session / Refund truth | Website order linkage via IDs |
| Website admin | Verification status, store membership, Zoho ID binding | Never invent Zoho Account by company name alone |

## Commercial models (must not collapse)

- **Brow Arc**: commission 15% of confirmed supplier-price sales; AOETO contract ownership.
- **Belle Brows & Beauty**: Axelerate wholesale (buy from AOETO, sell to customer).
- Website collects payment under Axelerate; internal settlement is separate and never shown to customers.

## Order / sync field map

| Field | Maintainer | Direction | Trigger | Conflict rule |
| --- | --- | --- | --- | --- |
| HQ Zoho Account ID | Website admin after live CRM read | CRM → website mapping | Manual bind | Never overwrite with name match |
| Store / location | Website | Website → CRM Contact/custom (future) | After approval | One order = one store |
| Price tier | Website (or Commerce price book later) | Read for checkout | Offer resolve | Location > HQ > tier formula |
| Stable SKU | Commerce (intended) / website cache now | Commerce → website | Catalog sync job | SKU is join key |
| Unit price at sale | Website checkout from authorized offer | Snapshot on order_items | Checkout create | Historical rows immutable |
| Quantity | Website cart | Website → Books line (future) | Paid event | Paid snapshot wins |
| Discount | Not implemented | — | — | Do not invent |
| Shipping | Stripe Checkout / Shipping Rate | Stripe → order | Session complete | Unknown ≠ $0 |
| Tax | Stripe Tax | Stripe → order | Session complete | Registration empty ⇒ $0 observed |
| Order total | Stripe amount_total + website order | Stripe confirms | Webhook paid | Stripe amount is payment truth |
| Payment status | Stripe webhook → website RPC | Stripe → website | claim≠complete | Do not mark paid from success URL alone |
| Refunds | Stripe Refund → website `apply_refund` | Stripe → website | refund.* events | Dedup by `stripe_refund_id` |
| Fulfillment | Website / ops (manual today) | Website | Ops update | No fake tracking numbers |
| Stripe PI / Session IDs | Stripe + website orders | Bidirectional lookup | Checkout + webhook | Unique constraints |
| Zoho CRM / Commerce IDs | Mapping tables | After verified API | Sync job | Missing ID ⇒ pending, not fake success |
| Sync status | `zoho_sync_jobs` | Website | Enqueue + worker | Retryable; failure keeps paid order |

## Config checklist (Preview / staging)

Required for CRM read-only probe (not set on Preview as of overnight check unless added later):

- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ACCOUNTS_URL`
- `ZOHO_API_DOMAIN` (fallback)

Commerce switch only after one real SKU priced and ordered in sandbox:

- `ZOHO_COMMERCE_ORG_ID`
- `ZOHO_COMMERCE_API_DOMAIN`
- Do **not** set `CATALOG_SOURCE=zoho_commerce` until verified

## Known code entry points

- `src/lib/integrations/zoho/config.ts` — env assembly
- `src/lib/integrations/zoho/oauth.ts` — token refresh
- `src/lib/integrations/zoho/crm.ts` / `commerce.ts` — API clients
- `src/lib/integrations/zoho/sync.ts` — job enqueue / process
- `src/lib/integrations/zoho/mappings.ts` — candidate Accounts + field owners

## Overnight verification

- Local: Zoho modules present; `isZohoCrmConfigured()` requires four env vars.
- Hosted Preview Zoho envs: treat as **absent / unverified** unless CLI env pull proves otherwise (do not print secrets).
- No live CRM Account read or Lead create executed this run.
