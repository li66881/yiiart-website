# YiiArt 2.0 Core Commerce Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the approved YiiArt 2.0 storefront experience into the production-capable 1.0 Next.js repository while preserving Sanity, authentication, wishlist, checkout, payments, orders, reviews, search, multilingual support, analytics, and admin routes.

**Architecture:** The 1.0 repository remains the only deployable application. A focused storefront adapter converts existing and expanded Sanity artwork documents into the 2.0 presentation model. Variant selections are carried through a key-based cart and revalidated against Sanity on the server before Stripe, PayPal, or invoice checkout; existing artist-collection products remain backward compatible.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Tailwind CSS 3, Sanity, NextAuth, Stripe, PayPal, Neon/Postgres, Node test runner with `tsx`.

## Global Constraints

- Work only on branch `codex/yiiart-2-integration`; do not modify or deploy `main`.
- Keep stable public routes `/artworks`, `/artwork/[slug]`, `/cart`, `/checkout`, `/custom-painting`, `/wishlist`, `/orders`, and `/admin`.
- Add `/shop` and `/shop/[slug]` only as permanent compatibility redirects to the stable routes.
- Existing records default to `artist_collection` and `original` behavior until explicitly migrated.
- New made-to-order records use `productionModel: "hand_painted_to_order"`; paid orders must not mark those catalog records sold.
- Checkout prices must be calculated from Sanity data on the server; never trust browser-submitted prices or labels.
- Preserve the existing currency conversion, payment provider, order, review, search, analytics, authentication, and admin implementations.
- Keep customer-facing copy in English and retain existing translation fallbacks.
- Do not publish preview-only or rights-unverified imagery.
- Use test-first red-green-refactor for domain and server behavior; run copy check and production build before each checkpoint.

---

### Task 1: Add the test harness and storefront product adapter

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/storefront/product.ts`
- Create: `src/lib/storefront/product.test.ts`

**Interfaces:**
- Consumes: current Sanity artwork fields and helpers from `src/lib/artwork-display.ts` and `src/lib/artwork-images.ts`.
- Produces: `StorefrontProduct`, `StorefrontSize`, `StorefrontFinish`, and `buildStorefrontProduct(artwork, imageUrls)`.

- [ ] **Step 1: Add a test command and TypeScript test runtime**

Run:

```powershell
npm install --save-dev tsx
```

Add these scripts to `package.json`:

```json
"test:unit": "tsx --test src/**/*.test.ts",
"test": "npm run test:unit && npm run copy:check"
```

- [ ] **Step 2: Write failing adapter tests**

Create tests that assert:

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { buildStorefrontProduct } from "./product"

test("defaults legacy artwork to the artist collection and original model", () => {
  const product = buildStorefrontProduct({
    _id: "legacy-1",
    title: { en: "Quiet Field" },
    slug: { current: "quiet-field" },
    price: 7200,
    dimensions: "80 x 100 cm",
    artist: { name: { en: "Studio Artist" } },
  }, [{ src: "https://cdn.example/quiet-field.jpg", alt: "Quiet Field", width: 1400, height: 1750 }])

  assert.equal(product.collectionType, "artist_collection")
  assert.equal(product.productionModel, "original")
  assert.equal(product.sizes.length, 1)
  assert.equal(product.sizes[0].priceCny, 7200)
})

test("maps made-to-order sizes and finishes without accepting invalid prices", () => {
  const product = buildStorefrontProduct({
    _id: "catalog-1",
    title: { en: "Soft Horizon" },
    slug: { current: "soft-horizon" },
    productionModel: "hand_painted_to_order",
    collectionType: "new_collection",
    standardSizes: [
      { _key: "80x100", label: "80 x 100 cm", widthCm: 80, heightCm: 100, priceCny: 2600 },
      { _key: "bad", label: "Bad", priceCny: -1 },
    ],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, [])

  assert.deepEqual(product.sizes.map((size) => size.id), ["80x100"])
  assert.deepEqual(product.finishes.map((finish) => finish.id), ["rolled"])
})
```

- [ ] **Step 3: Run the adapter test and verify RED**

Run:

```powershell
npm run test:unit -- src/lib/storefront/product.test.ts
```

Expected: FAIL because `src/lib/storefront/product.ts` does not exist.

- [ ] **Step 4: Implement the minimal adapter**

Define strict public types, normalize legacy fields, reject non-positive prices, synthesize one fixed legacy size, preserve image order, and provide `collectionType`, `productionModel`, rights status, story, materials, rooms, styles, colors, orientation, creation window, sizes, and finishes.

- [ ] **Step 5: Run unit tests and verify GREEN**

Run:

```powershell
npm run test:unit
```

Expected: all adapter tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json src/lib/storefront/product.ts src/lib/storefront/product.test.ts
git commit -m "feat: add storefront product adapter"
```

### Task 2: Expand the Sanity artwork model without breaking legacy records

**Files:**
- Modify: `src/sanity/schemas/artwork.ts`
- Modify: `src/app/admin/artwork-new/page.tsx`
- Modify: `src/app/api/admin/create-artwork/route.ts`
- Create: `docs/sanity-artwork-migration.md`

**Interfaces:**
- Consumes: field names defined by `buildStorefrontProduct`.
- Produces: editor fields for `collectionType`, `productionModel`, `rightsStatus`, `migrationStatus`, `shortDescription`, `artworkStory`, `materials`, `styleTags`, `roomTypes`, `colorFamilies`, `orientation`, `standardSizes`, `frameOptions`, and `creationWindow`.

- [ ] **Step 1: Add schema fields with legacy-safe defaults**

Use these exact option values:

```ts
collectionType: "new_collection" | "artist_collection"
productionModel: "hand_painted_to_order" | "original"
rightsStatus: "approved" | "needs_review" | "blocked"
migrationStatus: "ready" | "needs_copy" | "needs_images" | "needs_rights_review" | "archive"
```

`standardSizes` items contain `_key`, `label`, `widthCm`, `heightCm`, and `priceCny`. `frameOptions` items contain `_key`, `label`, and `priceDeltaCny`.

- [ ] **Step 2: Update the admin creation form**

Add fields for collection type, production model, rights status, short description, creation window, standard sizes, and finish choices. Submit the same field names to the existing admin route, and validate/forward those fields in `src/app/api/admin/create-artwork/route.ts`.

- [ ] **Step 3: Document migration defaults**

Document that missing values resolve to:

```text
collectionType = artist_collection
productionModel = original
rightsStatus = needs_review
migrationStatus = needs_rights_review
```

No bulk production-data mutation occurs in this task.

- [ ] **Step 4: Verify the schema compiles**

Run:

```powershell
npm run build
```

Expected: production build exits 0.

- [ ] **Step 5: Commit**

```powershell
git add src/sanity/schemas/artwork.ts src/app/admin/artwork-new/page.tsx src/app/api/admin/create-artwork/route.ts docs/sanity-artwork-migration.md
git commit -m "feat: extend artwork catalog schema"
```

### Task 3: Make the cart variant-aware while preserving legacy carts

**Files:**
- Create: `src/lib/cart/cart.ts`
- Create: `src/lib/cart/cart.test.ts`
- Modify: `src/context/CartContext.tsx`
- Modify: `src/components/AddToCartButton.tsx`
- Modify: `src/app/cart/page.tsx`
- Modify: `src/app/checkout/page.tsx`

**Interfaces:**
- Produces: `CartItem`, `cartLineKey`, `normalizeStoredCart`, `addCartItem`, `removeCartItem`, and `updateCartQuantity`.
- `CartItem` adds `key`, `slug`, `productionModel`, `sizeId`, `sizeLabel`, `finishId`, and `finishLabel`; old `id`, `title`, `artist`, `price`, `image`, and `quantity` remain.

- [ ] **Step 1: Write failing cart tests**

Cover these behaviors:

```ts
assert.notEqual(cartLineKey({ id: "a", sizeId: "small", finishId: "rolled" }), cartLineKey({ id: "a", sizeId: "large", finishId: "rolled" }))
assert.equal(addCartItem([], legacyItem)[0].key, "legacy-id")
assert.equal(addCartItem([small], large).length, 2)
assert.equal(updateCartQuantity([small], small.key, 2)[0].quantity, 2)
```

- [ ] **Step 2: Run the cart test and verify RED**

Run:

```powershell
npm run test:unit -- src/lib/cart/cart.test.ts
```

Expected: FAIL because the cart module does not exist.

- [ ] **Step 3: Implement the pure cart domain**

Create stable keys in the form `artworkId:sizeId:finishId`. Normalize old local-storage items to `key === id`, `productionModel === "original"`, and `quantity === 1`.

- [ ] **Step 4: Connect the existing context and pages**

Keep the storage key `yiiart-cart`. Render selected size and finish in cart and checkout. Send `sizeId` and `finishId` with each checkout item. Do not send a browser price as an authority.

- [ ] **Step 5: Run unit tests and verify GREEN**

Run:

```powershell
npm run test:unit
```

Expected: all cart and adapter tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/cart src/context/CartContext.tsx src/components/AddToCartButton.tsx src/app/cart/page.tsx src/app/checkout/page.tsx
git commit -m "feat: support artwork variants in cart"
```

### Task 4: Revalidate size and finish prices in checkout

**Files:**
- Create: `src/lib/checkout-selection.ts`
- Create: `src/lib/checkout-selection.test.ts`
- Modify: `src/lib/checkout.ts`
- Modify: `src/lib/orders.ts`
- Modify: `src/lib/inventory.ts`
- Modify: `docs/postgres-orders.sql`

**Interfaces:**
- Produces: `resolveCheckoutSelection(artwork, request)` returning authoritative labels, production model, and CNY price.
- Checkout line items add `productionModel`, `sizeId`, `sizeLabel`, `finishId`, and `finishLabel`.

- [ ] **Step 1: Write failing checkout-selection tests**

Tests must prove:

```ts
// Legacy artwork: missing variant IDs resolves to the original price.
// Made-to-order artwork: valid IDs resolve to size price plus finish delta.
// Unknown size or finish: throws CheckoutValidationError.
// Browser-submitted labels or prices are ignored.
```

- [ ] **Step 2: Run the checkout test and verify RED**

Run:

```powershell
npm run test:unit -- src/lib/checkout-selection.test.ts
```

Expected: FAIL because the resolver does not exist.

- [ ] **Step 3: Implement authoritative resolution**

Fetch `productionModel`, `standardSizes`, and `frameOptions` with the current checkout GROQ query. Resolve IDs against the fetched document and convert only the resolved CNY amount with the existing currency helper.

- [ ] **Step 4: Preserve variant data in orders and inventory behavior**

Add nullable variant columns to `order_items` in `docs/postgres-orders.sql`. Persist labels and IDs. Change `markArtworksSold` to receive only checkout items whose `productionModel === "original"`; made-to-order products remain available after payment.

- [ ] **Step 5: Run unit tests and verify GREEN**

Run:

```powershell
npm run test:unit
```

Expected: all checkout-selection tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/checkout-selection.ts src/lib/checkout-selection.test.ts src/lib/checkout.ts src/lib/orders.ts src/lib/inventory.ts docs/postgres-orders.sql
git commit -m "feat: validate made-to-order checkout variants"
```

### Task 5: Connect the 2.0 catalog and product purchase experience to real services

**Files:**
- Create: `src/components/storefront/ProductGallery.tsx`
- Create: `src/components/storefront/ProductPurchasePanel.tsx`
- Create: `src/components/storefront/CollectionTabs.tsx`
- Create: `src/components/storefront/storefront.module.css`
- Modify: `src/app/artworks/page.tsx`
- Modify: `src/components/ArtworkDiscoveryGrid.tsx`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Create: `src/app/shop/page.tsx`
- Create: `src/app/shop/[slug]/page.tsx`

**Interfaces:**
- Consumes: `StorefrontProduct`, existing wishlist context, language context, currency context, review components, SEO helpers, and cart context.
- Produces: a 2.0-style catalog and purchase panel using real Sanity records and the real checkout cart.

- [ ] **Step 1: Build the product query and adapter call**

Request all adapter fields in the listing and detail GROQ queries. Pass ordered image URLs into `buildStorefrontProduct`.

- [ ] **Step 2: Port the selected 2.0 visual structure**

Use the existing 2.0 reference files from `D:/Documents/网站yiiart.com建设/.worktrees/yiiart-preview/components`. Keep the approved low-density typography, image-first layout, collection tabs, restrained hover scale, desktop media/purchase split, and mobile purchase bar.

- [ ] **Step 3: Connect real interactions**

`Add to Cart` writes the selected authoritative IDs to the 1.0 cart. Wishlist uses `WishlistContext`. Search and account links keep the 1.0 implementations. The cart CTA routes to `/checkout`.

- [ ] **Step 4: Add compatibility redirects**

Implement permanent redirects:

```ts
// /shop -> /artworks
// /shop/[slug] -> /artwork/[slug]
```

- [ ] **Step 5: Verify core routes compile**

Run:

```powershell
npm run test
npm run build
```

Expected: tests pass, copy check passes, and production build exits 0.

- [ ] **Step 6: Commit**

```powershell
git add src/components/storefront src/app/artworks src/components/ArtworkDiscoveryGrid.tsx src/app/artwork src/app/shop
git commit -m "feat: connect redesign to live catalog and checkout"
```

### Task 6: Core-flow verification and release checkpoint

**Files:**
- Create: `docs/yiiart-2-core-integration-checklist.md`
- Modify: `README.md`

**Interfaces:**
- Produces: a reproducible local acceptance checklist and deployment prerequisites; no production deployment occurs.

- [ ] **Step 1: Run the full automated gate**

Run:

```powershell
npm run test
npm run build
git status --short
```

Expected: tests and build exit 0; status lists only the intended documentation changes before the final commit.

- [ ] **Step 2: Verify the customer path in the in-app browser**

At desktop and mobile widths, verify:

```text
Home -> Artworks -> collection tab/filter -> artwork detail -> size/finish -> add to cart -> cart -> checkout
Header -> search, wishlist, login/account, cart
Product detail -> reviews and custom painting
Footer -> policies and contact
```

- [ ] **Step 3: Record deployment prerequisites**

The checklist must require Sanity schema deployment, Postgres variant-column migration, verified Stripe/PayPal environment configuration, approved product imagery, and a staged Vercel preview before production promotion.

- [ ] **Step 4: Commit**

```powershell
git add docs/yiiart-2-core-integration-checklist.md README.md
git commit -m "docs: add core integration release checklist"
```

## Follow-on Plans

After this core checkpoint passes, create separate testable plans for:

1. Custom-art file upload and stored inquiry workflow.
2. Bulk migration of current products into the `Artist Collection` view with rights and content states.
3. Batch production workflow for 200-300 made-to-order catalog products.
4. Visual QA, accessibility, performance, analytics verification, staged Vercel release, and production promotion.
