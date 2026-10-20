# Staging 联调清单

不要合并 main。不要部署生产。不要对真实客户发邀请或邮件。不要把本目录的测试数据写入生产 CRM / Commerce。

单连接 PGlite 测试**不能**宣称已验证真实多连接并发。托管数据库验证在完成前必须保持「尚未验证」。

## 环境变量名称

在 staging 宿主填写值。本仓库只列名称，不提交秘密。

| 名称 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Staging 站点 URL，也用于 Auth 回调 |
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端。不要加 `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 沙箱可发布 key |
| `STRIPE_SECRET_KEY` | Stripe 沙箱密钥 |
| `STRIPE_WEBHOOK_SECRET` | Staging webhook 签名 |
| `STRIPE_AUTOMATIC_TAX` | 必须为 `true` 才能创建可付款 Session |
| `STRIPE_SHIPPING_RATE_ID` | Stripe 运费 Rate。未知运费不得当 0 |
| `CATALOG_SOURCE` | 保持 `supabase_cache`，直到 Commerce 真实验证通过 |
| `ZOHO_CLIENT_ID` | 仅当要用沙箱 CRM 只读时 |
| `ZOHO_CLIENT_SECRET` | 同上 |
| `ZOHO_REFRESH_TOKEN` | 同上 |
| `ZOHO_ACCOUNTS_URL` | 与数据中心匹配 |
| `ZOHO_API_DOMAIN` | Token 刷新回退域 |
| `ZOHO_REDIRECT_URI` | Staging 回调。联调目录读取前不要写生产 CRM |
| `ZOHO_COMMERCE_ORG_ID` | 未验证前不要切 `zoho_commerce` |
| `ZOHO_COMMERCE_API_DOMAIN` | Commerce 管理 API |
| `DEV_PREVIEW_AUTH` | Staging 必须为 `false` |

不要把生产 refresh token、生产 Stripe live key 或生产 service role 填进 staging。

## 默认邮件模板下的登录 / 密码恢复

未做真实邮件验证前，不得写「恢复流程已通过」。

1. `NEXT_PUBLIC_SITE_URL` 必须等于浏览器打开 Forgot password 的那个固定 staging 域名（无尾斜杠）。
2. 登录页应显示 `Auth host: <project>.supabase.co`。该 host 必须属于**当前 staging 项目**，也就是已确认用户所在的项目。
3. Supabase Authentication → URL Configuration：
   - Site URL = 同一 staging 域名
   - Redirect URLs 包含 `https://<staging-host>/auth/callback` 以及 `https://<staging-host>/auth/callback?next=/partner/reset`
4. 保持默认 Recovery 模板（`{{ .ConfirmationURL }}`）。不要从 Dashboard「发送恢复邮件」测试 PKCE；必须从网站 Forgot password 发起，以便写入 verifier cookie。
5. 不要配置 custom SMTP 也能测默认邮件。用内部测试邮箱，不要给真实客户发信。
6. 只打开**最新一封**恢复邮件，且只点一次。成功时应到达 `/auth/callback?code=...&next=/partner/reset`，然后进入重置页。
7. 若首次点击仍是 `otp_expired`：打开 Auth 日志，对比 `/recover`（或 recover 请求）与 `/verify` 的时间。
   - 若 `/verify` 早于你的首次点击，链接已被提前消费；不能直接认定是邮件扫描，只能说明验证发生在点击之前。
   - 若 `/verify` 与首次点击同时且仍过期，检查 token 有效期、是否点了旧信、或 Auth 项目是否与登录页 Auth host 不一致。
8. 若链接落到首页且带 `#access_token` / `#error=otp_expired`，页面会转到登录页的固定错误文案，不会把 hash token 当成已登录。

## 需要你手动完成的控制台步骤

1. 另建 **staging** Supabase 项目，不要用生产项目。
2. 在 SQL editor 按顺序执行（可重复，但先看回滚说明）：
   1. `supabase/schema.sql`（新项目）
   2. `supabase/migrations/20261019_phase1_security.sql`
   3. `supabase/migrations/20261019_phase1_rpc_hardening.sql`
   4. `supabase/staging/seed_internal_test.sql`
3. 在 Authentication 里用 **内部测试邮箱** 手动建用户（例如 `staging-buyer-t1@axelerate.invalid`）。关闭对真实客户的邀请邮件。不要导入 Brow Arc / Belle 真实联系人。
4. 将测试用户 `profiles` 挂到对应 `staging-internal-tier-1/2/3` 组织，并写入 `location_memberships`。第一个平台管理员只能用 `app.allow_privilege_write=on` 或 service-role 写入，禁止自助提权。
5. Stripe **sandbox**：打开 Automatic Tax，建一条美国运费 Rate，把 Rate ID 填进 `STRIPE_SHIPPING_RATE_ID`。
6. 配置 webhook 到 staging `/api/webhooks/stripe`，事件至少包括：
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `refund.created` / `refund.updated` / `refund.failed`
   - `charge.refunded`
7. 用内部卡走一笔 Melting Mask（Tier 1 = 1200 美分）。确认公开目录看不到专业价。
8. 托管并发（**尚未验证**）：两个 SQL 会话同时对 `STG-CONCURRENT-STOCK` 调用 `apply_inventory_decrement`。单连接 PGlite 结果不得当作这项已通过。
9. 不要把 `STG-*` 商品或 `staging-crm-*` ID 同步进生产 Zoho。`CATALOG_SOURCE` 保持 `supabase_cache`。

## 测试数据

脚本会写入：

- Melting Mask `STG-MELTING-MASK`，三档价 **1200 / 1440 / 1728** 美分，CRM / Commerce / Variant ID 分开。
- 独立有限库存商品 `STG-CONCURRENT-STOCK`，默认库存 1。
- 三个内部组织，`zoho_account_id` 为 `staging-internal-tier-*`，不是真实 Account ID。
