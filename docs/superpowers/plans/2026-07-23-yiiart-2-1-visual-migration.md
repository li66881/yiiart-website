# YiiArt 2.1 Visual Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a coherent 2.0 art-first storefront across YiiArt's core shopping journey while preserving production commerce, content, and operations behavior.

**Architecture:** Keep the existing Next.js application, Sanity queries, cart context, and checkout APIs. Add a small visual-system layer and compose reusable 2.0 editorial sections from existing public artwork data; route and payment behavior remain unchanged. Treat the `yiiart-preview` worktree as a visual reference only, not as deployable application code.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, CSS modules, Sanity, NextAuth, Stripe, PayPal, Node test runner, Vercel.

## Global Constraints

- Match `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-preview` for palette, layout rhythm, type scale, image-first composition, and understated motion.
- Use approved Cloudflare/Sanity image URLs and generated room-scene assets already placed in the project; do not introduce fabricated placeholder artwork.
- Keep `PUBLIC_ARTWORK_GROQ_FILTER`, rights status, migration status, `original`, and `hand_painted_to_order` behavior intact.
- Preserve cart variant keys, server-side checkout validation, Stripe, PayPal, invoice, login, search, locale controls, wishlist, orders, admin, sitemap, and metadata.
- Keep the generated-image disclosure below the product purchase area exactly as specified in the design document.
- Include visible focus styles and `prefers-reduced-motion` behavior in every new animated surface.

---

## File Map

| File | Responsibility |
|---|---|
| `src/app/globals.css` | Global color, typography, content-width, focus, and motion tokens. |
| `src/components/Header.tsx` | Functional 2.0 navigation shell retaining search, locale, account, wishlist, and cart controls. |
| `src/components/Footer.tsx` | 2.0 editorial footer preserving required routes. |
| `src/components/HeroSection.tsx` | Image-first 2.0 home hero with existing dynamic artwork image. |
| `src/components/home/EditorialHome.tsx` | Reusable home sections mapped to public artwork data and room images. |
| `src/components/home/editorial-home.module.css` | Home-only 2.0 layout and responsive styling. |
| `src/app/page.tsx` | Fetch approved artwork data and pass it into the home composition. |
| `src/components/ArtworkDiscoveryGrid.tsx` | 2.0 catalogue layout while retaining filters, sorting, and collection tabs. |
| `src/components/storefront/ProductGallery.tsx` | Multi-image 2.0 product gallery with a selected image state. |
| `src/components/storefront/ProductPurchasePanel.tsx` | Existing variant/cart behavior in 2.0 purchase hierarchy. |
| `src/components/storefront/ProductDisclosure.tsx` | Exact lower-detail generated-image and hand-painted variation disclosure. |
| `src/app/artwork/[slug]/page.tsx` | Places disclosure after product information and keeps structured data. |
| `src/app/cart/page.tsx` | 2.0 cart layout over existing cart context. |
| `src/app/checkout/page.tsx` | 2.0 checkout layout over existing payment state and API calls. |
| `src/lib/storefront/visual-content.ts` | Deterministic helpers for selected gallery/room-scene image roles. |
| `src/lib/storefront/visual-content.test.ts` | Unit tests for visual image role resolution and disclosure conditions. |

## Task 1: Establish the 2.0 visual system and responsive shell

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Create: `src/lib/storefront/visual-content.ts`
- Create: `src/lib/storefront/visual-content.test.ts`

**Interfaces:**

- Consumes: existing `StorefrontControls`, `SearchDialog`, `useSession`, `useWishlist`, `siteAssetUrl`, and translated labels.
- Produces: `resolveVisualImage(images: string[], fallback?: string): string | null` and `handPaintedDisclosure(productionModel: string): string | null` for later homepage and product components.

- [ ] **Step 1: Write the failing visual-content tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { handPaintedDisclosure, resolveVisualImage } from "./visual-content"

test("uses the first approved image as the visual lead", () => {
  assert.equal(resolveVisualImage(["hero.jpg", "detail.jpg"]), "hero.jpg")
  assert.equal(resolveVisualImage([], "fallback.jpg"), "fallback.jpg")
  assert.equal(resolveVisualImage([]), null)
})

test("only made-to-order works receive the variation disclosure", () => {
  assert.match(handPaintedDisclosure("hand_painted_to_order") || "", /hand-painted to order/i)
  assert.equal(handPaintedDisclosure("original"), null)
})
```

- [ ] **Step 2: Run the focused test and confirm it fails because the module is absent**

Run: `npx tsx --test src/lib/storefront/visual-content.test.ts`

Expected: FAIL with a module-resolution error for `./visual-content`.

- [ ] **Step 3: Implement the visual-content helper**

```ts
export function resolveVisualImage(images: string[], fallback?: string) {
  return images.find((value) => value.trim().length > 0) || fallback || null
}

export function handPaintedDisclosure(productionModel: string) {
  if (productionModel !== "hand_painted_to_order") return null
  return "Listing images illustrate the intended composition, palette, and room scale. Each canvas is hand-painted to order, so brushwork and small details will naturally vary."
}
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npx tsx --test src/lib/storefront/visual-content.test.ts`

Expected: PASS with 2 tests and 0 failures.

- [ ] **Step 5: Apply the shared tokens and shell**

Create paper, ink, muted, forest, clay, rule, content-width, and gutter CSS custom properties in `src/app/globals.css`. Preserve Tailwind utilities, global focus visibility, and reduced-motion behavior. Rework `Header` and `Footer` with the 2.0 dark editorial layout while keeping every existing interactive control and its target route.

- [ ] **Step 6: Verify shell behavior**

Run: `npm run test`

Expected: PASS; existing cart, checkout, copy, and publication tests remain green.

- [ ] **Step 7: Commit the shell foundation**

```bash
git add src/app/globals.css src/components/Header.tsx src/components/Footer.tsx src/lib/storefront/visual-content.ts src/lib/storefront/visual-content.test.ts
git commit -m "feat: establish YiiArt 2.0 visual shell"
```

## Task 2: Replace the homepage with public-data-backed 2.0 editorial sections

**Files:**

- Create: `src/components/home/EditorialHome.tsx`
- Create: `src/components/home/editorial-home.module.css`
- Modify: `src/components/HeroSection.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/lib/storefront/visual-content.test.ts`

**Interfaces:**

- Consumes: public artwork records fetched in `src/app/page.tsx`, `getArtworkImageUrl`, `pickEnglish`, `formatArtworkDimensions`, and `resolveVisualImage`.
- Produces: `<EditorialHome artworks={artworks} />`, rendering hero, featured works, room discovery, process, artist collection, custom commission, trust, and FAQ sections.

- [ ] **Step 1: Extend the failing visual-content test for an empty featured set**

```ts
test("returns null for empty visual image data rather than inventing an artwork image", () => {
  assert.equal(resolveVisualImage([]), null)
})
```

- [ ] **Step 2: Run the focused test and confirm current behavior before page composition**

Run: `npx tsx --test src/lib/storefront/visual-content.test.ts`

Expected: PASS; the test locks the no-fake-image requirement before UI work begins.

- [ ] **Step 3: Implement `EditorialHome`**

Use the reference sequence and map it to live public artworks:

```tsx
export function EditorialHome({ artworks }: { artworks: any[] }) {
  const featured = artworks.slice(0, 6)
  const artistWorks = artworks.filter((artwork) => artwork.collectionType === "artist_collection").slice(0, 3)
  return <main>{/* hero, featured, rooms, process, artist, custom, trust, FAQ */}</main>
}
```

Every featured card must link to `/artwork/${slug}`, every room card must link to the existing relevant collection route, and every missing image must render a semantic no-image state rather than an artwork imitation.

- [ ] **Step 4: Replace the homepage composition**

Keep the existing public-artwork query and metadata in `src/app/page.tsx`; pass fetched records to `EditorialHome` instead of composing the 1.0 card/section layout inline. Keep JSON-LD, custom-painting, and FAQ content.

- [ ] **Step 5: Run automated verification**

Run: `npm run test && npm run build`

Expected: all tests pass and Next.js produces the homepage without build errors.

- [ ] **Step 6: Commit the homepage migration**

```bash
git add src/app/page.tsx src/components/HeroSection.tsx src/components/home src/lib/storefront/visual-content.test.ts
git commit -m "feat: migrate YiiArt homepage to 2.0 editorial design"
```

## Task 3: Unify catalogue and collection browsing with the 2.0 card system

**Files:**

- Modify: `src/components/ArtworkDiscoveryGrid.tsx`
- Modify: `src/components/ArtworksPageCopy.tsx`
- Modify: `src/app/artworks/page.tsx`
- Modify: `src/app/collections/[slug]/page.tsx`
- Test: `src/lib/artwork-discovery.test.ts`

**Interfaces:**

- Consumes: `ArtworkDiscoveryItem`, `ArtworkFilterState`, collection tabs, translations, public-artwork records, and image URLs.
- Produces: the existing filter/sort/tabs interactions in an image-first 2.0 grid with collection differentiation.

- [ ] **Step 1: Add an explicit failing filter regression test**

```ts
test("keeps the artist collection distinct from new made-to-order work", () => {
  const artist = buildArtworkDiscoveryItem({ collectionType: "artist_collection", productionModel: "original" } as any, "artist.jpg")
  const madeToOrder = buildArtworkDiscoveryItem({ collectionType: "new_collection", productionModel: "hand_painted_to_order" } as any, "new.jpg")
  assert.equal(artist.collectionType, "artist_collection")
  assert.equal(madeToOrder.collectionType, "new_collection")
})
```

- [ ] **Step 2: Run the focused discovery test and confirm the expected failure or missing assertion**

Run: `npx tsx --test src/lib/artwork-discovery.test.ts`

Expected: FAIL until the fixture fields and expectations match the discovery model.

- [ ] **Step 3: Make the test pass with the smallest fixture/model adjustment**

Only change `src/lib/artwork-discovery.ts` when the public mapping needs an explicit safe default. Do not weaken the rights/migration gate.

- [ ] **Step 4: Apply the visual migration to the grid**

Keep the current tabs, filters, result count, clear action, sorting, and product links. Replace the 1.0 control/card presentation with the 2.0 thin-rule toolbar, editorial labels, image proportions, gentle image scale, and restrained product metadata.

- [ ] **Step 5: Verify browse routes and tests**

Run: `npm run test && npm run build`

Expected: PASS; `/artworks` and every static collection route build successfully.

- [ ] **Step 6: Commit catalogue migration**

```bash
git add src/components/ArtworkDiscoveryGrid.tsx src/components/ArtworksPageCopy.tsx src/app/artworks/page.tsx src/app/collections/[slug]/page.tsx src/lib/artwork-discovery.ts src/lib/artwork-discovery.test.ts
git commit -m "feat: align art discovery with YiiArt 2.0"
```

## Task 4: Complete the product gallery, purchase hierarchy, and transparent lower-detail disclosure

**Files:**

- Modify: `src/components/storefront/ProductGallery.tsx`
- Modify: `src/components/storefront/ProductPurchasePanel.tsx`
- Create: `src/components/storefront/ProductDisclosure.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Test: `src/lib/storefront/visual-content.test.ts`

**Interfaces:**

- Consumes: `StorefrontProduct`, selected size/finish cart state, existing `AddToCartButton`, gallery image URLs, and `handPaintedDisclosure`.
- Produces: gallery selection UI, purchase panel hierarchy, and a conditional `<ProductDisclosure productionModel={...} />` placed after product information.

- [ ] **Step 1: Add the disclosure component test**

```ts
test("contains the approved variation wording for made-to-order work", () => {
  const copy = handPaintedDisclosure("hand_painted_to_order") || ""
  assert.match(copy, /intended composition, palette, and room scale/i)
  assert.match(copy, /brushwork and small details will naturally vary/i)
})
```

- [ ] **Step 2: Run the focused test and confirm the exact copy is locked**

Run: `npx tsx --test src/lib/storefront/visual-content.test.ts`

Expected: PASS only when the approved disclosure text remains intact.

- [ ] **Step 3: Implement the selected-image gallery**

Use semantic buttons with `aria-pressed` and descriptive labels. The first valid image is selected by default; no image produces the existing intentional empty state. Do not change image URLs or introduce client fetches.

- [ ] **Step 4: Add and place the disclosure**

```tsx
export default function ProductDisclosure({ productionModel }: { productionModel: string }) {
  const copy = handPaintedDisclosure(productionModel)
  return copy ? <p className={styles.disclosure}>{copy}</p> : null
}
```

Place it after story/specification content and before supporting FAQ material in `src/app/artwork/[slug]/page.tsx`, never in the opening title or price block.

- [ ] **Step 5: Apply 2.0 detail-page styling without changing transactions**

Use reference gallery scale, dark/light section transitions, size/finish control states, and button hierarchy. Keep all `ProductPurchasePanel` props, cart payload fields, and checkout links unchanged.

- [ ] **Step 6: Verify product and checkout regressions**

Run: `npm run test && npm run build`

Expected: PASS; product routes build and cart/checkout selection tests remain green.

- [ ] **Step 7: Commit product migration**

```bash
git add src/components/storefront src/app/artwork/[slug]/page.tsx src/lib/storefront/visual-content.test.ts
git commit -m "feat: complete YiiArt 2.0 product presentation"
```

## Task 5: Align cart and checkout visuals without touching payment contracts

**Files:**

- Modify: `src/app/cart/page.tsx`
- Modify: `src/app/checkout/page.tsx`
- Test: `src/lib/cart/cart.test.ts`
- Test: `src/lib/checkout-selection.test.ts`

**Interfaces:**

- Consumes: existing `CartContext`, `CheckoutConfig`, payment method selection, invoice request path, and checkout APIs.
- Produces: 2.0-styled cart and checkout surfaces with unchanged payloads and completion routes.

- [ ] **Step 1: Run the existing cart and checkout tests as the baseline contract**

Run: `npx tsx --test src/lib/cart/cart.test.ts src/lib/checkout-selection.test.ts`

Expected: PASS before visual edits.

- [ ] **Step 2: Add a cart quantity regression assertion if missing**

```ts
test("an original artwork remains a one-quantity cart line", () => {
  const item = normalizeCartItem({ productionModel: "original", quantity: 4 } as any)
  assert.equal(item.quantity, 1)
})
```

Use the existing exported normalizer name from `src/lib/cart/cart.ts`; do not duplicate cart logic in page components.

- [ ] **Step 3: Make the test pass through the existing cart model**

If the current normalizer already enforces one quantity, add the test only. If it does not, correct the model, not page-level display code.

- [ ] **Step 4: Restyle cart and checkout structures**

Use the 2.0 paper/ink/rule system, a clear order summary, editorial type hierarchy, and focus-visible controls. Preserve existing form names, submission handlers, payment availability checks, API routes, error messages, and success redirects.

- [ ] **Step 5: Verify commerce paths**

Run: `npm run test && npm run build`

Expected: PASS; `cart`, `checkout`, and checkout success pages compile successfully.

- [ ] **Step 6: Commit cart and checkout migration**

```bash
git add src/app/cart/page.tsx src/app/checkout/page.tsx src/lib/cart/cart.test.ts src/lib/checkout-selection.test.ts
git commit -m "feat: align cart and checkout with YiiArt 2.0"
```

## Task 6: Visual QA, functional checks, and release preparation

**Files:**

- Create: `design-qa.md`
- Modify: `docs/superpowers/specs/2026-07-23-yiiart-2-1-visual-migration-design.md` only if a verified acceptance criterion needs correction.

**Interfaces:**

- Consumes: completed local build, the original 2.0 reference, deployed preview, and all prior tests.
- Produces: a `design-qa.md` report ending in `final result: passed` or `final result: blocked`.

- [ ] **Step 1: Run the full automated suite and production build**

Run: `npm run test && npm run build`

Expected: all tests pass and the build exits with code 0.

- [ ] **Step 2: Capture same-viewport reference and migrated views**

Capture home, `/artworks`, one new made-to-order artwork, cart, and checkout at desktop and mobile widths. Compare the original 2.0 reference and migrated page in the same state before judging visual differences.

- [ ] **Step 3: Verify the core shopping path manually**

Check: collection tab selection; filters; gallery image selection; size/finish choice; add to cart; original artwork quantity one; cart-to-checkout navigation; each enabled payment method selection; mobile menu; search; visible keyboard focus; reduced-motion behavior.

- [ ] **Step 4: Write and review `design-qa.md`**

Record screenshots/route/state, evidence, issue severity, resolution, and final result. Fix all P0, P1, and P2 items before setting `final result: passed`; record only remaining P3 polish as later work.

- [ ] **Step 5: Commit release-ready migration**

```bash
git add design-qa.md docs/superpowers/specs/2026-07-23-yiiart-2-1-visual-migration-design.md
git commit -m "docs: verify YiiArt 2.1 visual migration"
```

- [ ] **Step 6: Publish only after user review of the verified preview**

Merge the reviewed integration branch into `main`, push it, deploy to Vercel, and check the production alias routes. Keep the current production revision available as rollback until the post-deployment route and purchase-path checks pass.

## Plan Self-Review

- Spec coverage: Tasks 1–5 implement every shared-shell, home, catalogue, detail, disclosure, and commerce requirement. Task 6 covers visual comparison, automated checks, and controlled release.
- Scope: bulk generation of 200–300 product images is intentionally excluded; this migration establishes the asset system and page pattern first.
- Consistency: `resolveVisualImage` and `handPaintedDisclosure` are defined in Task 1 and consumed by later tasks. Public publication filtering and transaction contracts remain untouched.
- Placeholder scan: no deferred implementation markers are present.
