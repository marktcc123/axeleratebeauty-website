# Product experience acceptance

Preview alias: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app

## Official retail 1019 catalog (this push)

**Commit:** `c321308`

| Item | Result |
| --- | --- |
| Source rows 2–67 | 66 accounted for in `data/imports/official-retail-1019/` |
| Front-end groups | 50 (variants preserved under groups) |
| Coming soon | 4 (`출시예정`) |
| Images | 66 matched via Excel cell `vm` → media (not file order) |
| Prices | None imported; new SKUs browse-only (`View details`) |
| Supabase / Zoho | Not written — see `IMPORT_REPORT.md` |
| Loader | `src/lib/catalog-official-retail.ts` → `catalog.json` (Preview / feature; production opt-in) |

### Local evidence (pre-push)

| Viewport | File |
| --- | --- |
| Catalog 1440 | `docs/evidence/official-retail-1019-catalog-1440.png` |
| Catalog 390 | `docs/evidence/official-retail-1019-catalog-390.png` |
| Melting Mask detail 1440 | `docs/evidence/official-retail-1019-melting-mask-1440.png` |
| Image alignment 1440 | `docs/evidence/official-retail-1019-image-alignment-1440.png` |

### Verify after deploy

1. `/partner/catalog` shows ~50 products, categories, search by name/barcode, pagination.
2. Melting Mask detail: 70g `8809645782874` / 220g `8809645783581` selectable; 220g never inherits the 70g staged price.
3. New items: no price, no Add to cart; detail shows “Online ordering coming soon”.
4. Image alignment page: `/imports/official-retail-1019/image-alignment.html`
5. Existing priced Melting Mask bridge (if staging offer present) applies only to barcode `8809645782874`.

## Prior notes

- Simulated fixtures never prove Preview catalog content.
- Do not merge to main or deploy production from this feature work.
