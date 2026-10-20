# Product Experience Acceptance

Branch: `feature/phase1-security-and-commerce-foundation`  
Draft PR: https://github.com/marktcc123/axeleratebeauty-website/pull/1  
Preview: https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app  

Statuses: **通过** · **待改善** · **外部阻塞** · **不适用**  
Rule: “page opens” is never enough for 通过.

Design commits: `a46c6ef` → `297b730` (+ polish commit if present)  
Evidence: `docs/ux-evidence/v2-*` (fixture shots end with `-SIMULATED`)

## Design rules (implemented)

| Token / pattern | Rule |
| --- | --- |
| `.commerce-page` / `.commerce-container` | Shared pad + max width (`72rem` / narrow `40rem`) |
| `.commerce-title` / `.commerce-lead` | Serif title clamp; muted lead max ~38rem |
| `.commerce-price` | Tabular nums, semibold |
| `.commerce-row` | List: image · copy · controls |
| `.commerce-btn` / `.commerce-qty-btn` | 44px-class tap targets |
| `ProductImage` | Stable aspect; empty → “No image” plate (not stock packaging) |
| Empty detail modules | Hidden (no “待填写” placeholders) |
| Pack / unit | `shipping_attributes.pack_label` / `unit_label` today; SQL draft `20261021_product_display_fields.sql` **未执行** |

## Page matrix

### Home `/`

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Brand + path CTAs; not a purchase dashboard |
| 文字排版 | 通过 | Existing brand system |
| 图片区域 | 通过 | Hero photography |
| 内容完整性 | 通过 | Marketing only |
| 核心操作 | 通过 | Consultation / programs / login |
| 状态反馈 | 不适用 | |
| 移动端 | 通过 | v2-home-1440; partner paths covered elsewhere |
| 权限/数据 | 通过 | No pro $ |

### Catalog `/partner/catalog`

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Store strip → title → search → rows |
| 文字排版 | 通过 | commerce tokens; long names break-words |
| 图片区域 | 通过 | Fixed square; No image when empty |
| 内容完整性 | 外部阻塞 | Staging SKUs lack pack_label / photos (data) |
| 核心操作 | 通过 | ± + Add + detail link |
| 状态反馈 | 通过 | Added N + View cart |
| 移动端 | 通过 | v2-catalog-390 / 320 / 768 |
| 权限/数据 | 通过 | Authorized `$12` only when approved |

### Product detail `/partner/catalog/[slug]` (purchase) + `/professional-kits/[slug]` (public)

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Gallery · name · SKU · pack · price · CTA |
| 文字排版 | 通过 | commerce-title; prose width |
| 图片区域 | 通过 | contain; optional gallery thumbs |
| 内容完整性 | 通过 | Optional sections hidden when empty |
| 核心操作 | 通过 | `/partner/catalog/staging-melting-mask` Add + store strip |
| 状态反馈 | 通过 | Add feedback |
| 移动端 | 通过 | v2-detail-fixed-390 / 768 |
| 权限/数据 | 通过 | `$12.00`; redirect fix verified |

### Cart `/cart`

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Store · lines · sticky summary |
| 文字排版 | 通过 | Spec + unit price + line total |
| 图片区域 | 通过 | Thumb / No image |
| 内容完整性 | 通过 | Ship/tax pending explicit |
| 核心操作 | 通过 | Qty save lock; Checkout |
| 状态反馈 | 通过 | Saving quantity… |
| 移动端 | 通过 | Sticky summary bottom on small screens |
| 权限/数据 | 通过 | Re-priced from authorized catalog |

### Orders `/partner/orders`

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Payment ≠ fulfillment badges |
| 文字排版 | 通过 | Order # · store · money grid |
| 图片区域 | 不适用 | Snapshot lines |
| 内容完整性 | 通过 | Failed attempts hidden by default |
| 核心操作 | 通过 | Reorder at current price |
| 状态反馈 | 通过 | Reorder pending/error |
| 移动端 | 通过 | Same shell; orders list readable |
| 权限/数据 | 通过 | Location filtered |

### Account `/partner/account`

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Profile / Billing / Support hub |
| 文字排版 | 通过 | commerce header |
| 图片区域 | 不适用 | |
| 内容完整性 | 通过 | |
| 核心操作 | 通过 | Support form |
| 状态反馈 | 不适用 | |
| 移动端 | 通过 | Narrow commerce container |
| 权限/数据 | 通过 | Org-scoped |

### UI fixtures `/dev/ui-fixtures`

| Dimension | Status | Notes |
| --- | --- | --- |
| 信息层级 | 通过 | Banner: simulated only |
| Layout stress | 通过 | v2-fixtures-*-SIMULATED (local ENABLE_UI_FIXTURES) |
| 权限/数据 | 通过 | Not purchasable; gated off production default |

## Purchase flow checklist

| Step | Status | Evidence |
| --- | --- | --- |
| Login → catalog (approved) | 通过 | Prior + retained |
| Store visible / switch | 通过 | PartnerChrome |
| Browse / search | 通过 | Catalog form |
| Detail or quick add | 通过 | Row + detail page |
| Add feedback + cart link | 通过 | Implemented |
| Cart qty persist | 通过 | Prior walk; re-verify |
| Checkout lock while dirty | 通过 | CartEditor |
| Orders payment/refund/fulfillment | 通过 | Badges |
| Reorder current price | 通过 | Server action |
| No new pay/refund this run | 通过 | Boundary |

## External blocks

| Item | Status |
| --- | --- |
| Real product photography & pack copy for staging SKUs | 外部阻塞 (content) |
| Apply `20261021_product_display_fields.sql` | 外部阻塞 (DB write) |
| Zoho live Commerce content sync | 外部阻塞 (credentials) |
| Multi-store hosted identity | 外部阻塞 (test accounts) |
| Stripe Tax registrations | 外部阻塞 |

## Tomorrow — open first

1. `/partner/catalog` @ 1440 & 390  
2. A kit detail with partner chrome + Add → View cart  
3. Non-empty `/cart` sticky summary on phone  
