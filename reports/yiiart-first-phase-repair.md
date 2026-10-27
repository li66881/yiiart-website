# YiiArt 第一阶段修复报告

检查日期：2026-10-27  
项目：`yart/yiiart-website`  
修复分支：`codex/yiiart-first-phase-repair`  
基线：`cfeaeee4394c6fe88cbc78c4be518a6ef3e1d994`（与 `origin/main` 一致）

## 已完成的本地修改

- 首页标题调整为 **Featured Artworks**，删除首页商品上的 Bestseller 角标；顶部导航也移除了没有销量依据的 Best Sellers 文案，商品卡片布局、SKU、图片、价格和页面 URL 未改。
- 新增统一的作品方向判定：Sanity 宽、高字段按厘米解释，顺序为宽×高；宽高相差不超过长边的 2% 才归 Square。作品详情、目录筛选与计数均按同一规则优先读取实体尺寸。
- 只读检查了 163 条公开商品。发现 8 条 50×60 cm 商品的旧字段误标 Square，候选方向为 Portrait。由于每件有多档尺寸、无法由字段确认原作构图，均列为人工复核；没有写入 Sanity。
- 统一制作时间文案为“下单前确认制作时间”，并明确承运时间从发货后开始、另行计算。现有系统中的 10 天承诺没有可验证的产能依据，因此已从前台承诺中移除。美国关税和进口税披露保留。
- 卷装说明改为画布不带内框、卷筒运输；绷框和浮框说明各自形式，并明确当前直接结账仅适用于卷装，其他形式需先按尺寸、目的地和承运路线确认，再开票付款。服务端同时拒绝将绷框/装框选项直接送去收款；商品详情中的旧“Ships rolled for direct checkout”内容会在展示前按 shipping profile 改写。
- 加强支付确认：PayPal 返回页按 PayPal 订单号查找并核对待付款 YiiArt 订单，只有 capture 状态为 `COMPLETED` 才标记已付款；Stripe 只有 `payment_status=paid` 才记为已付款。
- 美国地址增加州字段，州名会随 PayPal 地址发送，并保存在新订单的 metadata 中；旧订单不做写入或修改。结账页的币种按当前支付服务商配置显示，订单金额仍由服务端根据商品数据计算。
- Sanity 评论 schema 不再默认勾选 Verified buyer；公开评论查询要求有内部订单引用后才显示验证标记。当前公开查询没有获准展示的评论。

## 163 条商品方向对照

详细清单包含 SKU slug、Sanity ID、原方向、候选方向、拟应用方向和人工复核原因：

- [yiiart-orientation-audit.csv](./yiiart-orientation-audit.csv)
- [yiiart-orientation-audit.md](./yiiart-orientation-audit.md)

163 条中，155 条与尺寸一致；8 条需要人工确认原作构图后再决定是否改写 Sanity 源字段。前台会先根据可核实的厘米尺寸正确归类，因此这 8 件不会再被误计入 Square。

## 支付和商品事实核查

- 公开目录中的 163 件均标记为 `hand_painted_to_order`、`Ships rolled`，且配置的 finish 均为 `Rolled canvas`；本目录没有 POD 印刷品记录。因此目前没有新增 POD 生产或配送承诺。
- PayPal 线上环境状态为 Live，客户端、密钥、订单存储和 webhook 均报告已配置。没有使用真实付款做测试；也没有可用的 sandbox 交易凭证，因此回调金额链路还需在 PayPal Sandbox 用测试账号走一次端到端验证。
- Stripe 当前未启用，且 webhook 未配置；虽检测到服务端密钥存在，但本次没有读取或打印凭证内容。未启用时只显示已配置的其他付款方式。
- 结账支持美国地址；付款订单详情按服务端确定的币种和金额显示。未发起任何订单或支付请求；线上真实交易链路仍需在 Sandbox 测试，不能据此宣称已完成真实扣款验证。

## Google Search Console 准备

- 线上 `robots.txt` 返回 200，允许抓取公开页面并排除 `/admin/`、`/api/`；`sitemap.xml` 返回 200，包含 163 个商品 URL。
- 两个抽查商品页均返回 200，并具有各自的 title、description 和 `https://www.yiiart.com/artwork/{slug}` canonical。商品页由统一 metadata builder 生成 canonical；新公开页面默认可索引。
- 当前线上首页没有 `google-site-verification` meta tag；仓库 `public/` 里也没有静态 Google 验证文件。代码支持通过 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` 环境变量注入 meta，但没有可用验证码。当前执行环境无法完成域名 DNS TXT 查询，因此不能判断是否已经存在 DNS 验证记录。

**Domain Property 验证步骤：**

1. 在 Google Search Console 添加 Domain Property：`yiiart.com`。
2. 从 Google 页面复制其实际提供的 TXT 验证值；不要沿用猜测或手工编造的值。
3. 到当前 DNS 服务商增加一条 TXT 记录：主机名/名称填 `@`（如服务商要求完整域名则按其格式填写），值原样粘贴，TTL 使用默认值。
4. 保留现有 SPF、DKIM、DMARC、MX 及其他 TXT 记录，不删除或覆盖；验证 DNS 生效后回到 Search Console 点击验证。
5. 在该资源的“站点地图”中提交 `https://www.yiiart.com/sitemap.xml`。
6. 用“网址检查”检查首页、`/artworks`、`/artwork/scrubland-study` 和 `/artwork/pale-scale-rhythm`；确认 canonical 选择为对应的 www URL、允许索引，再对需要优先收录的页面请求编入索引。
7. 后续在“网页索引”检查 sitemap 发现数、已编入索引数、未编入索引原因；新页面和内容更新需要等待 Google 重抓取，不保证即时收录。

## 尚待业务方核实

- Sofie Lindberg、Huang Liang 等署名在 Sanity 中存在，但可访问项目资料没有艺术家授权文件或署名许可记录；我没有更改姓名或声称授权已核实。发布前应由业务方对照签约/授权材料确认。
- 8 条 50×60 cm 方向问题只改了显示判定，未改 Sanity 文档；确认原作构图后再由数据负责人更新源字段。
- 尚无经确认的制作周期，也没有可验证的绷框/浮框海外承运限制表；前台采用下单前确认措辞，非卷装不直接收款。
- PayPal Sandbox 端到端支付、美国收件地址的测试订单、取消/失败路径以及订单库状态核对需在 Sandbox 环境完成；不得使用线上 Live 付款测试。
- DNS TXT 现状尚未完成检查；Search Console 验证码只能由 Google 提供。

## 测试和发布状态

- `npm test`：通过，325 个单元测试、10 个集成测试、公共文案检查通过。
- `npm run build`：通过；Next.js 15.5.23 完成构建、类型检查和静态页面生成。
- 163 条方向审计脚本：通过，结果 `163 total / 8 candidates / 8 manual review`。
- `git diff --check`：通过。
- 修改仍在独立本地分支，尚未部署到 Preview 或生产。生产页面真实回归检查需在 Preview 构建后执行，再按项目发布流程部署。
