# Official Retail 1019 import report

- Source: `Global Official Retail Price List (Retail 공유용) 1019.xlsx` / sheet `시트1` rows 2–67
- Source records: **66**
- Product groups (front-end): **50**
- Coming soon: **4**
- Images matched via cell vm: **66** / missing **0**
- Multi-component barcode packs: **4**
- Merged-name inherited rows: **15**
- Alias rename rows: [59]

## Melting Mask barcodes

- `8809645782874` row 62 · 70g
- `8809645783581` row 63 · 220g

## Status

- Supabase: **not applied** (read-only)
- Zoho: **not written**
- Prices: **none imported**
- Preview loads `catalog.json` via `src/lib/catalog-official-retail.ts` (not claimed as DB/Zoho import)

## Counts this run

| Outcome | Count |
| --- | ---: |
| Source rows accounted for | 66 |
| Front-end product groups | 50 |
| Coming soon | 4 |
| Images matched (cell vm) | 66 |
| Pending image confirmation | 0 |
| Prices created | 0 |

## Remaining steps (DB / Zoho — not done this round)

1. Review `catalog.json` + `image-map.json` against the Excel source.
2. Apply a Supabase migration / upsert that maps barcodes → products/variants **without** inventing prices or overwriting Zoho IDs / existing SKUs.
3. Bridge Melting Mask `8809645782874` to the existing priced staging row only after barcode confirmation (Preview already uses a display bridge).
4. Publish authorized Tier prices separately; keep browse-only until each SKU has an approved offer.
5. Write Zoho Commerce product/variant IDs only after ops approval — never from this Preview catalog file alone.
