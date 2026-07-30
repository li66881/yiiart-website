# MesonArt PDP 设计细节对照（分析稿）

对照 URL：`https://www.mesonart.com/collections/new/products/gilded-cosmic-burst-sg716`  
对照日期：2026-07-30  
目标：布局 / 层级 / 文案位置 / 动效尽量对齐；品牌名与原文不照搬。

---

## A. 首屏 Buy 区（左图右购）

| 细节 | MesonArt | YiiArt 当前 | 差距 |
|------|----------|-------------|------|
| 主图多张轮播 | 主图区可翻，缩略图横排 | 已做箭头/计数/滑动/lightbox | 接近 |
| View VR / View in room | 主图角标入口 | 场景图时显示 View in room | 可保留文案，不做真 VR |
| 社会证明行 | `N saves · In M carts` + `X sold in last Y hours` | 仅 sold 占位 | **缺 saves/carts 占位** |
| 标题 | `Name #SKU`，中等字号偏商业 | 已缩小字号 | 接近 |
| 价格 | 大号 `$218.00` + shipping 小字 | 已有 | 接近 |
| 送达承诺 | `Arrives soon! Get it by Aug 5–13` | 仅 creation window | **需补预计送达行** |
| 尺寸按钮 | 英制+公制双写，2 列密排 | 已有 choice grid | 标签格式需统一 |
| Finish | 下拉/列表：Rolled / Frameless / Frames | radio 网格 | 可接受；可改成更密列表 |
| CTA | Add to cart + 价格并排；另有 Buy it now | Add to cart + 价格 | 可选第二 CTA |
| 服务徽章 | 4 块可展开说明 | 4 块静态 | **可加展开细节** |
| Need help | 独立联系入口 | WhatsApp 次按钮 | 接近 |

## B. 购买栏下方信息

| 细节 | MesonArt | YiiArt 当前 | 差距 |
|------|----------|-------------|------|
| 信息组织 | **手风琴 4 段**：About / Details / Shipping / Review | 多段长文 + 多 section | **应用 Accordion 替换** |
| About | 1 段描述 + Style/Subject/Mediums | 描述散落 | 合并 |
| Details | Availability、Creation、Hang、Frame、Certificate… | 分散 Detail 网格 | 合并到字段表 |
| Shipping | Cost/Time/Returns/Handling/Carrier | trust 卡片 | 合并 |
| Review | 艺术家语录或买家评 | 独立 Review 区在很下方 | Accordion 内摘要 + 下方完整列表 |

## C. 页面下半推荐结构

| 细节 | MesonArt | YiiArt 当前 | 差距 |
|------|----------|-------------|------|
| Visually Similar | 横向商品卡轨 + Choose options | Related 4 列网格 | **改轨 + Choose options** |
| Artist block | 头像/简介 + Popular/Latest 切换轨 | 较弱/缺失 | 后补 |
| More to Love | 第二商品轨 | 无 | **加轨** |
| In Real Life | 实景网格 Shop the Look | 有独立路由，PDP 内无 | 链到 `/art-in-real-homes` |
| Why Brand | 4 点信任 | confidence 4 块 | 文案对齐 |
| Art Advisory | 顾问 CTA | custom/WhatsApp | 可加轻量块 |

## D. 商品卡片细节

| 细节 | MesonArt | YiiArt RelatedCard | 差距 |
|------|----------|--------------------|------|
| Hover 切第 2 张图 | 有 | 仅 scale | **要做** |
| 底部 Choose options | hover/常显 | 无 | **要做** |
| 文案 | Title + From $xx | category/medium/尺寸/价 | 简化为 Title + From |
| 角标 | 少 | 无 | 促销时最多 1 个 |

## E. 动效细则（应对齐）

1. 主图切换：280ms fade + 8px 横向（已做）  
2. 缩略图选中：底边 2px ink（已做）  
3. 卡片 hover：第二图 crossfade 280ms（待做）  
4. Choose options：自下上滑 200ms（待做）  
5. Accordion：高度展开 240ms（待做）  
6. 徽章展开：简单 slide（可选）

## F. 本轮实现优先级

1. ProductAccordion 替换 PDP 中部冗长 section  
2. ProductCard + ProductRail（Similar / More to Love）  
3. BuyBox 补 saves/carts 占位 + 预计送达行  
4. 服务徽章可展开短说明  
