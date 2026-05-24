# YiiArt

> Art for Your Home — 原画手绘油画电商平台

YiiArt 是一个基于 Next.js 的原画艺术品电商平台，连接艺术家与收藏家，支持国际支付与多语言展示。

**线上地址：** [https://www.yiiart.com](https://www.yiiart.com)

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 15 (App Router) + React 19 |
| **语言** | TypeScript |
| **样式** | Tailwind CSS 3 |
| **CMS** | Sanity (Headless CMS) |
| **数据库/认证** | Supabase + NextAuth v5 |
| **支付** | Stripe + PayPal |
| **国际化** | next-intl (EN / ZH) |
| **部署** | Vercel |
| **监控** | Sentry + Vercel Analytics |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装

```bash
git clone https://github.com/li66881/yiiart-website.git
cd yiiart-website
npm install
```

### 环境变量

复制 `.env.example` 到 `.env.local`，填入必要的配置：

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity 项目 ID |
| `SANITY_WRITE_TOKEN` | Sanity 写入 Token (Editor 权限) |
| `ADMIN_PASSWORD` | 管理员密码 |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe 公钥 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal Secret |
| `NEXTAUTH_SECRET` | NextAuth 密钥 |
| `NEXT_PUBLIC_BASE_URL` | 部署域名 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console 验证 |

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

---

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── admin/              # 管理后台
│   ├── artwork/[slug]/     # 作品详情页
│   ├── artist/[slug]/      # 艺术家详情页
│   ├── artworks/           # 作品列表
│   ├── artists/            # 艺术家列表
│   ├── cart/               # 购物车
│   ├── checkout/           # 结算
│   ├── api/                # API 路由
│   └── ...
├── components/             # 共享组件
├── context/                # React Context (Cart, Wishlist, Language)
├── lib/                    # 工具库
│   ├── sanity.ts           # Sanity 客户端
│   ├── pricing.ts          # 价格计算
│   ├── artwork-display.ts  # 作品展示工具
│   ├── checkout.ts         # 结算逻辑
│   ├── stripe.ts           # Stripe 集成
│   ├── paypal.ts           # PayPal 集成
│   └── auth.ts             # 认证逻辑
├── sanity/                 # Sanity Schema 定义
└── ...
messages/                   # i18n 翻译 (en.json, zh.json)
```

---

## 管理后台

访问 `/admin` 使用管理工具：

- **新建作品** — 上传图片并发布到 Sanity
- **新建艺术家** — 添加艺术家档案
- **Sanity Studio** — 在线管理内容 → [https://zlh03v8i.sanity.studio](https://zlh03v8i.sanity.studio)

---

## 内容管理 (Sanity)

内容通过 Sanity Headless CMS 管理。Schema 定义在 `src/sanity/` 目录下：

- `artist` — 艺术家档案（姓名、头像、简介、风格标签）
- `artwork` — 作品数据（标题、图片、价格、尺寸、材质、分类）
- `newsletterSubscriber` — 订阅用户

---

## 部署

项目已配置 Vercel 自动部署。推送到 `main` 分支会自动触发部署。

---

## License

All rights reserved.
