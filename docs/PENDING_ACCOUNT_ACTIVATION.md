# Historical pending account activation (do not batch)

## Rule

New independent US B2B signups are **self-serve**: after email confirmation they receive **Tier 3** and may purchase sellable products without a manual “approve to buy” step.

**Historical** `organizations.verification_status = 'pending'` rows are **not** batch-activated by this change. Suspended / rejected accounts stay blocked.

## Concepts (keep separate)

| Concept | Maintainer | Notes |
| --- | --- | --- |
| Email verification | Supabase Auth (`email_confirmed_at`) | Required for `canPurchase` |
| Purchase eligibility | Website `organizations.verification_status` | `approved` may buy; `pending` / `rejected` / `suspended` may not |
| Price tier | Website admin (default 3 on self-serve insert) | Tier 1/2 never auto-downgraded by Zoho map |
| HQ / location membership | Invite / admin assignment | Typed company name never binds Belle / Brow Arc |

## Ops checklist before activating a pending org

1. Confirm the business is legitimate and not a duplicate of an existing HQ.
2. Decide tier explicitly (keep Tier 1/2 if already granted; default new independents to 3).
3. Confirm at least one authorized location membership exists.
4. Set `verification_status` to `approved` (or leave pending / suspend) via admin tools — not via client form fields.
5. Do not activate in bulk from a name match against Zoho Accounts.

## Inventory query (manual, read-only)

```sql
SELECT id, name, verification_status, price_tier, created_at, zoho_account_id
FROM public.organizations
WHERE verification_status IN ('pending', 'rejected', 'suspended')
ORDER BY verification_status, created_at ASC;
```

Staging Supabase is currently **read-only** for agents; run this only with ops credentials when listing work.
