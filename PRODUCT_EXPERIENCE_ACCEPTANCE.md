# Product Experience Acceptance

Branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1  
Preview alias: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app  

Statuses: **通过** · **未验证** · **待改善** · **外部阻塞** · **不适用** · **通过 (simulated only)**

Rules:
- Desktop screenshot ≠ mobile pass (each viewport needs its own shot).
- “re-verify” items stay **未验证** until a fresh pass on the listed SHA.
- Single-store login ≠ multi-store switch or cross-company isolation.
- Simulated fixtures never prove Preview catalog content.

## Deploy under review

| Field | Value |
| --- | --- |
| Functional HEAD (verified) | `5d03742d2dc0e3aa10fd6903929903219df55568` |
| Evidence docs commit | `fc466f96cc32fa007db7d173f1d96933c6820a67` (screenshots + matrix only) |
| Preview unique for functional | `https://axeleratebeauty-website-g9wbz21oc-axelerateglobal.vercel.app` (`dpl_7TSaY4t9EyK3B8nP1ywW2MrR4615`) |
| Alias | tracks branch |
| Real Preview evidence | `docs/ux-evidence/v3-*` |
| Simulated only | `docs/ux-evidence/*-SIMULATED*`, `/dev/ui-fixtures` |

## Evidence correction log

| Prior overclaim | Correction |
| --- | --- |
| Home mobile via desktop shot | Replaced with `v3-home-390` |
| Orders/Account mobile without 390 | `v3-orders-390`, `v3-account-390` |
| Cart persist “re-verify” left as 通过 | Re-ran: 8→9 survives reload (`v3-cart-qty-1440`) |
| Store switch 通过 | Still **未验证 / 外部阻塞** (single store only) |
| Fixtures = Preview content | Kept separate as **通过 (simulated only)** |

## Page matrix — Preview HEAD `5d03742`

### Home `/`

| Dimension | 1440 | 390 | Notes |
| --- | --- | --- | --- |
| 信息层级 | 通过 | 通过 | `v3-home-1440`, `v3-home-390` |
| 移动端 | — | 通过 | Dedicated 390 shot |
| 权限 | 通过 | 通过 | No pro $ |

### Catalog `/partner/catalog`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 / 文案 | 通过 | “Shop for this store” |
| 价格 | 通过 | `$12.00` |
| 加购反馈 | 通过 | Added + View cart |
| 1440 / 390 / 320 | 通过 | `v3-catalog-1440/390/320`; 320 `overflowX=false` |
| 正式商品内容 | 外部阻塞 | Melting Mask 70 checklist |
| 多门店切换 | 外部阻塞 | Single store only |

### Detail `/partner/catalog/staging-melting-mask`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 路由 / 价格 | 通过 | `$12.00`; no 404 |
| 1440 / 390 | 通过 | `v3-detail-1440`, `v3-detail-390` |
| 正式内容 | 外部阻塞 | No-image + fixture description |

### Cart `/cart`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 非空车 / 文案 | 通过 | “Your cart”; Melting Mask line |
| 数量持久化 | 通过 | 8→9 after reload |
| 1440 / 390 | 通过 | `v3-cart-1440/390`; Checkout visible at 390 |
| 吸底摘要 | 通过 | Checkout reachable on 390 |

### Orders `/partner/orders`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 客户文案 | 通过 | View orders… / Reorders use current prices… |
| 金额 | 通过 | Merchandise, Shipping, Tax, Order total |
| 退款净额 | 通过 | `DB-MVG7294C`: paid $17 / Refunded $17 / Net paid $0 |
| 未付款不称已付 | 通过 | Failed hidden; paid/refunded show Amount paid only when confirmed |
| 失败单入口 | 通过 | “24 unsuccessful… Show unsuccessful attempts” |
| 1440 / 390 | 通过 | `v3-orders-1440`, `v3-orders-390` |

### Account `/partner/account`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 文案 | 通过 | “Your profile, recent payments…” |
| 1440 / 390 | 通过 | `v3-account-1440`, `v3-account-390` |

## Simulated layout (not Preview catalog)

| Item | Status | Evidence |
| --- | --- | --- |
| Long name / no image / OOS / cart density | 通过 (simulated only) | Prior `v2-fixtures-*-SIMULATED` |

## Purchase flow (Preview `5d03742` — pre self-serve)

| Step | Status |
| --- | --- |
| Catalog → detail → add → cart | 通过 |
| Qty change + reload | 通过 |
| Orders money + refund net | 通过 |
| Multi-store / cross-company | 外部阻塞 |
| New pay/refund | 未执行（边界） |

## Self-serve Tier 3 (this increment)

| Path | Local / unit | Hosted Preview |
| --- | --- | --- |
| A. New independent → email verify → Tier 3 → price → cart | 通过 (unit: `purchase-eligibility`; register insert defaults in code) | **外部阻塞** — no approved hosted test signup / migration apply |
| B. Existing chain Tier 1 retained + orders | 通过 (no-downgrade unit + existing Preview Tier 1 login path prior) | 未验证 on new SHA until Preview redeploy |
| Privilege forgery (tier/role/org/admin ignored) | 通过 (register ignores client fields; unit defaults) | 外部阻塞 |
| Typed chain name ≠ Belle/Brow Arc bind | 通过 (`commercial_model: null` on self-serve insert) | 外部阻塞 |
| Suspended still blocked | 通过 (unit + guards) | 未验证 |
| Invite join unchanged | 通过 (code path: invite skips self-serve insert) | 未验证 |
| Nav Shop / Orders / Account + cart icon | 本地代码完成 | 未验证 (await Preview) |
| 1440 / 390 / 320 layout after copy change | 未验证 | 未验证 |

## Content / migration readiness

| Item | Path / status |
| --- | --- |
| Content model | `docs/PRODUCT_CONTENT_MODEL.md` |
| Melting Mask 70 gaps | `docs/MELTING_MASK_70_CONTENT_CHECKLIST.md` |
| Display fields migration (unapplied) | `supabase/migrations/20261021_product_display_fields.sql` |
| Self-serve defaults migration (unapplied, docs-only) | `supabase/migrations/20261022_self_serve_tier3_defaults.sql` |
| Pending account ops list | `docs/PENDING_ACCOUNT_ACTIVATION.md` |
| Formal content complete | **否** |

## External blocks

1. Approve Melting Mask 70 assets + copy; bind to commerce SKU (DB write)  
2. Apply display-fields migration on staging, then append SELECT columns  
3. Zoho Commerce credentials  
4. Multi-store + cross-company test identities  
5. Stripe Tax registrations  
6. Hosted Tier 3 signup verification (blocked until ops allows test account / email confirm on Preview)  
7. Do **not** batch-activate historical pending orgs without ops review  

## Check first after Preview deploy

1. Partner nav: Shop / Orders / Account + cart badge  
2. Existing Tier 1 login still shows $12 Melting Mask path  
3. New register message + server defaults (when test account allowed)  
4. Orders “View order” collapse + Buy again  

