# Product Improvement Backlog

Living list from overnight / UX iteration. Status values: `done` | `in_progress` | `ready` | `blocked` | `deferred`.

| ID | User problem | Evidence | Impact | Suggestion | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- |
| B01 | Public marketing nav + partner purchase links stacked | Before: SiteHeader + PartnerNav both visible on catalog | Confusion, extra scan | Partner workspace uses one header mode; store strip only under it | None | done |
| B02 | Billing / Support / Profile felt like three destinations | Separate pages with thin content | Extra nav hops | Hub at `/partner/account` with `#profile` `#billing` `#support`; old URLs redirect | None | done |
| B03 | Catalog used marketing cards poorly for reorder | Card grid hid qty + price density | Slow replenishment | `ReplenishmentRow` list: name, SKU, price, qty, Add | None | done |
| B04 | Reorder button silent on failure | Click with no feedback | False “nothing happened” | Pending + error text on `ReorderButton` | None | done |
| B05 | Long product names truncated mid-word | Layout fixture + CSS truncate | Hard to identify SKU | `break-words` on catalog/cart titles | None | done |
| B06 | Multi-store switch still two-step (select + button) | LocationSelect form | Extra click | Auto-submit on change | None | done |
| B07 | Search form GET round-trip | Catalog filter submit | Mild friction for 2 SKUs | Keep until catalog > ~20 SKUs | Catalog growth | deferred |
| B08 | No email when cart saves fail | CartEditor alert only | Operator support load | Optional ops alert; not customer email | Ops channel | deferred |
| B09 | Zoho live sync | Preview env has no `ZOHO_*` | CRM follow-up manual | Keep field map + local mapping tests; no live write | Zoho OAuth | blocked |
| B10 | Stripe Tax registrations empty | PI tax=0 on sandbox | Wrong tax expectation | Register Stripe Tax in sandbox; not a UI force-$0 | Stripe Dashboard | blocked |
| B11 | Multi-HQ / unauthorized store browser identity | No second isolated login | Authz edge cases | Local unit coverage exists; hosted identity needed | Test accounts | blocked |
| B12 | Catalog image missing / broken | Staging SKUs may lack images | Uneven list | Fallback image already; add empty-state art later | Asset pack | deferred |
| B13 | Auto reorder reminders | Operator request, no validated rule | Would need email + thresholds | Design only until rules approved | Business rules + email | blocked |
| B14 | Mobile qty steppers vs number input | Catalog uses number input | One-hand speed | Match Cart ± steppers on catalog | None | done |
| B15 | Public professional programs vs partner catalog confusion | Marketing “programs” vs buyable SKUs | New clients ask wrong path | for-professionals copy points Login → Catalog after approval | Copy review | done |
| B16 | Orders history flooded with failed checkout attempts | Playwright: dozens of `failed` before paid/refunded | Hard to find real orders | Default-hide failed; `?showFailed=1` toggle | None | done |
| B17 | Staging SKUs 404 on public `/professional-kits/[slug]` for anon in some paths | Anon kit slug → 404 / programs alias | Low for buyers; marketing uses programs | Keep staging SKUs partner-catalog only | Content | deferred |
| B18 | Footer still shows Professional Login while signed in | Snapshot footer links | Mild inconsistency | Session-aware footer later | None | deferred |
| B19 | Staging SKUs lack pack_label / real photos | Catalog shows category fallback + No image | Lower compare quality | Operators fill shipping_attributes or apply display-field migration | Content + DB approve | blocked |
| B20 | Detail page showed empty “will appear here” modules | Prior professional-kits copy | Noise / unprofessional | Hide empty optional sections | None | done |
| B21 | Fake-looking fallback pack photo | `/images/product-line.webp` on empty images | Misread as this SKU | Neutral No image plate | None | done |
| B22 | Commerce spacing/type inconsistent across pages | Mixed utility classes | Hard to scale to 3rd chain | `.commerce-*` tokens + shared components | None | done |
