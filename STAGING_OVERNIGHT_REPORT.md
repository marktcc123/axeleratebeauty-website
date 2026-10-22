# Staging Overnight / Delivery Report

Branch: `feature/phase1-security-and-commerce-foundation`  
HEAD: `5d03742d2dc0e3aa10fd6903929903219df55568`  
Preview: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app  
Deploy: `dpl_7TSaY4t9EyK3B8nP1ywW2MrR4615` → `https://axeleratebeauty-website-g9wbz21oc-axelerateglobal.vercel.app`

## This delivery slice

1. **Acceptance corrected** — desktop ≠ mobile; re-verify → 未验证 until `v3-*`; fixtures separated from Preview; multi-store marked external block.  
2. **Orders money** — merchandise, shipping, tax, order total; Amount paid only when payment confirmed; Refunded + Net paid from `refunded_cents`.  
3. **Customer copy** — natural purchase language on Catalog / Cart / Orders / Account.  
4. **Content model** — `docs/PRODUCT_CONTENT_MODEL.md` + complete unapplied SQL with null-only JSON backfill.  
5. **Melting Mask 70** — `docs/MELTING_MASK_70_CONTENT_CHECKLIST.md` (assets in repo, not bound; formal content not claimed complete).  
6. **Browser v3** — Catalog→Detail→Add→Cart persist→Orders on HEAD; 1440/390/320 shots in `docs/ux-evidence/v3-*`.

## Verified on Preview

| Check | Result |
| --- | --- |
| Catalog `$12` + soft copy | Pass |
| Detail route + `$12` | Pass |
| Add feedback | Pass |
| Cart qty 8→9 reload | Pass |
| Orders refund net on `DB-MVG7294C` | Pass ($17 / $17 / $0) |
| Failed attempts collapsed + link | Pass |
| 320 overflow catalog | Pass (`overflowX=false`) |

## Not claimed complete

- Formal Melting Mask 70 commerce content  
- Multi-store / cross-company Preview  
- Migration applied / Zoho live sync  

## Boundaries kept

No new payments/refunds; no main merge; Supabase read-only; `CATALOG_SOURCE=supabase_cache`.
