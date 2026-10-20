# Staging Overnight Report

Started from task `STAGING_NIGHT_TASK.md`. Branch: `feature/phase1-security-and-commerce-foundation`. Staging ref: `rwxwvbhfbezqkgnaqvrq`. Fixed Preview: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app

## Progress log

### P0A — catalog_products grants (2026-10-20)

**Evidence (read-only SQL on staging):**
- `anon` / `authenticated`: SELECT yes; INSERT/UPDATE/DELETE no
- `products` SELECT for browser roles: no
- `relacl`: `anon=r`, `authenticated=r`, `service_role=arwdDxtm`
- Column write grants for browser roles: 0
- View still `security_invoker=false` (expected; advisor `security_definer_view` remains)

**Result:** Prior `catalog_products_select_only` repair is effective. No new migration required this round.

### P0B — approved price label (in progress)

**Evidence:** Playwright catalog showed Add to Cart while label still said “Professional Pricing Available Upon Account Approval”.

**Root cause (code):** `publicPriceLabel` requires `publicPriceVisible`; authorized offers set `professionalPriceCents` only.

**Change:** Add `authorizedPriceLabel`; ProductCard + kit detail use it for approved buyers; cart empty copy respects `canCheckout`.

**Tests:** `npm test` 79 passed including new label cases.
