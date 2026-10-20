# Product Experience Acceptance

Branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1  
Preview alias: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app  

Statuses: **通过** · **未验证** · **待改善** · **外部阻塞** · **不适用**  

Rules:
- Desktop screenshot ≠ mobile pass.
- Items marked re-verify stay **未验证** until a fresh pass on the listed commit.
- Single-store login ≠ multi-store switch or cross-company isolation.
- Simulated fixtures (`*-SIMULATED`) never prove Preview catalog content.

## Deploy under review

| Field | Value |
| --- | --- |
| Local HEAD at doc write | *(filled after push)* |
| Preview deploy SHA | Must match HEAD; confirm after Vercel Ready |
| Real Preview evidence prefix | `docs/ux-evidence/v3-*` |
| Simulated layout only | `docs/ux-evidence/*-SIMULATED*` / `/dev/ui-fixtures` |

## Evidence correction (prior v2 claims)

| Prior claim | Correction |
| --- | --- |
| Home mobile 通过 via `v2-home-1440` | **未验证** — desktop cannot prove mobile |
| Orders / Account mobile 通过 without 390 shot | **未验证** until `v3-*-390` |
| Cart qty persist “prior walk; re-verify” | **未验证** until v3 cart reload pass |
| Store switch 通过 | **未验证** — only single-store Staging Tier 1 exercised |
| Cross-company isolation Preview | **外部阻塞** — no second identity |
| Fixtures layout 通过 | **通过 (simulated only)** — separate from Preview |

## Page matrix — Preview (real)

### Home `/`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 | 通过 | Prior marketing structure unchanged |
| 文字排版 | 通过 | Brand system |
| 图片区域 | 通过 | Hero |
| 内容完整性 | 通过 | Marketing |
| 核心操作 | 通过 | CTAs |
| 状态反馈 | 不适用 | |
| 移动端 390 | 未验证 | Need `v3-home-390` |
| 权限/数据 | 通过 | No pro $ on public marketing |

### Catalog `/partner/catalog`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 | 通过 | Store strip + rows (v2 + recheck v3) |
| 文字排版 | 通过 | commerce tokens |
| 图片区域 | 通过 | No image plate when empty |
| 内容完整性 | 外部阻塞 | Formal Melting Mask 70 content not bound |
| 核心操作 | 未验证 | Fresh Catalog→Detail→Add on HEAD |
| 状态反馈 | 未验证 | Add + View cart on HEAD |
| 移动端 390 / 320 | 未验证 | `v3-catalog-390`, `v3-catalog-320` |
| 权限/数据 | 通过 | Tier 1 `$12` previously; confirm on HEAD |
| 多门店切换 | 未验证 / 外部阻塞 | Single store only |

### Product detail `/partner/catalog/[slug]`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 | 通过 | Prior `v2-detail-fixed-*` on `297b730` |
| 文字排版 | 通过 | |
| 图片区域 | 通过 | No image until assets bound |
| 内容完整性 | 外部阻塞 | See Melting Mask checklist |
| 核心操作 | 未验证 | Recheck Add on HEAD |
| 移动端 390 | 未验证 | `v3-detail-390` |
| 权限/数据 | 通过 | Partner route (redirect fix) |

### Cart `/cart`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 | 通过 | |
| 文字排版 | 通过 | |
| 图片区域 | 通过 | |
| 内容完整性 | 通过 | Ship/tax pending |
| 核心操作 | 未验证 | Qty change + reload on HEAD |
| 状态反馈 | 未验证 | Saving lock |
| 移动端 390 | 未验证 | Sticky summary + safe area `v3-cart-390` |
| 权限/数据 | 通过 | Server re-price |

### Orders `/partner/orders`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 | 待改善→实现 | Merchandise, shipping, tax, total, refunded, net paid |
| 文字排版 | 未验证 | Customer copy simplified; confirm HEAD |
| 图片区域 | 不适用 | |
| 内容完整性 | 未验证 | Refunded order shows refund + net; unpaid not labeled paid |
| 核心操作 | 通过 | Failed collapsed; pending/paid/refunded kept |
| 移动端 390 | 未验证 | `v3-orders-390` |
| 权限/数据 | 通过 | `refunded_cents` from DB |

### Account `/partner/account`

| Dimension | Status | Evidence |
| --- | --- | --- |
| 信息层级 | 通过 | Hub |
| 文字排版 | 未验证 | Softer copy on HEAD |
| 移动端 390 | 未验证 | |
| 权限/数据 | 通过 | Org scoped |

## Simulated layout (separate)

| Item | Status | Evidence |
| --- | --- | --- |
| Long name / no image / OOS / no price / multi-line cart | 通过 (simulated) | `v2-fixtures-*-SIMULATED` on local fixtures; not Preview catalog |

## Purchase flow (Preview HEAD)

| Step | Status |
| --- | --- |
| Login → catalog | 未验证 (session may persist; confirm) |
| Store visible | 通过 (single store) |
| Multi-store switch | 未验证 / 外部阻塞 |
| Detail or quick add | 未验证 |
| Cart qty persist after reload | 未验证 |
| Orders money + refund net | 未验证 |
| No new pay/refund | 通过 (boundary) |

## Content / migration

| Item | Status |
| --- | --- |
| Content model doc | `docs/PRODUCT_CONTENT_MODEL.md` |
| Melting Mask 70 checklist | `docs/MELTING_MASK_70_CONTENT_CHECKLIST.md` |
| Migration SQL (unapplied) | `supabase/migrations/20261021_product_display_fields.sql` |
| Formal product content complete | **否** — layout only |

## External blocks

- Real Melting Mask 70 commerce bind (images, pack, unit, approved copy)
- Apply display-fields migration on staging
- Zoho credentials / live Commerce sync
- Multi-store + cross-company hosted identities
- Stripe Tax registrations
