# YiiArt MesonArt-Aligned Product Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an image-led YiiArt product detail page with seven directly purchasable presentation choices, authoritative pricing, stronger sticky purchase support, and full-width product information aligned to the captured MesonArt reference.

**Architecture:** Keep the existing Next.js App Router page, gallery, cart, currency, and checkout providers. Move finish normalization and formula pricing into a shared storefront domain module used by both the client selection model and server checkout resolver; split the finish selector, sticky purchase bar, and detail navigation into focused components; keep editorial product information server-rendered below the main two-column purchase area.

**Tech Stack:** Next.js 15.5, React 19, TypeScript 5.9, CSS Modules, Tailwind CSS, Node test runner through `tsx --test`, Sanity, existing cart/currency contexts, Phosphor Icons, OpenAI ImageGen for seven finish-thumbnail bitmap assets.

## Global Constraints

- Product reference: `https://www.mesonart.com/products/wabi-sabi-wall-art-tx012`; implementation reference screenshots are in `D:/Documents/网站yiiart.com建设/audits/mesonart-product-detail-2026-08-12/`.
- Eligible `hand_painted_to_order` products expose exactly seven ordered presentation choices: Rolled canvas, Stretched canvas, Black float frame, White float frame, Natural wood float frame, Gold float frame, Silver float frame.
- Rolled canvas uses the selected size base price; stretched total is `round10(base * 1.70)`; each float-frame total is `round10(stretched * 1.05)`.
- Explicit valid product-specific frame options override the fallback and may intentionally expose a narrower set.
- Original artworks remain `As listed` and never receive generated presentation choices.
- Checkout accepts product ID, size ID, finish ID, and quantity only; labels and prices are always rebuilt server-side.
- Do not add countdowns, fake discounts, fabricated saves, sales counts, inventory activity, unverified arrival dates, fake reviews, or payment-provider branding that YiiArt does not actually support.
- Use real bitmap finish thumbnails and Phosphor Icons; do not draw frame assets or icons with CSS, inline SVG, handcrafted SVG, emoji, or text glyphs.
- Preserve the distinction between production time and shipping time; delivery wording remains conditional on destination, size, presentation, and carrier route.
- Do not deploy until the verified local preview passes the Product Design comparison and the user explicitly approves publishing.

---

## File and responsibility map

### Domain and checkout

- Create `src/lib/storefront/finish-options.ts`: canonical finish IDs, ordered fallback construction, fixed/configured override normalization, formula total/delta resolution, asset metadata.
- Create `src/lib/storefront/finish-options.test.ts`: exact ordering, formulas, override behavior, originals, invalid inputs.
- Modify `src/lib/storefront/product.ts`: replace fixed-only finish construction with the shared normalized finish model.
- Modify `src/lib/storefront/selection.ts`: calculate the active presentation delta from the selected size.
- Modify `src/lib/storefront/product.test.ts` and `src/lib/storefront/selection.test.ts`: client-facing normalization and price selection contracts.
- Modify `src/lib/checkout-selection.ts`: use the same finish model and calculate the authoritative server total.
- Modify `src/lib/checkout-selection.test.ts`: server parity, forged finish rejection, explicit override behavior.

### Product-detail UI

- Create `src/components/storefront/ProductFinishSelector.tsx`: accessible visual radio group for finish thumbnails, names, price effects, and selected summary.
- Create `src/components/storefront/ProductStickyPurchaseBar.tsx`: observer-driven desktop/mobile compact purchase bar sharing the main cart action.
- Create `src/components/storefront/ProductDetailNavigation.tsx`: full-width anchor navigation for four detail sections.
- Modify `src/components/storefront/ProductPurchasePanel.tsx`: focused purchase stack, price-bearing CTA, selector integration, trust rows, sticky-bar integration.
- Modify `src/components/storefront/ProductGallery.tsx`: role-specific thumbnail labels and reference-aligned gallery details without changing lightbox behavior.
- Modify `src/components/storefront/storefront.module.css`: layout, finish swatches, sticky bar, focus, responsive and reduced-motion behavior.
- Modify `src/components/CookieConsent.tsx`: publish a body data attribute/event state so the sticky purchase bar can reserve space while consent is visible.
- Modify `src/app/artwork/[slug]/page.tsx`: remove duplicate back link and right-column detail card; create full-width anchored editorial sections and related-work placement.

### Assets, dependency, QA

- Create `public/images/product-finishes/rolled-canvas.webp`.
- Create `public/images/product-finishes/stretched-canvas.webp`.
- Create `public/images/product-finishes/black-float-frame.webp`.
- Create `public/images/product-finishes/white-float-frame.webp`.
- Create `public/images/product-finishes/natural-wood-float-frame.webp`.
- Create `public/images/product-finishes/gold-float-frame.webp`.
- Create `public/images/product-finishes/silver-float-frame.webp`.
- Modify `package.json` and `package-lock.json`: add `@phosphor-icons/react` at the installed current compatible version.
- Modify `src/lib/storefront/optimized-storefront.test.ts`: structural page and component guardrails.
- Create `design-qa.md`: same-viewport reference/prototype comparison with final gate `final result: passed`.

---

### Task 1: Shared presentation pricing and server-authoritative selection

**Files:**
- Create: `src/lib/storefront/finish-options.ts`
- Create: `src/lib/storefront/finish-options.test.ts`
- Modify: `src/lib/storefront/catalog-config.ts`
- Modify: `src/lib/storefront/product.ts`
- Modify: `src/lib/storefront/product.test.ts`
- Modify: `src/lib/storefront/selection.ts`
- Modify: `src/lib/storefront/selection.test.ts`
- Modify: `src/lib/checkout-selection.ts`
- Modify: `src/lib/checkout-selection.test.ts`

**Interfaces:**
- Produces: `CatalogPresentationId`, `StorefrontFinishPricing`, `NormalizedFinishOption`, `buildNormalizedFinishOptions(frameOptions, productionModel)`, `resolveFinishTotalCny(finish, rolledPriceCny)`, and `resolveFinishDeltaCny(finish, rolledPriceCny)`.
- Consumes: existing `QuoteFinishId`, `quoteFinishOptions`, and `calculateFinishEstimateCny()` from `catalog-config.ts`.
- Later tasks consume `NormalizedFinishOption.assetSrc`, `assetAlt`, `pricing`, and `resolveFinishDeltaCny()`.

- [ ] **Step 1: Write failing domain tests for the seven-option fallback and formulas**

Add tests equivalent to:

```ts
test("builds seven ordered fallback presentation choices", () => {
  const finishes = buildNormalizedFinishOptions([], "hand_painted_to_order")
  assert.deepEqual(finishes.map((finish) => finish.id), [
    "rolled",
    "stretched",
    "black-frame",
    "white-frame",
    "natural-frame",
    "gold-frame",
    "silver-frame",
  ])
})

test("resolves rolled, stretched, and framed totals from one base price", () => {
  const finishes = buildNormalizedFinishOptions([], "hand_painted_to_order")
  const byId = new Map(finishes.map((finish) => [finish.id, finish]))
  assert.equal(resolveFinishTotalCny(byId.get("rolled")!, 1730), 1730)
  assert.equal(resolveFinishTotalCny(byId.get("stretched")!, 1730), 2940)
  assert.equal(resolveFinishTotalCny(byId.get("black-frame")!, 1730), 3090)
})

test("keeps originals as listed", () => {
  assert.deepEqual(buildNormalizedFinishOptions([], "original").map((finish) => finish.id), ["as-listed"])
})
```

- [ ] **Step 2: Run the new test and verify it fails**

Run: `npx tsx --test src/lib/storefront/finish-options.test.ts`
Expected: FAIL because `finish-options.ts` and its exports do not exist.

- [ ] **Step 3: Implement the shared finish model**

Use these public types and signatures:

```ts
export type CatalogPresentationId = "rolled" | QuoteFinishId | "as-listed"

export type StorefrontFinishPricing =
  | { kind: "fixed_delta"; priceDeltaCny: number }
  | { kind: "catalog_formula"; presentationId: Exclude<CatalogPresentationId, "as-listed"> }

export type NormalizedFinishOption = {
  id: string
  label: string
  pricing: StorefrontFinishPricing
  assetSrc: string
  assetAlt: string
}

export function buildNormalizedFinishOptions(
  frameOptions: unknown,
  productionModel: "hand_painted_to_order" | "original",
): NormalizedFinishOption[]

export function resolveFinishTotalCny(
  finish: NormalizedFinishOption,
  rolledPriceCny: number,
): number

export function resolveFinishDeltaCny(
  finish: NormalizedFinishOption,
  rolledPriceCny: number,
): number
```

Configured frame options normalize to `fixed_delta`. If at least one valid configured option exists, return only that validated set. Otherwise, return the seven catalog-formula options for made-to-order products. Map each fallback ID to its exact asset path under `/images/product-finishes/`.

- [ ] **Step 4: Run the domain tests and verify they pass**

Run: `npx tsx --test src/lib/storefront/finish-options.test.ts`
Expected: PASS with the ordered IDs and exact totals above.

- [ ] **Step 5: Write failing client/server parity tests**

Add assertions that:

```ts
test("uses catalog finish pricing for a fallback made-to-order product", () => {
  const product = buildStorefrontProduct({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 1730 }],
  }, [])
  const selection = getProductSelection(product, "80x100", "gold-frame")
  assert.equal(selection?.priceCny, 3090)
})

test("server rebuilds the same fallback finish total", () => {
  const selection = resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 1730 }],
  }, { id: "catalog-1", quantity: 1, sizeId: "80x100", finishId: "gold-frame" })
  assert.equal(selection.priceCny, 3090)
})
```

Also retain tests that explicit configured finishes override fallback choices and forged IDs throw `CheckoutValidationError`.

- [ ] **Step 6: Run the client/server tests and verify they fail**

Run: `npx tsx --test src/lib/storefront/product.test.ts src/lib/storefront/selection.test.ts src/lib/checkout-selection.test.ts`
Expected: FAIL because current product and checkout fallbacks expose only rolled canvas and fixed deltas.

- [ ] **Step 7: Wire the shared finish model into product, selection, and checkout**

Change `StorefrontFinish` in `product.ts` to extend or alias `NormalizedFinishOption`. Replace `buildFinishes()` with `buildNormalizedFinishOptions()`. Update `getProductSelection()` to calculate `priceCny` with `resolveFinishTotalCny(selection.finish, selection.size.priceCny)`. Update `CheckoutSelectionArtwork.frameOptions` to retain the configured inputs and make `resolveCheckoutSelection()` call the same shared builder and resolver.

- [ ] **Step 8: Run domain, storefront, cart, and checkout tests**

Run: `npx tsx --test src/lib/storefront/finish-options.test.ts src/lib/storefront/product.test.ts src/lib/storefront/selection.test.ts src/lib/checkout-selection.test.ts src/lib/cart/cart.test.ts`
Expected: PASS; cart variant keys remain distinct by size and finish.

- [ ] **Step 9: Commit Task 1**

```bash
git add src/lib/storefront/catalog-config.ts src/lib/storefront/finish-options.ts src/lib/storefront/finish-options.test.ts src/lib/storefront/product.ts src/lib/storefront/product.test.ts src/lib/storefront/selection.ts src/lib/storefront/selection.test.ts src/lib/checkout-selection.ts src/lib/checkout-selection.test.ts
git commit -m "feat: add authoritative presentation pricing"
```

---

### Task 2: Generate and verify the seven presentation thumbnail assets

**Files:**
- Create: `public/images/product-finishes/rolled-canvas.webp`
- Create: `public/images/product-finishes/stretched-canvas.webp`
- Create: `public/images/product-finishes/black-float-frame.webp`
- Create: `public/images/product-finishes/white-float-frame.webp`
- Create: `public/images/product-finishes/natural-wood-float-frame.webp`
- Create: `public/images/product-finishes/gold-float-frame.webp`
- Create: `public/images/product-finishes/silver-float-frame.webp`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: exact asset paths already defined in `finish-options.ts`.
- Produces: seven 512×512 WebP UI assets and `@phosphor-icons/react` for trust and navigation icons.

- [ ] **Step 1: Add the selected icon dependency**

Run: `npm install @phosphor-icons/react --legacy-peer-deps`
Expected: `package.json` and `package-lock.json` contain `@phosphor-icons/react`; no unrelated dependency version changes are accepted.

- [ ] **Step 2: Generate a consistent seven-image asset set with ImageGen**

Use the image-generation skill and generate individual 512×512 bitmap assets with this shared art direction:

```text
Premium ecommerce product UI swatch, close-up three-quarter corner of a neutral cream and sage abstract canvas, soft daylight studio, warm off-white background, realistic material texture, centered object with generous breathing room, no text, no logo, no watermark, no hands, consistent camera angle and scale across the set.
```

Apply the exact per-file treatment:

- `rolled-canvas.webp`: rolled loose canvas edge with visible natural canvas backing.
- `stretched-canvas.webp`: gallery-wrapped canvas on a wooden stretcher, no outer frame.
- `black-float-frame.webp`: thin matte black floating frame with visible shadow gap.
- `white-float-frame.webp`: thin warm-white floating frame with visible shadow gap.
- `natural-wood-float-frame.webp`: pale oak floating frame with visible wood grain and shadow gap.
- `gold-float-frame.webp`: slim brushed warm-gold floating frame, refined rather than glossy.
- `silver-float-frame.webp`: slim brushed silver floating frame, refined rather than chrome-like.

- [ ] **Step 3: Inspect and normalize each asset**

Open every generated asset, reject any wrong treatment, text, watermark, inconsistent camera angle, or low-quality edge. Export accepted assets to exact 512×512 WebP files, target under 100 KB each where quality permits.

- [ ] **Step 4: Verify every declared asset is present and decodable**

Run:

```powershell
@'
from PIL import Image
from pathlib import Path
root = Path('public/images/product-finishes')
expected = ['rolled-canvas.webp','stretched-canvas.webp','black-float-frame.webp','white-float-frame.webp','natural-wood-float-frame.webp','gold-float-frame.webp','silver-float-frame.webp']
for name in expected:
    image = Image.open(root / name)
    assert image.size == (512, 512), (name, image.size)
    image.verify()
print('7 finish assets verified')
'@ | python -
```

Expected: `7 finish assets verified`.

- [ ] **Step 5: Commit Task 2**

```bash
git add package.json package-lock.json public/images/product-finishes
git commit -m "feat: add product presentation assets"
```

---

### Task 3: Build the accessible visual finish selector

**Files:**
- Create: `src/components/storefront/ProductFinishSelector.tsx`
- Modify: `src/components/storefront/ProductPurchasePanel.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Consumes: `NormalizedFinishOption[]`, the selected size base price, `finishId`, `resolveFinishDeltaCny()`, and `PriceText`/currency context.
- Produces: `ProductFinishSelector({ finishes, rolledPriceCny, selectedId, onChange })`.

- [ ] **Step 1: Write a failing structural contract test**

Add source-contract assertions equivalent to:

```ts
test("product detail uses an accessible visual finish selector", async () => {
  const selector = await readFile("src/components/storefront/ProductFinishSelector.tsx", "utf8")
  assert.match(selector, /Choose a presentation/)
  assert.match(selector, /type="radio"/)
  assert.match(selector, /Selected:/)
  assert.match(selector, /assetSrc/)
  assert.match(selector, /resolveFinishDeltaCny/)
})
```

- [ ] **Step 2: Run the structural test and verify it fails**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts`
Expected: FAIL because `ProductFinishSelector.tsx` does not exist.

- [ ] **Step 3: Implement `ProductFinishSelector`**

Use this component interface:

```ts
type Props = {
  finishes: NormalizedFinishOption[]
  rolledPriceCny: number
  selectedId: string
  onChange: (finishId: string) => void
}
```

Render a native `<fieldset>` with `<legend>Choose a presentation</legend>`. Each `<label>` contains the radio input, a `next/image` thumbnail, visible name, and a `PriceText` increment only when `resolveFinishDeltaCny()` is greater than zero. Add a visible `Selected: {label}` summary and a framing-details disclosure.

- [ ] **Step 4: Integrate the selector into the purchase panel**

Replace the generic text finish grid only. Keep size cards unchanged. Pass `selection.size.priceCny`, active finish ID, and `setFinishId`. Ensure a size change recalculates finish increments without resetting a still-valid finish.

- [ ] **Step 5: Add selector CSS and focus behavior**

Add classes for a seven-item wrap/grid, 76–88 px thumbnail controls, selected two-pixel outline, independent `:focus-visible` ring, visible text labels, and mobile horizontal scrolling. Avoid `:has()` as the only selected-state signal: also pass a selected class or data attribute from React.

- [ ] **Step 6: Run structural and domain tests**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/finish-options.test.ts src/lib/storefront/selection.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/components/storefront/ProductFinishSelector.tsx src/components/storefront/ProductPurchasePanel.tsx src/components/storefront/storefront.module.css src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: add visual presentation selector"
```

---

### Task 4: Refine purchase hierarchy and add shared sticky purchase support

**Files:**
- Create: `src/components/storefront/ProductStickyPurchaseBar.tsx`
- Modify: `src/components/storefront/ProductPurchasePanel.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/components/CookieConsent.tsx`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Consumes: product thumbnail/title, selected size/finish labels, selected total, quantity, and the same `addSelection()` callback used by the main CTA.
- Produces: `ProductStickyPurchaseBar({ product, selection, quantity, actionVisible, onAdd })` and a main-action visibility state driven by `IntersectionObserver`.

- [ ] **Step 1: Write failing purchase-hierarchy contract tests**

Assert that the purchase panel source contains `Add to Cart —`, `ProductStickyPurchaseBar`, a main-action ref/sentinel, and that cookie consent sets/removes `document.body.dataset.cookieConsentVisible`.

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts`
Expected: FAIL because the new component and cookie state do not exist.

- [ ] **Step 3: Install and use Phosphor trust icons**

Use `LockKey`, `PaintBrush`, `Package`, and `ShieldCheck` (or the closest semantically equivalent exports available in the installed package). Render icon-and-copy trust rows with visible text. Do not use custom SVG or emoji fallbacks.

- [ ] **Step 4: Update the main purchase hierarchy**

Make the primary action label include `<PriceText amountCny={selection.priceCny * quantity} />`. Keep the price disclosure above selections, shorten description height, keep quantity and CTA adjacent on wide panels, and retain custom/advisor actions and the two concise disclosure accordions.

- [ ] **Step 5: Implement the sticky purchase bar**

Use an `IntersectionObserver` on the main action sentinel. Show the compact bar only when a valid selection exists and the main action is outside the viewport. Desktop content includes thumbnail, title, selected labels, total, and action. Mobile content includes selected labels, total, and action. Both call the same `addSelection()` closure.

- [ ] **Step 6: Coordinate cookie consent and bottom spacing**

When the cookie banner is visible, set `document.body.dataset.cookieConsentVisible = "true"`; remove it when dismissed/unmounted. CSS moves the sticky purchase bar above the cookie banner and reserves sufficient bottom space. Keep the cookie banner at the higher z-index.

- [ ] **Step 7: Add sticky/responsive/reduced-motion CSS**

Desktop bar is a centered white panel with subtle border/shadow and max width matching the site container. Mobile bar is full width with safe-area padding. Hide it when the footer enters view if the implementation uses a footer observer; otherwise ensure it remains above content without covering footer links. Disable transitions under `prefers-reduced-motion`.

- [ ] **Step 8: Run the optimized storefront, cart, and copy tests**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/cart/cart.test.ts && npm run copy:check`
Expected: PASS, with no fake promotion or urgency copy.

- [ ] **Step 9: Commit Task 4**

```bash
git add src/components/storefront/ProductStickyPurchaseBar.tsx src/components/storefront/ProductPurchasePanel.tsx src/components/storefront/storefront.module.css src/components/CookieConsent.tsx src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: strengthen product purchase flow"
```

---

### Task 5: Recompose the full-width product information architecture

**Files:**
- Create: `src/components/storefront/ProductDetailNavigation.tsx`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Produces: `ProductDetailNavigation()` with anchors `#about-artwork`, `#details-customization`, `#shipping-returns`, `#reviews`.
- Consumes: existing artwork description/story, detail values, scale guidance, policy copy, real reviews, related artworks, and existing custom-painting link.

- [ ] **Step 1: Write failing information-architecture contract tests**

Add assertions equivalent to:

```ts
assert.match(page, /id="about-artwork"/)
assert.match(page, /id="details-customization"/)
assert.match(page, /id="shipping-returns"/)
assert.match(page, /id="reviews"/)
assert.doesNotMatch(page, /Back to artworks/)
assert.match(page, /ProductDetailNavigation/)
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts`
Expected: FAIL because the four anchored sections and component do not exist.

- [ ] **Step 3: Implement the anchored navigation**

Render normal `<a>` links in a semantic `<nav aria-label="Product information">`. Apply sticky header offset with `scroll-margin-top` on targets. On mobile, keep labels on one line inside a horizontally scrollable container.

- [ ] **Step 4: Simplify the main two-column area**

Remove the separate `Back to artworks` link and remove the bordered reviews/specifications/about card from the sticky right column. The sticky right column contains only `ProductPurchasePanel`. Keep the breadcrumb.

- [ ] **Step 5: Build the four full-width sections**

Create these exact targets:

- `about-artwork`: artwork story/description plus one approved detail or room image from `galleryMedia` when available.
- `details-customization`: `ArtworkDetails`, scale guidance, presentation explanation, and the existing custom-painting action.
- `shipping-returns`: production guidance, dispatch, tracking, returns, damage support, and links to complete policies.
- `reviews`: wrap the real `ArtworkReviewSection`; keep honest empty state.

Use short paragraphs, max-width reading columns, specification cards, and balanced two-column layouts. Remove duplicate standalone sections whose content is now represented in these four groups. Place `Related Products` after the four groups.

- [ ] **Step 6: Run page structure and detail-copy tests**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/product-detail-copy.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit Task 5**

```bash
git add 'src/app/artwork/[slug]/page.tsx' src/components/storefront/ProductDetailNavigation.tsx src/components/storefront/storefront.module.css src/lib/storefront/optimized-storefront.test.ts
git commit -m "feat: recompose product detail content"
```

---

### Task 6: Polish gallery semantics and responsive product layout

**Files:**
- Modify: `src/components/storefront/ProductGallery.tsx`
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/lib/storefront/optimized-storefront.test.ts`

**Interfaces:**
- Consumes: `productMediaRoleLabels` and existing media roles.
- Produces: role-specific, unique thumbnail labels and reference-aligned desktop/mobile layout without changing the public gallery props.

- [ ] **Step 1: Add failing gallery and responsive guardrail tests**

Assert the gallery includes the visible/current role label, unique `Show {role}` labels, and the stylesheet contains the selected product layout markers for dominant gallery, finish swatch mobile scroll, full-width detail navigation, and sticky bar safe-area behavior.

- [ ] **Step 2: Run the guardrail test and verify it fails**

Run: `npx tsx --test src/lib/storefront/optimized-storefront.test.ts`
Expected: FAIL for the new responsive contract markers.

- [ ] **Step 3: Refine gallery spacing and role labels**

Keep the current thumbnail/lightbox logic. Align the thumbnail rail and square stage closer to the captured reference, retain `object-fit: contain`, and ensure thumbnail labels distinguish duplicate role views by adding their 1-based position when necessary.

- [ ] **Step 4: Complete desktop, tablet, and mobile CSS**

Verify:

- Desktop gallery/panel ratio stays within 58–61% / 39–42%.
- Tablet stacks gallery above purchase panel and disables panel stickiness.
- Mobile thumbnails scroll horizontally, finish controls retain labels, navigation scrolls without page overflow, and all primary targets are at least 44 px.
- At 200% zoom, sticky controls do not cover cookie choices or essential product content.

- [ ] **Step 5: Run gallery media and optimized source-contract tests**

Run: `npx tsx --test src/lib/artwork-media.test.ts src/lib/storefront/optimized-storefront.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit Task 6**

```bash
git add src/components/storefront/ProductGallery.tsx src/components/storefront/storefront.module.css src/lib/storefront/optimized-storefront.test.ts
git commit -m "fix: polish responsive product presentation"
```

---

### Task 7: Full verification and blocking Product Design QA

**Files:**
- Create: `design-qa.md`
- Modify only when fixing findings: files from Tasks 1–6

**Interfaces:**
- Consumes: the completed product detail implementation and reference screenshots.
- Produces: green automated verification, desktop/mobile screenshots, interaction evidence, and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Run the full automated verification**

Run:

```powershell
npm test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run build
```

Expected: all unit tests and public-copy checks pass, TypeScript exits 0, and Next.js production build exits 0.

- [ ] **Step 2: Start a production-like local preview**

Run `npm run dev -- --hostname 127.0.0.1 --port 3010` in a hidden background process. Confirm port 3010 is listening before browser verification.

- [ ] **Step 3: Capture reference and local desktop states at the same viewport**

Using the in-app browser, capture:

1. MesonArt product top state and local YiiArt product top state.
2. MesonArt size/framing state and local YiiArt size/presentation state.
3. MesonArt lower navigation/sticky cart state and local YiiArt anchored-navigation/sticky-purchase state.

Use the same desktop viewport and interaction state for each pair. Save files under `audits/mesonart-product-detail-implementation-2026-08-12/`.

- [ ] **Step 4: Test the primary purchase journey**

On the local product page:

- Select a non-default size.
- Select Natural wood float frame.
- Confirm selected total changes.
- Add to cart.
- Confirm the success announcement.
- Open cart and confirm size, presentation, quantity, and total.
- Return to the product, scroll below the main CTA, and confirm the sticky purchase bar appears.
- Confirm all four detail navigation links reach the correct sections.

- [ ] **Step 5: Capture and test mobile state**

Use a 390×844 viewport. Test gallery thumbnails, size cards, finish swatches, sticky purchase bar, cookie banner interaction, navigation reflow, and no horizontal overflow. Reset the viewport after capture.

- [ ] **Step 6: Run Product Design comparison QA**

Open the reference and local screenshots together for every state. Record P0/P1/P2/P3 findings in `design-qa.md`. Fix all P0/P1/P2 findings, capture again, and repeat until the document contains:

```text
final result: passed
```

Do not block handoff on optional P3 polish; list remaining P3 items as follow-up notes.

- [ ] **Step 7: Re-run full verification after QA fixes**

Run the Step 1 command again. Expected: all checks exit 0 on the final tree.

- [ ] **Step 8: Commit final QA and fixes**

```bash
git add design-qa.md src public package.json package-lock.json
git commit -m "test: verify MesonArt product detail redesign"
```

- [ ] **Step 9: Hand off the local preview**

Keep the verified product page open in the in-app browser and provide the clickable Codex Desktop preview URL. Do not push, merge, or deploy until the user inspects and explicitly asks to publish.

---

## Plan self-review

- Spec coverage: finish assets, seven-choice fallback, formulas, explicit overrides, original-art behavior, server authority, purchase CTA, sticky purchase controls, full-width anchored sections, responsive behavior, accessibility, honest copy, tests, and visual QA are each assigned to a task.
- Type consistency: `NormalizedFinishOption` and its pricing resolver are defined in Task 1 and consumed unchanged by Tasks 3–5.
- Scope: all tasks support one testable product-detail redesign; no homepage, catalog, or unrelated checkout redesign is included.
- Placeholder scan: the plan contains no deferred requirements or optional test-path branches; every test command names files that exist in the baseline worktree.
