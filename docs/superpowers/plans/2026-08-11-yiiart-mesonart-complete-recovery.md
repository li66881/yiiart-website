# YiiArt MesonArt Complete Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the approved August 7 MesonArt-aligned YiiArt presentation on top of the current production business logic without restoring fake promotions, reviews, popularity, delivery, or policy claims.

**Architecture:** `origin/main` remains authoritative for Sanity/R2 data, publication rules, product eligibility, cart, checkout, payment, policy, SEO, and security. Commit `0401d38` is authoritative only for visual hierarchy, layout density, navigation structure, gallery interaction, purchase option presentation, responsive behavior, and motion. The recovery is a forward port into the current split server/client component architecture, not a branch merge or rollback.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules, Tailwind CSS, Sanity, Cloudflare R2, Node test runner with `tsx`.

## Global Constraints

- Preserve all 147 passing current-main tests before adding recovery tests.
- Do not replace current Sanity queries, R2 media selection, catalog publication rules, checkout validation, payment APIs, shipping profiles, policy content, SEO, or security behavior.
- Do not hard-code discounts, countdowns, compare-at prices, sales counts, saves, carts, reviews, inventory urgency, delivery dates, tariffs, refunds, or return promises.
- Do not use MesonArt trademarks, images, reviews, or copy.
- Preserve current URLs and current product identifiers.
- Use `0401d38` only as the visual reference.
- Desktop comparison viewport: `1440 x 1024`.
- Mobile comparison viewport: `390 x 844`.
- Reference screenshots are stored in `audits/mesonart-version-compare-2026-08-11/` at the workspace root.

---

### Task 1: Lock The Selected Visual Contract

**Files:**
- Modify: `src/lib/storefront/optimized-storefront.test.ts`
- Modify: `scripts/check-public-copy.mjs`

**Interfaces:**
- Consumes: current public source files and the approved visual-source markers from commit `0401d38`.
- Produces: automated release gates for the denser header, two-row category navigation, rounded image-led hero, compact PDP layout, vertical thumbnails, commercial-information guardrails, and mobile behavior.

- [ ] **Step 1: Add failing structural assertions**

```ts
test("complete recovery matches the approved MesonArt-aligned composition", async () => {
  const [header, hero, gallery, purchase, styles] = await Promise.all([
    readFile("src/components/HeaderClient.tsx", "utf8"),
    readFile("src/components/HeroSection.tsx", "utf8"),
    readFile("src/components/storefront/ProductGallery.tsx", "utf8"),
    readFile("src/components/storefront/ProductPurchasePanel.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])

  assert.match(header, /meson-primary-navigation/)
  assert.match(header, /meson-category-navigation/)
  assert.match(hero, /meson-hero-shell/)
  assert.match(gallery, /meson-gallery-thumbnails/)
  assert.match(purchase, /meson-purchase-stack/)
  assert.match(styles, /\.mesonProductLayout/)
})
```

- [ ] **Step 2: Verify the new test fails for the current simplified recovery**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts`

Expected: FAIL because the complete recovery markers do not exist.

- [ ] **Step 3: Extend forbidden-copy validation**

Add patterns that reject source-level variants of:

```js
/\b\d+\s+people saved this\b/i
/\bin \d+ carts\b/i
/\b\d+ sold in (the )?last \d+ hours\b/i
/\b\d(?:\.\d)?\s*·\s*\d+ reviews?\b/i
/shipping and tariffs included/i
/deals still going/i
```

- [ ] **Step 4: Verify current trusted copy still passes**

Run: `npm run copy:check`

Expected: PASS.

- [ ] **Step 5: Commit the recovery contract**

```bash
git add src/lib/storefront/optimized-storefront.test.ts scripts/check-public-copy.mjs
git commit -m "test: lock complete MesonArt storefront recovery"
```

### Task 2: Restore The Full Header And Homepage Density

**Files:**
- Modify: `src/components/HeaderClient.tsx`
- Modify: `src/components/FooterClient.tsx`
- Modify: `src/components/HeroSection.tsx`
- Modify: `src/components/home/EditorialHome.tsx`
- Modify: `src/components/home/editorial-home.module.css`
- Modify: `src/app/globals.css`
- Test: `src/lib/storefront/optimized-storefront.test.ts`
- Test: `src/lib/storefront/catalog-navigation.test.ts`
- Test: `src/lib/storefront/visual-content.test.ts`

**Interfaces:**
- Consumes: current `CatalogNavigationProvider`, account/search/wishlist/cart/currency/locale handlers, current hero slides, and current curated artwork arrays.
- Produces: MesonArt-density shell and homepage without changing current data or navigation visibility rules.

- [ ] **Step 1: Add failing homepage behavior assertions**

```ts
assert.match(headerClient, /meson-primary-navigation/)
assert.match(headerClient, /meson-category-navigation/)
assert.match(hero, /meson-hero-shell/)
assert.match(hero, /aria-label="Previous slide"/)
assert.match(hero, /aria-label="Next slide"/)
assert.match(editorialHome, /Best Sellers/)
assert.match(editorialHome, /Shop by style/)
assert.match(editorialHome, /Shop by room/)
```

- [ ] **Step 2: Verify the assertions fail**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/catalog-navigation.test.ts src/lib/storefront/visual-content.test.ts`

Expected: FAIL on the new complete-recovery markers only.

- [ ] **Step 3: Forward-port the approved two-row navigation**

Adapt the `0401d38` header hierarchy into `HeaderClient.tsx` while retaining filtered current catalog links and all current handlers. Add `meson-primary-navigation` and `meson-category-navigation` marker classes. Keep the current safe announcement text unless a real promotion record exists.

- [ ] **Step 4: Forward-port the approved hero geometry**

Use the current trusted `HeroSlide[]` data inside the August 7 rounded wide carousel composition. Add `meson-hero-shell`. Keep current imagery and neutral handmade/custom copy; do not copy the old sale mode.

- [ ] **Step 5: Restore complete homepage merchandising rhythm**

Adapt the August 7 category, best-seller, style, room, new-arrival, custom-painting, trust, process, and FAQ sequencing to the current arrays. Do not insert placeholder reviews or missing products.

- [ ] **Step 6: Run focused tests**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/catalog-navigation.test.ts src/lib/storefront/catalog-navigation-loader.test.ts src/lib/storefront/editorial-presentation.test.ts src/lib/storefront/visual-content.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit shell and homepage recovery**

```bash
git add src/components/HeaderClient.tsx src/components/FooterClient.tsx src/components/HeroSection.tsx src/components/home/EditorialHome.tsx src/components/home/editorial-home.module.css src/app/globals.css src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore full MesonArt storefront shell"
```

### Task 3: Restore Dense Discovery And Product Cards

**Files:**
- Modify: `src/components/ArtworkDiscoveryGrid.tsx`
- Modify: `src/components/StorefrontControls.tsx`
- Modify: `src/components/ArtworksPageCopy.tsx`
- Modify: `src/components/StorefrontCollectionCopy.tsx`
- Modify: `src/app/artworks/page.tsx`
- Modify: `src/app/collections/[slug]/page.tsx`
- Modify: `src/components/home/editorial-home.module.css`
- Test: `src/lib/artwork-discovery.test.ts`
- Test: `src/lib/storefront/catalog-presentation.test.ts`
- Test: `src/lib/storefront/collection-catalog.test.ts`

**Interfaces:**
- Consumes: current URL filter state, filtered navigation, physical dimensions, collection catalog, publication rules, pagination, and current product media helpers.
- Produces: compact cards, richer visible filters, responsive discovery layout, and current-data collection pages.

- [ ] **Step 1: Add failing source and behavior assertions**

```ts
assert.match(discoveryGrid, /meson-discovery-toolbar/)
assert.match(discoveryGrid, /meson-product-card/)
assert.match(discoveryGrid, /Choose options/)
assert.match(storefrontControls, /aria-label="Sort artworks"/)
```

- [ ] **Step 2: Verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/artwork-discovery.test.ts src/lib/storefront/catalog-presentation.test.ts src/lib/storefront/collection-catalog.test.ts`

Expected: FAIL on new visual markers only.

- [ ] **Step 3: Restore the approved card and filter presentation**

Forward-port card image proportions, optional second-image crossfade, compact title and price hierarchy, restrained single badge, filter density, result count, and mobile filter trigger. Keep current URLs, pagination, active-filter retention, product availability, and image resolution logic.

- [ ] **Step 4: Restore collection-page content rhythm**

Use the current collection data and SEO copy, but match the selected version's heading, chip, grid, and supporting-copy spacing.

- [ ] **Step 5: Run focused tests and commit**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/artwork-discovery.test.ts src/lib/storefront/catalog-presentation.test.ts src/lib/storefront/collection-catalog.test.ts src/lib/storefront/catalog-navigation.test.ts`

Expected: PASS.

```bash
git add src/components/ArtworkDiscoveryGrid.tsx src/components/StorefrontControls.tsx src/components/ArtworksPageCopy.tsx src/components/StorefrontCollectionCopy.tsx src/app/artworks/page.tsx "src/app/collections/[slug]/page.tsx" src/components/home/editorial-home.module.css src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore full MesonArt discovery presentation"
```

### Task 4: Restore The Full Product Detail Experience

**Files:**
- Modify: `src/components/storefront/ProductGallery.tsx`
- Modify: `src/components/storefront/ProductPurchasePanel.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Test: `src/lib/artwork-media.test.ts`
- Test: `src/lib/checkout-availability.test.ts`
- Test: `src/lib/checkout-selection.test.ts`
- Test: `src/lib/storefront/product.test.ts`
- Test: `src/lib/storefront/product-detail-copy.test.ts`
- Test: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Consumes: current normalized product model, ordered `productMedia`, `isArtworkCheckoutAvailable`, `buildProductDetailCopy`, selection resolver, cart context, wishlist context, and current price disclosure.
- Produces: compact left-gallery/right-purchase layout, complete media controls, options, trust information, accordions, mobile sticky action, and current-data recommendations.

- [ ] **Step 1: Add failing PDP assertions**

```ts
assert.match(productGallery, /meson-gallery-thumbnails/)
assert.match(productGallery, /aria-label="Artwork gallery"/)
assert.match(productGallery, /aria-label="Open image viewer"/)
assert.match(purchasePanel, /meson-purchase-stack/)
assert.match(storefrontStyles, /\.mesonProductLayout/)
assert.doesNotMatch(purchasePanel, /people saved this|sold in last|reviews/i)
```

- [ ] **Step 2: Verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/artwork-media.test.ts src/lib/checkout-availability.test.ts src/lib/checkout-selection.test.ts src/lib/storefront/product.test.ts src/lib/storefront/product-detail-copy.test.ts`

Expected: FAIL on complete visual markers only.

- [ ] **Step 3: Restore the full approved gallery interaction**

Forward-port the August 7 vertical thumbnail rail, primary stage proportions, counter, next/previous controls, lightbox, wheel zoom, drag/pan, mobile swipe rail, image roles, and video branch. Preserve current R2/Sanity media ordering and empty-state handling.

- [ ] **Step 4: Restore the full purchase hierarchy**

Match the selected version's compact hierarchy for collection cue, title/SKU, trusted review summary only when real review data exists, price, size chips, finish chips, quantity, availability, primary CTA, help CTA, trust information, disclosure, accordions, and sticky mobile purchase action. Use current facts and hide absent facts.

- [ ] **Step 5: Restore recommendation and artist rhythms where current data exists**

Use current related products and artist data. Do not introduce sample reviews, invented products, or synthetic popularity.

- [ ] **Step 6: Run focused tests and commit**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/artwork-media.test.ts src/lib/checkout-availability.test.ts src/lib/checkout-selection.test.ts src/lib/storefront/product.test.ts src/lib/storefront/product-detail-copy.test.ts`

Expected: PASS.

```bash
git add src/components/storefront/ProductGallery.tsx src/components/storefront/ProductPurchasePanel.tsx src/components/storefront/storefront.module.css "src/app/artwork/[slug]/page.tsx" src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: restore full MesonArt product experience"
```

### Task 5: Restore Cart Rhythm And Verify The Recovery

**Files:**
- Modify: `src/app/cart/page.tsx`
- Modify: `src/components/AddToCartButton.tsx`
- Modify only verification findings under: `src/app`, `src/components`, `src/lib/storefront`

**Interfaces:**
- Consumes: current `CartContext`, variant keys, quantity restrictions, checkout request payload, payment routes, and trusted server-side selection validation.
- Produces: selected-version cart presentation and a verified recovery branch ready for review.

- [ ] **Step 1: Add failing cart presentation assertion**

```ts
assert.match(cartPage, /meson-cart-shell/)
assert.match(cartPage, /useCart/)
assert.doesNotMatch(cartPage, /stripe\.checkout|api\/webhooks/i)
```

- [ ] **Step 2: Verify RED**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/cart/cart.test.ts src/lib/checkout-selection.test.ts src/lib/checkout-availability.test.ts`

Expected: FAIL on `meson-cart-shell` only.

- [ ] **Step 3: Forward-port the approved cart presentation**

Restore compact cart rows, image ratio, selected-option hierarchy, quantity controls, sticky desktop summary, and mobile checkout action. Do not change cart line keys, prices, quantity rules, checkout payload, or payment routes.

- [ ] **Step 4: Run automated verification**

Run: `npm test`

Expected: all unit tests and copy checks PASS.

Run: `npx tsc --noEmit`

Expected: exit code 0.

Run: `npm run build`

Expected: Next.js production build completes.

- [ ] **Step 5: Run visual comparison**

At `1440 x 1024` and `390 x 844`, compare:

- `/`
- `/artworks`
- one populated collection
- `/artwork/ink-garden-01`
- one original artwork
- `/cart`

Use the saved MesonArt screenshots and new recovery screenshots at identical viewports. Confirm no horizontal overflow, clipped text, image distortion, control overlap, fake commercial claims, or invalid checkout state.

- [ ] **Step 6: Commit final recovery verification**

```bash
git add src/app/cart/page.tsx src/components/AddToCartButton.tsx src/lib/storefront/optimized-storefront.test.ts
git commit -m "fix: complete MesonArt storefront recovery"
```

Do not push, merge, or deploy until the user has inspected the local recovery preview.
