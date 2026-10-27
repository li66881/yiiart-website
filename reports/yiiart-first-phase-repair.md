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
- 当前线上首页没有 `google-site-verification` meta tag；仓库 `public/` 里也没有静态 Google 验证文件。代码支持通过 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` 环境变量注入 meta。通过 Google Public DNS 只读查询到 `yiiart.com` 根域名有 2 条 TXT 记录，其中 1 条名称为 `google-site-verification`；没有读取或公开验证值。DNS 记录存在不等于已确认它对应当前登录的 Search Console 资源。
- GSC Wizard 连接工具因账户没有活动订阅而拒绝列出 Search Console 资源，因此目前无法从该连接核验域名资源是否已验证、sitemap 是否已提交或索引状态；没有通过工具更改或提交任何内容。

**Domain Property 验证步骤：**

1. 在 Google Search Console 添加 Domain Property：`yiiart.com`。
2. 从 Google 页面复制其实际提供的 TXT 验证值；将它与 DNS 中现存的 Google 验证 TXT 记录对照，不要猜测或编造值。
3. 如果值匹配，保留现有记录并直接在 Search Console 验证；如果不匹配，到当前 DNS 服务商新增一条 TXT 记录：主机名/名称填 `@`（如服务商要求完整域名则按其格式填写），值原样粘贴，TTL 使用默认值。
4. 保留现有 SPF、DKIM、DMARC、MX 及其他 TXT 记录，不删除或覆盖；待 DNS 生效后回到 Search Console 点击验证。
5. 在该资源的“站点地图”中提交 `https://www.yiiart.com/sitemap.xml`。
6. 用“网址检查”检查首页、`/artworks`、`/artwork/scrubland-study` 和 `/artwork/pale-scale-rhythm`；确认 canonical 选择为对应的 www URL、允许索引，再对需要优先收录的页面请求编入索引。
7. 后续在“网页索引”检查 sitemap 发现数、已编入索引数、未编入索引原因；新页面和内容更新需要等待 Google 重抓取，不保证即时收录。

## 尚待业务方核实

- Sofie Lindberg、Huang Liang 等署名在 Sanity 中存在，但可访问项目资料没有艺术家授权文件或署名许可记录；我没有更改姓名或声称授权已核实。发布前应由业务方对照签约/授权材料确认。
- 8 条 50×60 cm 方向问题只改了显示判定，未改 Sanity 文档；确认原作构图后再由数据负责人更新源字段。
- 尚无经确认的制作周期，也没有可验证的绷框/浮框海外承运限制表；前台采用下单前确认措辞，非卷装不直接收款。
- PayPal Sandbox 端到端支付、美国收件地址的测试订单、取消/失败路径以及订单库状态核对需在 Sandbox 环境完成；不得使用线上 Live 付款测试。
- DNS 中已有 Google 验证 TXT，但它是否匹配目标 Google 账号的 Search Console 验证值仍未确认；验证码只能由 Google 提供。GSC Wizard 连接当前没有活动订阅，需通过 Search Console 网页本身确认属性、提交 sitemap 并检查收录。

## 测试和发布状态

- `npm test`：通过，330 个单元测试、10 个集成测试、公共文案检查通过。
- `npm run build`：通过；Next.js 15.5.23 完成构建、类型检查和静态页面生成。
- 163 条方向审计脚本：通过，结果 `163 total / 8 candidates / 8 manual review`。
- `git diff --check`：通过。
- GitHub CI（测试、TypeScript、生产构建）通过；Vercel Preview 构建 Ready。
- 上一阶段 Preview：`https://yiiart-website-ikzko98e0-yart.vercel.app`。经 Vercel CLI 受保护访问核查：首页 200，显示 Featured Artworks 且不含 Best Seller；`/artwork/scrubland-study` 和 `/artwork/pale-scale-rhythm` 均 200，显示 Portrait、不显示 Square；`/shipping`、`/shipping-returns`、`/faq`、`/checkout` 均 200，未发现旧 10 天承诺；`/robots.txt` 和 `/sitemap.xml` 均 200，sitemap 含 163 个商品 URL。
- Preview 的 `/api/checkout/config` 显示 PayPal、Stripe 未配置/未启用；没有在 Preview 执行真实支付或创建订单。生产账号支付配置的核验结果见上文。
- 装裱文案后续 Preview：`https://yiiart-website-qmxx0mj2y-yart.vercel.app`，部署 Ready。首页、`/artworks`、`/collections/textured-wall-art`、`/artwork/scrubland-study`、`/faq` 均返回 200；页面输出中未发现 “Ships rolled for direct checkout” 或其他 direct-checkout 格式承诺，商品详情显示卷装保护筒说明；Scrubland Study 显示 Portrait 且没有 Square。
- 生产发布：PR [#76](https://github.com/li66881/yiiart-website/pull/76) 已合并；生产部署 `dpl_BjfmNh7KTSCKL86wxqW2MkWfwaF1` 已 Ready，合并提交 `eab7a108cedfc35b9a0bdea5a2a4bf8ed7a07d4a`。
- 上线后通过 `https://www.yiiart.com` 和生产部署回归：`/`、两个抽查商品页、`/shipping`、`/shipping-returns`、`/faq`、`/checkout`、`/robots.txt`、`/sitemap.xml` 均返回 200；首页 Featured Artworks 已显示，Best Seller/Bestseller 未出现；Scrubland Study 与 Pale Scale Rhythm 显示 Portrait 且没有 Square 标签；政策、FAQ 和结账页未出现 10 calendar days；robots 保留 sitemap 声明，sitemap 含 163 个商品 URL。
- 生产 `/api/checkout/config` 只读检查显示订单存储和 PayPal Live/webhook 已启用，Stripe 已配置但未启用且未配置 webhook。没有创建订单或进行支付。
- 后续生产发布：PR [#77](https://github.com/li66881/yiiart-website/pull/77) 已合并；生产部署 `dpl_22w3zXBsGh17UbKs5UDtaUK9hk8t` Ready，合并提交 `55c8c98d026e5ccd49a9cadf08bc8276073de5e6`。在 `https://www.yiiart.com` 回归首页、`/artworks`、`/collections/textured-wall-art`、`/artwork/scrubland-study`、`/faq`、`/robots.txt` 和 `/sitemap.xml` 均返回 200；首页不再显示 Best Seller；抽查页面未检出旧装裱文案；sitemap 仍含 163 个商品 URL。
- Sanity 公开目录中的 100 条 `framingNotes` 仍含历史 “Ships rolled for direct checkout” 文案；这 100 件均为 `Ships rolled` 且仅有 `Rolled canvas` 选项。生产页面层已在首页、商品目录、集合页及商品详情统一规范该字段，清除访客可见文案和 Next.js 客户端数据负载中的旧表述。
- 尝试通过 Vercel 生产环境的 `SANITY_API_WRITE_TOKEN` 清理这 100 条源字段时，Sanity 返回 HTTP 401，事务未提交；`SANITY_WRITE_TOKEN` 未注入当前 Vercel CLI 环境进程。没有改动 Sanity 商品源数据。CMS 源记录仍需有效的 Sanity Editor 写入令牌才能同步清理；应用层文案修复不依赖该令牌。
