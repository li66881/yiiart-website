# YiiArt Editorial Gallery Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make YiiArt feel like a refined image-led gallery while preserving every existing storefront action and product safeguard.

**Architecture:** Keep commerce behavior, Sanity data, and routes unchanged. Add small pure presentation helpers for discovery and product-detail grouping, then use them from existing React components; style changes remain in existing CSS modules and Tailwind classes.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, CSS modules, Node test runner through `tsx --test`.

## Global Constraints

- Preserve payment, cart, account, checkout, Sanity data, pricing, and product ordering logic exactly.
- Retain the hand-painted-to-order disclosure lower on product detail pages.
- Do not add routes, fabricated visual assets, or nonessential dependencies.
- Preserve semantic labels, focus visibility, 44px mobile touch targets, and reduced-motion behavior.
- Validate with `npm run test` and `npm run build` before handoff.

---

### Task 1: Add presentation helpers for calmer discovery and product detail

**Files:**
- Create: `src/lib/storefront/editorial-presentation.ts`
- Create: `src/lib/storefront/editorial-presentation.test.ts`
- Modify: `src/components/ArtworkDiscoveryGrid.tsx`
- Modify: `src/app/artwork/[slug]/page.tsx`

**Interfaces:**
- Produces `visibleFilterOptions(options: string[], counts: Map<string, number>, active: string[]): string[]`.
- Produces `tileCollectionCue({ collectionType, productionModel }): string | null`.

- [ ] **Step 1: Write the failing tests**

```ts
test("keeps active zero-count filters while hiding inactive empty filters", () => {
  const counts = new Map([["Abstract", 35], ["Texture", 0]])
  assert.deepEqual(visibleFilterOptions(["Abstract", "Texture"], counts, []), ["Abstract"])
  assert.deepEqual(visibleFilterOptions(["Abstract", "Texture"], counts, ["Texture"]), ["Abstract", "Texture"])
})

test("uses one collection cue instead of stacking product badges", () => {
  assert.equal(tileCollectionCue({ collectionType: "new_collection", productionModel: "hand_painted_to_order" }), "Hand-painted to order")
  assert.equal(tileCollectionCue({ collectionType: "artist_collection", productionModel: "original" }), "Artist collection")
})
```

- [ ] **Step 2: Run the new tests and verify they fail because the helpers do not exist**

Run: `npx tsx --test src/lib/storefront/editorial-presentation.test.ts`

Expected: FAIL with module or export-not-found errors.

- [ ] **Step 3: Implement the smallest pure helpers**

```ts
export function visibleFilterOptions(options: string[], counts: Map<string, number>, active: string[]) {
  return options.filter((option) => (counts.get(option) || 0) > 0 || active.includes(option))
}

export function tileCollectionCue(input: { collectionType: string; productionModel: string }) {
  if (input.collectionType === "artist_collection") return "Artist collection"
  if (input.productionModel === "hand_painted_to_order") return "Hand-painted to order"
  return null
}
```

- [ ] **Step 4: Run the helper tests and verify they pass**

Run: `npx tsx --test src/lib/storefront/editorial-presentation.test.ts`

Expected: PASS with no failures.

- [ ] **Step 5: Use the helpers in discovery and detail presentation**

Render only visible filter options and show one collection cue per artwork tile, without changing collection membership, filters, sorting, or product data.

- [ ] **Step 6: Run affected tests and commit**

Run: `npm run test:unit`

Commit:
```bash
git add src/lib/storefront/editorial-presentation.ts src/lib/storefront/editorial-presentation.test.ts src/components/ArtworkDiscoveryGrid.tsx src/app/artwork/[slug]/page.tsx
git commit -m "feat: simplify YiiArt product presentation"
```

### Task 2: Refine the header, footer, and global gallery language

**Files:**
- Modify: `src/lib/storefront/editorial-presentation.ts`
- Modify: `src/lib/storefront/editorial-presentation.test.ts`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes existing navigation links, localization, account state, cart, and wishlist state.
- Produces the same links and controls with primary browse navigation visually separated from utility controls.

- [ ] **Step 1: Add a failing navigation-priority test**

```ts
test("keeps browse links ahead of utilities in the gallery header", () => {
  const groups = headerNavigationGroups(["Shop Art", "Large Wall Art", "Custom Painting", "Size Guide", "Reviews", "Artists"])
  assert.deepEqual(groups.primary, ["Shop Art", "Large Wall Art", "Custom Painting", "Size Guide"])
  assert.deepEqual(groups.secondary, ["Reviews", "Artists"])
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx tsx --test src/lib/storefront/editorial-presentation.test.ts`

Expected: FAIL because `headerNavigationGroups` is not exported.

- [ ] **Step 3: Implement the grouping helper and calm navigation hierarchy**

```ts
export function headerNavigationGroups(items: string[]) {
  return { primary: items.slice(0, 4), secondary: items.slice(4) }
}
```

Keep all destination links but render browse links as the visible primary row, group language/currency/account/cart as lower-emphasis utilities, and keep one room-advice action. Use existing dark ink, warm-paper, and clay tokens rather than new colors.

- [ ] **Step 4: Refine footer groups and global type/motion tokens**

Keep all footer destinations but use fewer dense visual dividers, a stronger contact/collector-support cluster, and small utility typography. Limit global transitions to opacity, underline, and image scale, with the existing reduced-motion override.

- [ ] **Step 5: Verify navigation presentation helpers and commit**

Run: `npx tsx --test src/lib/storefront/editorial-presentation.test.ts`

Expected: PASS.

Commit:
```bash
git add src/lib/storefront/editorial-presentation.ts src/lib/storefront/editorial-presentation.test.ts src/components/Header.tsx src/components/Footer.tsx src/app/globals.css
git commit -m "feat: refine YiiArt gallery chrome"
```

### Task 3: Increase homepage image priority and editorial pacing

**Files:**
- Modify: `src/components/home/EditorialHome.tsx`
- Modify: `src/components/home/editorial-home.module.css`
- Modify: `src/components/HeroSection.tsx`

**Interfaces:**
- Consumes existing featured, artist, room, process, custom, trust, and FAQ content.
- Produces the same home links and section coverage with a non-repeating narrative sequence.

- [ ] **Step 1: Add a failing unit assertion for the editorial home sequence**

Extend `src/lib/storefront/visual-content.test.ts` with an expected ordered sequence of `discover`, `place`, `process`, `customize`, and `trust` returned by a new `editorialHomeSequence()` helper.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx tsx --test src/lib/storefront/visual-content.test.ts`

Expected: FAIL because `editorialHomeSequence` is not exported.

- [ ] **Step 3: Implement the helper and update the home copy**

```ts
export function editorialHomeSequence() {
  return ["discover", "place", "process", "customize", "trust"] as const
}
```

Use this sequence to remove the repeated headline and give each section a distinct eyebrow and title. Do not remove sections or links.

- [ ] **Step 4: Adjust image, spacing, and button hierarchy**

Make hero and artwork media larger; reduce nonessential labels; preserve two hero actions with a dark primary action and a quiet text-secondary action.

- [ ] **Step 5: Run focused tests and commit**

Run: `npx tsx --test src/lib/storefront/visual-content.test.ts`

Commit:
```bash
git add src/lib/storefront/visual-content.ts src/lib/storefront/visual-content.test.ts src/components/home/EditorialHome.tsx src/components/home/editorial-home.module.css src/components/HeroSection.tsx
git commit -m "feat: strengthen YiiArt editorial homepage"
```

### Task 4: Consolidate product-detail confidence content and polish purchase controls

**Files:**
- Modify: `src/components/storefront/storefront.module.css`
- Modify: `src/components/storefront/ProductPurchasePanel.tsx`
- Modify: `src/components/storefront/ProductGallery.tsx`
- Modify: `src/app/artwork/[slug]/page.tsx`

**Interfaces:**
- Consumes the existing `StorefrontProduct`, cart callback, gallery images, and product-detail fact values.
- Produces unchanged add-to-cart, wishlist, selection, WhatsApp, and custom-order behavior.

- [ ] **Step 1: Add a failing unit assertion for product detail groups**

```ts
test("keeps handmade support in a single product confidence group", () => {
  const groups = productDetailGroups({ title: "Afternoon II" })
  assert.deepEqual(groups.map((group) => group.id), ["artwork", "room", "care"])
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx tsx --test src/lib/storefront/editorial-presentation.test.ts`

Expected: FAIL because `productDetailGroups` is not implemented.

- [ ] **Step 3: Implement grouped information boundaries**

Add `productDetailGroups(input): Array<{ id: "artwork" | "room" | "care"; title: string; description: string }>` to `src/lib/storefront/editorial-presentation.ts`, then place existing facts inside its three semantic `details` regions: `Artwork details`, `Size and room guidance`, and `Handmade, shipping and support`. Keep the approved variation disclosure below the initial purchase area.

- [ ] **Step 4: Polish gallery and purchase styling**

Use the existing CSS module to increase gallery breathing room, refine selected thumbnail treatment, reduce panel border weight, keep the price/options/action order, and make the mobile bar match the dark-ink purchase action.

- [ ] **Step 5: Verify product selection and commit**

Run: `npx tsx --test src/lib/storefront/selection.test.ts src/lib/storefront/product.test.ts src/lib/storefront/editorial-presentation.test.ts`

Commit:
```bash
git add src/components/storefront/storefront.module.css src/components/storefront/ProductPurchasePanel.tsx src/components/storefront/ProductGallery.tsx src/app/artwork/[slug]/page.tsx src/lib/storefront/editorial-presentation.ts src/lib/storefront/editorial-presentation.test.ts
git commit -m "feat: refine YiiArt purchase experience"
```

### Task 5: Verify the complete storefront refinement

**Files:**
- Modify: `design-qa.md`

**Interfaces:**
- Consumes the implemented public storefront routes.
- Produces an evidence-based QA record for desktop and mobile home, discovery, and product detail.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm run test`

Expected: PASS with no failing unit or public-copy checks.

- [ ] **Step 2: Build the production application**

Run: `npm run build`

Expected: successful Next.js production build.

- [ ] **Step 3: Verify key visual and interaction states**

Capture desktop and mobile checks for `/`, `/artworks`, and `/artwork/afternoon2`; verify primary navigation, filtering, sort, gallery selection, size selection, add-to-cart, custom-order link, and reduced-motion-safe transitions.

- [ ] **Step 4: Record the completed checks and commit**

Document exact tested routes, viewport sizes, pass/fail results, and any browser-capture limitation in `design-qa.md`.

Commit:
```bash
git add design-qa.md
git commit -m "docs: verify YiiArt editorial refinement"
```
