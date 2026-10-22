# Staging Night Task — Axelerate Beauty

这份任务书替代此前零散夜间指令。执行报告见 `STAGING_OVERNIGHT_REPORT.md`。

## 一、经营目标与产品原则

以 B2B 产品负责人、UX 设计师和全栈工程师的视角工作。

Axelerate 目前由一人经营，需要服务现有两家连锁，并让第三家连锁可以沿用同一套客户开通、门店授权和采购流程，避免为每家客户硬编码或重复维护。

网站有两条核心路径：

**新客户：** 了解专业项目 → 查看真实交付案例 → 提交咨询 → 人工销售跟进。全套设备、培训和开店项目保持咨询/合同模式，不擅自开放直接结账。

**已有客户：** 登录 → 确认门店 → 浏览自己 Tier 的商品价格 → 加购 → 结账 → 查看订单 → 再次采购。

优先减少页面跳转、重复输入、多余按钮和人工维护。保留现有品牌识别，用清晰、统一的设计改善采购效率。后台最终要支持 Zoho 管理和数据分析，但不能假装集成已经完成。

## 二、工作环境与已知状态

- 仓库：`marktcc123/axeleratebeauty-website`
- 分支：`feature/phase1-security-and-commerce-foundation`
- 继续更新 Draft PR #1，不合并 main
- Supabase staging：`rwxwvbhfbezqkgnaqvrq` / `axelerate-beauty-staging`
- 固定 Preview：https://axeleratebeauty-website-git-feature-phas-590110-axelerateglobal.vercel.app

开始前读取仓库规则、`ECOMMERCE_HANDOFF.md`、git status/diff、PR 最新状态、路由/组件/数据库/集成实现。保留已有未提交修改。

现有能力：Vercel CLI（`npx vercel`）、Supabase MCP（本轮只读）、Stripe MCP（写前确认沙箱）、Playwright 已登录 Preview。Zoho 凭据需检查。

已确认场景见任务原文第三节用户与浏览器观察；不代表全部场景通过。

## 三、P0：公开目录权限与会员价格显示

### A. 公开目录权限

核对 `catalog_products_select_only` 实际生效状态（有效权限、SELECT、不可写、公开列）。Supabase MCP 只读。有缺口则准备独立 SQL + 测试，标记待人工应用。不切换 `security_invoker` 仅为消告警。不扩大 `products` 基表浏览器权限。

### B. 已批准客户目录不显示价格

已观察：approved Tier 1 有 Add to Cart，价格仍显示 “Professional Pricing Available Upon Account Approval”。

分开规则：(1) 公共目录是否可展示公开价；(2) 已批准客户是否可读并看到授权价。不为修会员目录全局打开 `publicPriceVisible`。不泄露其他 Tier/供价/内部字段。

验收：有有效 Tier/价格时显示实际单价；Melting Mask Tier 1 = $12.00；未登录/未批准不获专业价；缺价禁止购买；服务端结账重核价；修空车 “after account approval” 文案；加针对性测试。

## 四、P1：采购流程与页面简化

门户以 Catalog / Orders / Account 为核心。Dashboard 仅在有价值时保留。Billing/Support 可整合但保留能力与兼容链接。登录分流、门店选择、目录、购物车、订单的具体要求见任务原文第四节。

## 五、P1：视觉、响应式与可访问性

保留品牌，统一字体/宽度/间距/按钮/表单/状态。优先登录后采购页。新客户咨询 vs 老客户登录入口明确。案例须来自真实材料。

## 六、P1：价格、门店权限及购物车正确性

Tier 规则与 Melting Mask $12；跨公司/未授权门店隔离；购物车同 SKU 再加购不被误清。

## 七、P1：Stripe 沙箱退款与幂等验证

仅对一笔已确认 staging 内部测试付款做部分+剩余退款。写前确认沙箱、`livemode=false`、唯一映射。无法确认则停止该项。

## 八、P2：税额与 Zoho 集成

税额只读核查。Zoho 先验证代码/凭据/能力；保持 `CATALOG_SOURCE=supabase_cache`；输出字段映射与职责。不向生产 Zoho 写测试数据。

## 九、必须保留的业务区别

Brow Arc 佣金 15%；Belle 批发再销售；统一收款不等于相同利润处理；Flora 不加入；在途设备不混续购；缺成本依据则标记待核对。

## 十、经营分析目标

先保证底层数据可靠。输出指标定义与字段缺口；不得展示虚假利润。

## 十一、执行循环

顺序：权限+价格 → 采购 UI → 权限/购物车/退款幂等 → Zoho 映射 → 新客户路径。每项：证据 → 假设 → 最小修改 → 测试 → 推送 → Preview SHA → 浏览器/日志。两项受阻记证据后换任务。DB 变更只准备 SQL。不合并 main、不生产、不发客户邮件、不真卡、不暴露密钥。

## 十二、验收与交付

持续更新 `STAGING_OVERNIGHT_REPORT.md`。同步 `ECOMMERCE_HANDOFF.md` 与 Draft PR。完成标准：已批准客户看得到价、确认门店、顺畅加购与看订单；数据隔离不破；Zoho 状态真实可查。
