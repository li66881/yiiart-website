# YiiArt Optimized Storefront Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Forward-port the approved MesonArt-inspired storefront presentation onto the current YiiArt main branch without reverting catalog, media, checkout, payment, policy, SEO, or security behavior.

**Architecture:** Keep current server pages and domain models authoritative, and adapt optimized visual structures inside the current split client/server components. Add presentation tests before each slice, then restore shell/home, discovery, product detail, and cart in independently reviewable commits.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, CSS Modules, Sanity, Cloudflare R2, Node test runner with `tsx`.

## Global Constraints

- Do not modify checkout or payment API behavior.
- Do not delete or rewrite Sanity documents or R2 objects.
- Do not change existing URLs.
- Do not add fake reviews, sales counts, urgency, sale percentages, countdowns, or policy promises.
- Preserve `productMedia`, generated made-to-order prices/sizes, `shippingProfile`, and server-side checkout validation.
- Desktop QA target is 1440 x 1024; mobile QA target is 390 x 844.

---

### Task 1: Add Storefront Recovery Guardrails

**Files:**
- Create: `src/lib/storefront/optimized-storefront.test.ts`
- Modify: `scripts/check-public-copy.mjs`

**Interfaces:**
- Consumes: current source files under `src/components`, `src/app`, and `src/lib`.
- Produces: release tests that reject stale promotional claims and verify current data/checkout boundaries remain wired.

- [ ] **Step 1: Write the failing source-boundary tests**

```ts
test("optimized storefront keeps current catalog and checkout boundaries", async () => {
  const home = await readFile("src/app/page.tsx", "utf8")
  const product = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")
  const checkout = await readFile("src/lib/checkout.ts", "utf8")
  assert.match(home, /PUBLIC_ARTWORK_GROQ_FILTER/)
  assert.match(product, /isArtworkCheckoutAvailable/)
  assert.match(checkout, /resolveCheckoutSelection/)
  assert.match(checkout, /shippingProfile/)
})

test("optimized storefront contains no stale hard-coded promotion", async () => {
  const sources = await Promise.all([
    "src/components/HeroSection.tsx",
    "src/components/home/EditorialHome.tsx",
    "src/components/storefront/ProductPurchasePanel.tsx",
  ].map((file) => readFile(file, "utf8")))
  assert.doesNotMatch(sources.join("\n"), /40% off|sale ends in|only \d+ left/i)
})

test("public copy validation rejects stale optimized-branch claims", async () => {
  const copyCheck = await readFile("scripts/check-public-copy.mjs", "utf8")
  assert.match(copyCheck, /40% off/)
  assert.match(copyCheck, /free replacement or a full refund/)
  assert.match(copyCheck, /arrive 5-10 business days later/)
})
```

- [ ] **Step 2: Run the guardrail test and verify the copy-check assertion fails**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts`

Expected: FAIL because `scripts/check-public-copy.mjs` does not yet contain all three stale-claim patterns.

- [ ] **Step 3: Extend public-copy validation with exact forbidden claims**

```js
const forbiddenStorefrontClaims = [
  /40% off/i,
  /free replacement or a full refund/i,
  /arrive 5-10 business days later/i,
]
```

Scan public application source while excluding tests, docs, reports, and migration scripts.

- [ ] **Step 4: Run copy validation**

Run: `npm run copy:check`

Expected: PASS on the current baseline.

- [ ] **Step 5: Commit the guardrails**

```bash
git add src/lib/storefront/optimized-storefront.test.ts scripts/check-public-copy.mjs
git commit -m "test: guard optimized storefront recovery"
```

### Task 2: Restore The Optimized Global Shell And Homepage

**Files:**
- Modify: `src/components/HeaderClient.tsx`
- Modify: `src/components/FooterClient.tsx`
- Modify: `src/components/HeroSection.tsx`
- Modify: `src/components/home/EditorialHome.tsx`
- Modify: `src/components/home/editorial-home.module.css`
- Modify: `src/app/globals.css`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Consumes: `CatalogNavigationProvider`, current cart/search/account/locale controls, current artwork arrays, `getArtworkImageUrl`, and `buildEditorialHomeEdit`.
- Produces: dense optimized navigation, footer, multi-image hero, and merchandising modules driven only by current artwork data.

- [ ] **Step 1: Add failing shell and homepage composition assertions**

```ts
assert.match(headerClient, /optimized-storefront-header/)
assert.match(hero, /type HeroSlide/)
assert.match(hero, /aria-label="Previous slide"/)
assert.match(hero, /aria-label="Next slide"/)
assert.match(editorialHome, /Shop by room/)
assert.match(editorialHome, /Shop by style/)
assert.match(editorialHome, /Custom painting/)
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/catalog-navigation.test.ts src/lib/storefront/editorial-presentation.test.ts`

Expected: FAIL only on the new optimized composition assertions.

- [ ] **Step 3: Adapt the optimized header and footer structure**

Keep the current providers and handlers, but apply the optimized branch's compact two-level layout, stable icon buttons, dense menus, and responsive drawer inside `HeaderClient` and `FooterClient`. Add the stable marker class `optimized-storefront-header` to the header root for release verification.

- [ ] **Step 4: Build a current-data hero slide model**

```ts
export type HeroSlide = {
  imageUrl: string
  imageAlt: string
  eyebrow: string
  title: string
  subtitle: string
  ctaHref: string
  ctaLabel: string
}
```

Create up to three slides from approved current artwork images. Use neutral `New collection`, `Hand-painted to order`, and `Custom painting` messaging; omit the optimized branch's old promo mode, percentage, and countdown.

- [ ] **Step 5: Restore optimized homepage merchandising density**

Retain current dynamic `featured` and `artistCollection` arrays, then compose room, style, featured, new-arrival, custom-painting, process, trust, and FAQ bands with the optimized branch's spacing and image-led rhythm. Do not restore sample-review fallbacks.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/catalog-navigation.test.ts src/lib/storefront/catalog-navigation-loader.test.ts src/lib/storefront/editorial-presentation.test.ts src/lib/storefront/visual-content.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit shell and homepage recovery**

```bash
git add src/components/HeaderClient.tsx src/components/FooterClient.tsx src/components/HeroSection.tsx src/components/home/EditorialHome.tsx src/components/home/editorial-home.module.css src/app/globals.css src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore optimized storefront shell"
```

### Task 3: Restore Artwork And Collection Discovery Presentation

**Files:**
- Modify: `src/components/ArtworkDiscoveryGrid.tsx`
- Modify: `src/components/StorefrontControls.tsx`
- Modify: `src/components/ArtworksPageCopy.tsx`
- Modify: `src/components/StorefrontCollectionCopy.tsx`
- Modify: `src/app/artworks/page.tsx`
- Modify: `src/app/collections/[slug]/page.tsx`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Consumes: current collection catalog, filter state, pagination, physical dimensions, publication filters, and current artwork media helpers.
- Produces: compact optimized cards, stable filter/sort controls, and SEO content bands without changing URL or query behavior.

- [ ] **Step 1: Add failing discovery composition assertions**

```ts
assert.match(discoveryGrid, /optimized-product-grid/)
assert.match(storefrontControls, /aria-label="Sort artworks"/)
assert.match(collectionPage, /StorefrontCollectionCopy/)
assert.match(artworksPage, /PUBLIC_ARTWORK_GROQ_FILTER/)
```

- [ ] **Step 2: Run discovery tests and verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/catalog-presentation.test.ts src/lib/storefront/collection-catalog.test.ts src/lib/artwork-discovery.test.ts`

Expected: FAIL on the new optimized product-grid marker.

- [ ] **Step 3: Adapt optimized filters and product cards**

Use current image, title, dimension, price, handmade, and customization fields. Preserve pagination and active filter query strings. Add `optimized-product-grid` to the grid root and keep empty-state behavior.

- [ ] **Step 4: Restore collection content rhythm**

Keep current collection H1, canonical URL, default copy, buying guide, FAQ schema, and internal links; adjust only layout density and typography to match the optimized storefront.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/catalog-presentation.test.ts src/lib/storefront/collection-catalog.test.ts src/lib/storefront/catalog-navigation.test.ts src/lib/artwork-discovery.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit discovery recovery**

```bash
git add src/components/ArtworkDiscoveryGrid.tsx src/components/StorefrontControls.tsx src/components/ArtworksPageCopy.tsx src/components/StorefrontCollectionCopy.tsx src/app/artworks/page.tsx "src/app/collections/[slug]/page.tsx" src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore optimized artwork discovery"
```

### Task 4: Restore Product Detail Presentation Against Current Contracts

**Files:**
- Modify: `src/components/storefront/ProductGallery.tsx`
- Modify: `src/components/storefront/ProductPurchasePanel.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`
- Test: `src/lib/artwork-media.test.ts`
- Test: `src/lib/checkout-availability.test.ts`
- Test: `src/lib/storefront/product.test.ts`
- Test: `src/lib/storefront/selection.test.ts`
- Test: `src/lib/storefront/product-detail-copy.test.ts`

**Interfaces:**
- Consumes: current normalized product model, role-aware `productMedia`, current selection resolver, `isArtworkCheckoutAvailable`, and current cart callbacks.
- Produces: optimized multi-view gallery and purchase panel with no change to authoritative product or checkout data.

- [ ] **Step 1: Add failing PDP composition assertions**

```ts
assert.match(productGallery, /aria-label="Artwork gallery"/)
assert.match(productGallery, /dining_room/)
assert.match(purchasePanel, /optimized-purchase-panel/)
assert.match(artworkPage, /isArtworkCheckoutAvailable/)
assert.match(artworkPage, /buildProductDetailCopy/)
```

- [ ] **Step 2: Run product tests and verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/artwork-media.test.ts src/lib/checkout-availability.test.ts src/lib/storefront/product.test.ts src/lib/storefront/selection.test.ts src/lib/storefront/product-detail-copy.test.ts`

Expected: FAIL only on new optimized layout assertions.

- [ ] **Step 3: Restore gallery interaction**

Adapt the optimized thumbnail rail, main image, lightbox, wheel zoom, next/previous controls, and mobile rail to the current ordered media model. Keep all current media roles and render video through the existing media-type branch when present.

- [ ] **Step 4: Restore purchase-panel density and controls**

Apply the optimized size chips, finish/frame choices, quantity control for made-to-order products, price hierarchy, trust row, customization CTA, accordion rhythm, and mobile sticky Add to Cart. Add `optimized-purchase-panel` to the root. Original artwork quantity remains fixed at one.

- [ ] **Step 5: Keep current business facts and availability**

Use `buildProductDetailCopy` for processing and dispatch copy; use current `standardSizes`, `frameOptions`, `shippingProfile`, and authoritative selection price. Keep storefront and server checkout checks aligned through `isArtworkCheckoutAvailable`.

- [ ] **Step 6: Run focused product tests and verify GREEN**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/artwork-media.test.ts src/lib/checkout-availability.test.ts src/lib/checkout-selection.test.ts src/lib/storefront/product.test.ts src/lib/storefront/selection.test.ts src/lib/storefront/product-detail-copy.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit product detail recovery**

```bash
git add src/components/storefront/ProductGallery.tsx src/components/storefront/ProductPurchasePanel.tsx src/components/storefront/storefront.module.css "src/app/artwork/[slug]/page.tsx" src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore optimized product experience"
```

### Task 5: Restore Cart Presentation Without Changing Checkout

**Files:**
- Modify: `src/app/cart/page.tsx`
- Modify: `src/components/AddToCartButton.tsx`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`
- Test: `src/lib/cart/cart.test.ts`
- Test: `src/lib/checkout-selection.test.ts`
- Test: `src/lib/checkout-availability.test.ts`

**Interfaces:**
- Consumes: current `CartContext`, variant keys, made-to-order quantity rules, server checkout endpoint, and checkout URLs.
- Produces: optimized cart row, summary, and purchase-button styling with unchanged cart/checkout payloads.

- [ ] **Step 1: Add failing cart boundary assertions**

```ts
assert.match(cartPage, /optimized-cart-layout/)
assert.match(cartPage, /useCart/)
assert.doesNotMatch(cartPage, /api\/webhooks|stripe\.checkout/i)
```

- [ ] **Step 2: Run cart tests and verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/cart/cart.test.ts src/lib/checkout-selection.test.ts src/lib/checkout-availability.test.ts`

Expected: FAIL on the optimized cart-layout marker.

- [ ] **Step 3: Adapt cart and Add to Cart presentation**

Use the optimized spacing, media ratio, quantity controls, summary hierarchy, and mobile action treatment. Add `optimized-cart-layout` to the cart root. Preserve current item keys, selected size/finish labels, authoritative prices, and checkout request payload.

- [ ] **Step 4: Run cart and checkout tests and verify GREEN**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/cart/cart.test.ts src/lib/checkout-availability.test.ts src/lib/checkout-selection.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit cart recovery**

```bash
git add src/app/cart/page.tsx src/components/AddToCartButton.tsx src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore optimized cart presentation"
```

### Task 6: Full Verification And Production Release

**Files:**
- Modify only files required by verification findings.

**Interfaces:**
- Consumes: all recovered presentation slices and current production data.
- Produces: a reviewed PR merged to `main` and a verified Vercel production deployment.

- [ ] **Step 1: Run full automated verification**

Run: `npm test`

Expected: all unit tests and public-copy checks pass.

Run: `npx tsc --noEmit`

Expected: exit code 0.

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 2: Start the local production-equivalent preview**

Run: `npm run dev -- --hostname 127.0.0.1 --port 56910`

Expected: local YiiArt loads at `http://127.0.0.1:56910`.

- [ ] **Step 3: Verify desktop and mobile presentation**

At 1440 x 1024 and 390 x 844, inspect `/`, `/artworks`, one collection, `/artwork/ink-garden-01`, one original artwork, and `/cart`. Confirm no overflow, overlap, blank media, fake promotional copy, or disabled valid rolled checkout.

- [ ] **Step 4: Verify current product data contracts**

Confirm the four generated products still expose six ordered media entries, current standard sizes, current prices, `Ships rolled`, and Add to Cart. Do not submit checkout or payment.

- [ ] **Step 5: Review final diff and commit verification fixes**

```bash
git diff --check
git status --short
git add -- src/app src/components src/lib/storefront scripts/check-public-copy.mjs
git commit -m "fix: complete optimized storefront recovery"
```

If verification produces no additional changes, skip this commit.

- [ ] **Step 6: Push, create PR, and merge after checks**

```bash
git push -u origin codex/restore-optimized-storefront
gh pr create --base main --head codex/restore-optimized-storefront --title "Restore optimized YiiArt storefront" --body "Forward-port the approved optimized presentation while preserving current catalog, media, checkout, payment, policy, SEO, and security behavior."
```

- [ ] **Step 7: Verify production**

Confirm `https://www.yiiart.com/` and the four generated product URLs return 200 and display the recovered optimized presentation after the Vercel production deployment completes.
