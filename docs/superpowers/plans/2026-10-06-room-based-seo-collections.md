# Room-Based SEO Collections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make four English room-intent collections reflect explicitly tagged public inventory and be indexable only while at least four matching works are available.

**Architecture:** Extend the existing `MarketingCollection` matcher with explicit room tags and retain current category, series, and large-canvas behavior. Use one shared room-page inventory threshold in page metadata and sitemap generation; keep room content editorially authored in the existing collection model and link it from current buying guides.

**Tech Stack:** Next.js App Router, TypeScript, Sanity GROQ, Node test runner via `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-05-room-based-collection-pages-design.md`

## Global Constraints

- “Use explicit Sanity `roomTypes` as the source of truth for room-specific SEO pages. Do not use inferred rooms for indexable collection membership.”
- “Use a shared minimum inventory threshold of four matching public products for room-page indexability and inclusion in the collection sitemap.”
- “Do not add translated routes in this scope.”
- “No new CMS fields or backfill; use the existing canonical `roomTypes` field and its current values.”
- “No room-by-style page matrix, programmatic long-tail page generation, or thin pages for low-inventory rooms.”
- Public counts are runtime data; design-time baselines (79 Living Room Abstract, 137 Bedroom, 50 Dining Room, 116 Office) must not be hard-coded.
- Editorial meta descriptions must be unique and 100-160 characters, matching the existing collection tests.

## Review Focus

- Missing, unknown, or inferred-only room tags must not match a room SEO collection; pin in Task 1 tests.
- A collection with both category and room constraints must require both; pin in Task 1 tests.
- Exactly four matching public products must pass indexability, while three must fail; pin in Task 2 tests.
- A Sanity inventory failure must omit room routes from the sitemap but preserve non-room collection routes; pin in Task 2 tests.
- Existing non-room rules (series, category, large-canvas) and interactive inferred-room filtering must remain unchanged; pin in Task 1 regression tests and Task 3 verification.

---

### Task 1: Explicit Room Matching and Curated Collections

**Files:**
- Modify: `src/lib/collections.ts`
- Modify: `src/lib/storefront/catalog-rules.ts`
- Modify: `src/lib/storefront/collection-catalog.ts`
- Test: `src/lib/storefront/collection-catalog.test.ts`
- Test: `src/lib/collections.test.ts`

**Interfaces:**
- `MarketingCollection` gains optional `roomTypes?: string[]` containing canonical Sanity labels.
- `CollectionArtwork` gains `roomTypes?: string[] | null`; the public inventory GROQ projection returns `roomTypes`.
- `matchesMarketingCollection(artwork, collection)` treats room tags as an explicit predicate; when both `categories` and `roomTypes` are present, both must match.

- [ ] **Step 1: Add failing room-matching tests**

In `collection-catalog.test.ts`, cover a room-only collection matching an explicitly tagged artwork; reject missing, unknown, and category-inferred-only room values; and reject category-only matches when the room predicate is also present. Include a positive case satisfying both Abstract and Living room. Retain and run the current category and large-canvas assertions.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx tsx --test src/lib/storefront/collection-catalog.test.ts`
Expected: FAIL because `roomTypes` is not currently considered by the matcher.

- [ ] **Step 3: Add room constraints to the existing collection model and matcher**

In `collections.ts`, set `abstract-art-for-living-room` to `categories: ["Abstract"]` plus `roomTypes: ["Living room"]`; change `bedroom-wall-art` to `roomTypes: ["Bedroom"]` and remove its category restriction. Add authored `dining-room-wall-art` and `office-wall-art` definitions using canonical values `Dining room` and `Office`. Preserve current matching behavior for series, existing style/color collections, and `large-canvas-art`.

In `catalog-rules.ts`, match explicit `roomTypes` only; normalize whitespace and casing for comparison without calling or reproducing `inferRooms`. When category and room constraints coexist, combine them with AND semantics.

In `collection-catalog.ts`, add `roomTypes` to the `CollectionArtwork` type and `publicCollectionInventoryQuery` projection.

- [ ] **Step 4: Run matcher tests and confirm they pass**

Run: `npx tsx --test src/lib/storefront/collection-catalog.test.ts`
Expected: PASS for explicit room matching, AND semantics, missing/unknown room rejection, and existing collection rules.

- [ ] **Step 5: Update collection metadata/content assertions**

In `collections.test.ts`, replace the hard-coded count of six with an explicit expected slug set of eight collections. Assert each meta description remains 100-160 characters and unique, and each new room collection has non-empty authored intro, buyer guidance, size advice, and FAQs. Keep the existing page-template and hero-copy assertions.

- [ ] **Step 6: Run collection tests and commit**

Run: `npx tsx --test src/lib/collections.test.ts src/lib/storefront/collection-catalog.test.ts`
Expected: PASS.

```bash
git add src/lib/collections.ts src/lib/storefront/catalog-rules.ts src/lib/storefront/collection-catalog.ts src/lib/collections.test.ts src/lib/storefront/collection-catalog.test.ts
git commit -m "feat: match room collections to explicit catalog tags"
```

### Task 2: Shared Indexability and Sitemap Inventory Gate

**Files:**
- Modify: `src/lib/storefront/catalog-rules.ts`
- Modify: `src/app/collections/[slug]/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/lib/sitemap.ts`
- Test: `src/lib/storefront/collection-catalog.test.ts`
- Test: `src/lib/sitemap.test.ts`

**Interfaces:**
- Export `ROOM_COLLECTION_MINIMUM_PRODUCTS = 4` and `shouldIndexMarketingCollection(collection: MarketingCollection, matchingPublicCount: number): boolean` from `catalog-rules.ts`. The helper gates only collections with `group === "room"`; it returns true at four or more and false below four.
- Add a pure collection-route mapper in `src/lib/sitemap.ts` that accepts collections, `CollectionArtwork[] | null`, and the site origin. `null` means inventory fetch failed and omits all room routes; an empty array is a successful zero-inventory result. It emits every non-room collection and only room collections meeting the shared threshold.

- [ ] **Step 1: Add failing threshold and sitemap tests**

Test that a room collection is not indexable at 0 or 3 matches and is indexable at exactly 4; test that a non-room collection remains indexable at zero. Test sitemap output includes eligible room routes once, excludes low-inventory room routes, retains all non-room collection routes, and excludes all room routes when inventory is `null`. Also test an empty successful inventory array separately.

- [ ] **Step 2: Run focused tests and confirm they fail**

Run: `npx tsx --test src/lib/storefront/collection-catalog.test.ts src/lib/sitemap.test.ts`
Expected: FAIL because the shared threshold helper and collection-route mapper do not exist.

- [ ] **Step 3: Implement the shared inventory gate**

Define the threshold and predicate in `catalog-rules.ts`. In `collections/[slug]/page.tsx`, set `robots: { index: false, follow: true }` in metadata only when a room collection has fewer than four matching public artworks; preserve existing canonical and metadata for eligible room pages and all non-room pages. Since `getCollectionArtworks` fails to an empty list, a Sanity failure must fail closed for room metadata.

In `sitemap.ts`, split room and non-room collections. Extend the existing public artwork GROQ projection to include `slug`, `category`, `roomTypes`, and any fields needed by the matcher, while retaining artist identity fields. On successful fetch, use the pure mapper to emit only eligible room routes. In the current catch branch, emit static/category routes and non-room collections only; do not alter unrelated artwork or artist fallback behavior.

- [ ] **Step 4: Run threshold and sitemap tests and confirm they pass**

Run: `npx tsx --test src/lib/storefront/collection-catalog.test.ts src/lib/sitemap.test.ts`
Expected: PASS, including exactly-four eligibility and fail-closed sitemap behavior.

- [ ] **Step 5: Run collection metadata tests and commit**

Run: `npx tsx --test src/lib/collections.test.ts src/lib/storefront/collection-catalog.test.ts src/lib/sitemap.test.ts`
Expected: PASS; room metadata indexability and sitemap routes use the same threshold.

```bash
git add src/lib/storefront/catalog-rules.ts src/app/collections/[slug]/page.tsx src/app/sitemap.ts src/lib/sitemap.ts src/lib/storefront/collection-catalog.test.ts src/lib/sitemap.test.ts
git commit -m "feat: gate room collection indexing by live inventory"
```

### Task 3: Room-Based Internal Links and Full Verification

**Files:**
- Modify: `src/app/guides/home-wall-art-pairing-guide/page.tsx`
- Modify: `src/app/size-guide/page.tsx`
- Modify: `src/app/collections/[slug]/page.tsx`
- Test: `src/lib/collections.test.ts`
- Test: `src/lib/storefront/collection-catalog.test.ts`
- Test: `src/lib/sitemap.test.ts`

**Interfaces:**
- The existing collection navigation state remains the source for which room collection links appear in collection-page cross-navigation; it receives explicit `roomTypes` through the projection added in Task 1.
- The pairing guide, size guide, and collection cross-links target `/collections/dining-room-wall-art` and `/collections/office-wall-art` with descriptive labels. Cross-navigation continues to use `visibleCollectionSlugs` and the existing `filterCatalogLinks` helper.

- [ ] **Step 1: Add failing internal-link assertions**

Extend `collections.test.ts` using its existing source-content assertions to verify pairing-guide and size-guide labels and exact paths. Extend `collection-catalog.test.ts` to verify Dining and Office destinations are filtered through `visibleCollectionSlugs` and low-inventory routes remain hidden, using the existing `filterCatalogLinks` helper.

- [ ] **Step 2: Run the focused link test and confirm it fails**

Run: `npx tsx --test src/lib/collections.test.ts`
Expected: FAIL because current Dining and Office links point to generic artwork/filter destinations.

- [ ] **Step 3: Update the contextual destinations**

Change the Dining Room guide card to `/collections/dining-room-wall-art`; replace the combined Office/Hospitality card with an Office-specific collection destination while leaving Hospitality intent under the existing large-canvas path where appropriate. Add Dining Room and Office links to the size guide and collection-page internal link list. Preserve the collection page's existing `filterCatalogLinks` filtering by `visibleCollectionSlugs`. Do not add Entryway or Hospitality collection pages.

- [ ] **Step 4: Run link tests and commit**

Run: `npx tsx --test src/lib/collections.test.ts src/lib/storefront/collection-catalog.test.ts src/lib/sitemap.test.ts`
Expected: PASS; new contextual links point to the authored English room collections and navigation still filters low-inventory destinations.

```bash
git add src/app/guides/home-wall-art-pairing-guide/page.tsx src/app/size-guide/page.tsx src/app/collections/[slug]/page.tsx src/lib/collections.test.ts
git commit -m "feat: link room guides to curated collections"
```

- [ ] **Step 5: Run full verification**

Run: `npm test`
Expected: all unit tests, integration tests, and public-copy checks pass.

Run: `npx tsc --noEmit`
Expected: exit code 0.

Run: `npm run build`
Expected: production build succeeds.

- [ ] **Step 6: Verify generated routes and current inventory before release**

Against a production build with valid Sanity access, inspect each room route's rendered product membership, canonical, and robots metadata; verify only routes with at least four explicit matches appear once in sitemap. Recount live public tags and record actual counts rather than asserting the design-time baselines. Confirm the `/artworks` inferred-room filtering behavior is unchanged. Do not report rank or traffic improvement without Search Console evidence.

---
