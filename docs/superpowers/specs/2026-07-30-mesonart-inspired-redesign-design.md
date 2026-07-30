# YiiArt × MesonArt-Inspired Full Redesign — Design Spec（Sprint 0）

> 状态：Sprint 0 已确认 → 进入 Sprint 1  
> 参考站：[mesonart.com](https://www.mesonart.com/)  
> 底本：GitHub `main` / 线上 yiiart.com  
> 品牌资产：YiiArt 原创；**布局 / 动效 / UI 小细节 / 商品页信息结构以 MesonArt 为像素级对齐目标**

### 已锁定产品决策

1. 社会证明（`N sold in last X hours`）：先做**占位**，后续再接真实数据  
2. 生成评价：**可上正式站**（需可在 CMS 策展；文案原创）  
3. 促销倒计时：仅当绑定真实 `saleEndsAt` 时显示

---

## 1. 目标

把 YiiArt 从「偏安静的编辑画廊」升级为「**简约、转化清晰的手绘电商**」：

1. 保留 YiiArt 现有暖纸 / 深墨色系与手绘订制定位  
2. 全面吸收 MesonArt 的 **信息架构、商品页逻辑、图库排列、标签文案、筛选卡片、信任条、评价与推荐轨**  
3. 文案、评价、场景图均可按本 Spec **生成接近风格的原创内容**（不复制原文/原图）

买家路径应变成：

**看见作品 → 想象上墙 → 选尺寸/裱框 → 信任服务 → 加购**

---

## 2. 设计原则（全站细节总则）

| 原则 | 要求 |
|------|------|
| 图像优先 | 商品图/场景图是第一销售面；文案服务于图像 |
| 一层信息 | 卡片上最多：图 + 标题 + From 价 + 一个操作 |
| 购买栏固定层级 | 标题 → 社会证明 → 价格 → 选项 → CTA → 徽章 |
| 少装饰 | 无紫渐变、无重阴影、无圆角药丸堆砌、无浮层贴纸 |
| 留白节奏 | 区块之间用大留白分段，不用卡片框硬分隔 |
| 动效克制 | 250–350ms；只服务图库翻看与 hover 切图 |
| 双语一致 | EN 为主销售语言；ZH 同步同一信息结构 |
| 原创内容 | 文案/评价/图片可「接近」，但必须 YiiArt 原创 |

---

## 3. Design Tokens（实现时写入 `globals.css`）

在现有 YiiArt tokens 上扩展，不推倒重来：

```css
:root {
  /* 已有 */
  --yiiart-ink: #181613;
  --yiiart-muted: #6f675d;
  --yiiart-line: #ded8ce;
  --yiiart-paper: #fbfaf6;
  --yiiart-warm: #efe8dc;
  --yiiart-forest: #26352c;
  --yiiart-clay: #75432f;
  --yiiart-paper-strong: #fffdf8;
  --yiiart-content: 1440px;
  --yiiart-gutter: clamp(20px, 4vw, 64px);

  /* Sprint 1 新增 */
  --ya-sale: #8b3a2a;           /* 促销强调，克制使用 */
  --ya-success: #2f5d46;        /* 库存/送达提示 */
  --ya-surface: #ffffff;        /* 购买栏表面 */
  --ya-announcement: #181613;   /* 顶栏公告：墨底白字 */
  --ya-radius-sm: 2px;
  --ya-radius-md: 4px;
  --ya-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --ya-duration: 280ms;
  --ya-gallery-gap: 12px;
  --ya-card-gap: 24px;
  --ya-buybox-width: min(440px, 38%);
}
```

### 字体阶梯

| 用途 | 桌面 | 移动 | 字重 |
|------|------|------|------|
| Display / 商品 H1 | 36–44px | 28–32px | 400–500 |
| Section H2 | 28–32px | 24px | 400 |
| Card title | 16–18px | 15px | 500 |
| Body | 15–16px | 15px | 400 |
| Meta / 标签 | 12–13px | 12px | 400 |
| Price | 20–24px | 18–20px | 500 |
| Button | 14–15px | 14px | 500 |

展示标题可继续用现有 serif；UI/价格/按钮用无衬线。

### 间距节奏

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`  
页面垂直：区块间距默认 `64–96px`，商品页内模块 `24–32px`。

---

## 4. 全局壳（所有页面共用细节）

### 4.1 AnnouncementBar（顶栏促销）

- 全宽墨色底、白字、居中一行  
- 可选倒计时（Days/Hours/Mins/Secs）  
- 可关闭；关闭状态写入 sessionStorage  
- 文案示例见 Content Spec

### 4.2 TrustBar（次级信任条）

一行短标签，用细竖线分隔，例如：

`Free shipping worldwide · 30-day returns · Hand-painted to order · Secure checkout`

字色约 `white/72` 或纸底上的 muted，避免低对比。

### 4.3 Header

参考 MesonArt 密度，但保持 YiiArt 深色 editorial header：

- 左：Logo  
- 中：Shop / New / Rooms / Styles / Custom / Guides  
- 右：Search · Wishlist · Account · Cart（带数量）  
- 桌面：主导航与工具区分视觉权重  
- 移动：汉堡抽屉，保留全部功能  
- 账户菜单：点击展开 + Escape 关闭（已有 a11y 要求保留）

### 4.4 Footer

四簇信息：

1. Shop（collections / new / best sellers）  
2. Help（shipping / returns / size guide / FAQ / contact）  
3. About（story / artists / reviews / real homes）  
4. Newsletter + 支付徽章 + 社交

底部一行：copyright · privacy · terms

---

## 5. 商品卡片 ProductCard（列表/首页/推荐轨统一）

```
┌─────────────────────┐
│                     │
│   主图（可 hover     │
│   切第 2 张场景图）  │
│                     │
│  [可选角标 SALE]    │
└─────────────────────┘
  Title #SKU
  From $218.00
  [ Choose options ]   ← hover / 移动常显
```

细节：

- 图片比例：默认 `4/5` 或按作品方向自适应，同一网格内高度可参差但列对齐  
- 标题：一行截断；SKU 用较小 muted  
- 价格：始终 `From $X`（有多尺寸时）  
- Hover：280ms 切换到第 2 张图；底部滑入 `Choose options`  
- 不要堆：风格标签、材质、尺寸、多枚徽章（促销角标最多 1 个）

---

## 6. 商品详情页 Product Detail（核心，对齐 MesonArt 逻辑）

### 6.1 桌面布局

```
|  Gallery (~58%)          |  BuyBox sticky (~42%)   |
|  主图 + 缩略图轨         |  标题 / 证明 / 价 / 选项 |
|  （可全宽下方长图）       |  CTA / 徽章 / 求助      |
---------------------------------------------------------
|  Accordion: About / Details / Shipping / Reviews        |
|  Visually Similar rail                                  |
|  Artist block + Artist works rail                       |
|  More to Love rail                                      |
|  YiiArt in Real Homes                                   |
|  Why YiiArt + Art Advisory                              |
```

### 6.2 Gallery 细节与动效

| 元素 | 规格 |
|------|------|
| 主图 | 大图，纸色底，无重边框 |
| 图序建议 | 1 白底产品 → 2 客厅场景 → 3 细节纹理 → 4 备选场景 → 5 裱框示意 |
| 缩略图 | 下方或左侧横滑；选中有 2px ink 底边 |
| 切换动效 | crossfade 280ms + 轻微横向 8px（`prefers-reduced-motion` 时仅淡入） |
| 左右箭头 | 桌面 hover 显示；移动支持滑动手势 |
| 计数 | `2 / 5` 小字 |
| 可选 | `View in room`（场景图快捷）— 不做真 VR 也可先做场景跳转 |
| 放大 | 点击主图进入 lightbox，键盘 Esc/方向键可用 |

### 6.3 BuyBox 信息顺序（严格）

1. 集合/风格小标签（一行）  
2. **H1 标题** `Name #SKU`  
3. 社会证明：`3 sold in the last 48 hours` 或 `12 people viewing`（数据真实或关闭，禁止假数据上线前未标注）  
4. **价格** `$218.00` + 小号 `Shipping included to {country}*`  
5. 促销倒计时（若有活动）  
6. **Size** 按钮组（英制 + 公制双写）  
7. **Finish**：Rolled / Frameless / Frame colors  
8. 送达承诺：`Order today, get it by {date range}`  
9. 数量（订制画默认 1，可隐藏）  
10. **Add to cart** 主按钮（全宽 ink 底）  
11. 次按钮：`Ask about this piece` / WhatsApp  
12. Service badges 四宫格：  
    - Ship after you are satisfied  
    - Free shipping on all orders  
    - 30-day easy returns  
    - Safe payment options  
13. Share 行  

### 6.4 Accordion 四段

| Tab | 内容 |
|-----|------|
| About the Artwork | 1 段情绪描述 + Style / Subject / Mediums |
| Details and Customization | Availability, Creation time, Ready to hang, Frame, Certificate, Signature, Customization, Outdoor safe |
| Shipping and Returns | Cost, Time, Returns, Handling, Carrier, Area |
| Reviews | 星级摘要 + 评价列表（含买家图）+ 写评价入口 |

保留现有 handmade disclosure（页面中下部）：

> Listing images illustrate the intended composition, palette, and room scale. Each canvas is hand-painted to order, so brushwork and small details will naturally vary.

---

## 7. 列表 / 集合页

### 7.1 页头

- H1 + 2–3 句导语（见 Content Spec）  
- 横向风格 chips：`Wabi-Sabi · Texture · Abstract · Landscape · …` → DISCOVER

### 7.2 筛选（MesonArt 级细节）

Facet 分组：

- Style  
- Subject  
- Orientation（Vertical / Square / Horizontal / Panoramic / Set）  
- Color  
- Vibe（可选）  
- Price range  
- Sort：Featured / Best selling / Price / Newest  

桌面：左侧筛选或顶部折叠；移动：`Filter and sort` 底部/全屏抽屉。

### 7.3 网格

- 桌面 3–4 列，移动 2 列  
- gap `24px`  
- 无限加载或分页，需显示结果数 `Showing 24 of 312`

---

## 8. 首页信息架构（对齐 MesonArt 节奏，保留 YiiArt 语气）

建议顺序：

1. Announcement + Header  
2. Hero（全宽场景 + 一句主标题 + 1 主 CTA + 1 次 CTA）  
3. Best Sellers / Featured（ProductCard 轨）  
4. Shop by Style / Room（大图入口，少字）  
5. New Arrivals  
6. YiiArt in Real Homes（Shop the Look）  
7. Why YiiArt（4 点）  
8. Complimentary Art Advisory  
9. FAQ  
10. Footer  

每个区块：**一个目的、一个标题、一句支持文案**。

---

## 9. 其它页面统一细节

| 页面 | 要求 |
|------|------|
| Custom painting | 表单前先讲清 4 步流程；参考图上传；信任条复用 |
| Art in real homes | 瀑布/网格实景 + Shop the Look |
| Reviews 聚合页 | 筛选星级/带图；大图灯箱 |
| Artists / Artist | 头像+短传+作品轨 |
| Cart / Checkout | 同 Token；摘要栏 sticky；支付徽章 |
| Size guide | 图示墙面比例 + 尺寸表 |
| About / FAQ / Policies | 同一页头、字阶、分割线 |

Admin 后台首轮不纳入视觉翻新。

---

## 10. 动效总表

| 场景 | 动效 | 时长 |
|------|------|------|
| 图库切图 | opacity + translateX(8px) | 280ms |
| 卡片 hover 第二图 | opacity crossfade | 280ms |
| Choose options 滑入 | translateY(8px) + opacity | 200ms |
| Accordion | height auto + opacity | 240ms |
| Lightbox | opacity | 200ms |
| 页面滚动揭示 | 可选轻微 fade-up，每页最多 2–3 处 | 400ms |

一律尊重 `prefers-reduced-motion`。

---

## 11. 无障碍

- 触控目标 ≥ 44px  
- 焦点环保留（现有 `#315bff` 可保留或改为 ink）  
- 图库按钮需 `aria-label`；缩略图 `aria-current`  
- 价格与促销不只靠颜色区分  
- 表单错误文案可读

---

## 12. 与现有文档的关系

- 继承：`2026-07-23` 视觉迁移的纸/墨 Token 与手绘披露  
- 继承：`2026-07-26` editorial 的「少噪音、图像优先」  
- **升级**：商品页/列表/信任条/评价轨按 MesonArt **电商转化结构**加深，不再只做安静画廊排版

---

## 13. 非目标（Sprint 1–3）

- 不改支付合约、订单库表、Sanity 权限模型（除非缺尺寸/裱框字段）  
- 不使用 MesonArt 商标、原图、原文评价  
- 不做真实 WebXR VR（可用「View in room」场景图代替）  
- 不首轮重做 Admin UI  

---

## 14. 验收（全站细节）

- [ ] 任意商品页 BuyBox 顺序与第 6.3 节一致  
- [ ] 图库具备缩略图、箭头/滑动、lightbox、reduced-motion  
- [ ] ProductCard 全站外观一致  
- [ ] 筛选 facet 在 `/artworks` 与 collection 可用  
- [ ] 顶栏公告 + 信任条 + Header/Footer 全站统一  
- [ ] 文案/评价库为 YiiArt 原创（见 Content Spec）  
- [ ] 中英 key 结构对齐  
- [ ] 桌面 + 移动目视对比通过  
