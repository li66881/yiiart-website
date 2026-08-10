# YiiArt Release 1 Catalog Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish honest public policy copy, a tested made-to-order catalog configuration, a review-first migration path for all 63 Sanity artworks, and automatic hiding of under-populated collection links without changing existing routes or checkout behavior.

**Architecture:** Keep catalog business rules in pure TypeScript modules under `src/lib/storefront/`, keep Sanity mutation behind a dry-run-first CLI, and keep navigation counts behind a cached server helper. Existing pages continue importing `Header` and `Footer`; thin server wrappers provide collection visibility to extracted client components, so account, cart, language, and wishlist behavior remains intact.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Sanity, Cloudflare R2 metadata, Node `node:test`, `tsx`, Tailwind CSS.

## Global Constraints

- Read `yiiart简介.md` and sync `origin/main` before implementation.
- Base the implementation branch or worktree on the reviewed mainline; do not merge `origin/feat/sprint0-mesonart-design-spec` wholesale.
- Do not modify cart storage, checkout pages, checkout validation, payment routes, order storage, PayPal, Stripe, or webhooks.
- Do not delete or rename product, review, order, customer, or media records.
- Do not change existing URLs.
- Do not publish fake reviews, sales counts, discounts, Best Seller labels, customer photos, or unsupported delivery and refund promises.
- Use only owned, licensed, or existing YiiArt media.
- Treat physical `dimensions`, reviewed `widthCm`, and reviewed `heightCm` as product measurements; never use image pixels as artwork dimensions.
- Rolled price formula: `round10(widthCm * heightCm * 0.48)`.
- Stretched quote estimate: `round10(rolledPriceCny * 1.70)`.
- Framed quote estimate: `round10(stretchedEstimateCny * 1.05)`.
- Only rolled canvas may enter the existing direct-checkout option data in Release 1.
- Direct rolled checkout requires longest side at most 210 cm plus explicit record approval; all other finishes and larger sizes use quote actions.
- A collection needs at least four publicly visible matching products to appear in primary navigation; its route must continue to work below that threshold.
- Migration defaults to dry-run, writes a backup before any apply operation, and patches by immutable Sanity `_id` after verifying the expected slug.
- Use TDD for every pure rule and regression.

---

## File Structure

### New files

- `src/lib/storefront/catalog-config.ts`: size profiles, benchmark prices, finish estimates, checkout partitioning, and stable option IDs.
- `src/lib/storefront/catalog-config.test.ts`: exact catalog formula and profile tests.
- `src/lib/catalog-migration.ts`: pure dimension parsing, migration validation, and Sanity patch planning.
- `src/lib/catalog-migration.test.ts`: planner, preservation, skip-reason, and idempotency tests.
- `src/lib/catalog-migration-io.ts`: argument parsing, JSON serialization, backup naming, and apply-gate helpers with no network code.
- `src/lib/catalog-migration-io.test.ts`: CLI and backup helper tests.
- `scripts/migrate-made-to-order-catalog.mts`: Sanity read, report, backup, and apply orchestration.
- `src/lib/storefront/collection-catalog.ts`: pure collection matching plus cached Sanity collection counts and navigation state.
- `src/lib/storefront/collection-catalog.test.ts`: collection matching, threshold, and link-filter tests.
- `src/components/HeaderClient.tsx`: current interactive header implementation with visibility props.
- `src/components/FooterClient.tsx`: current interactive footer implementation with visibility props.
- `src/sanity/schemas/artwork.test.ts`: schema-field and default-value regression tests.

### Modified files

- `.gitignore`: ignore generated migration reports and backups, but not reviewed source code.
- `scripts/check-public-copy.mjs`: block the exact unsupported claims found in the current storefront.
- `src/lib/policy-content.ts`: single safe policy vocabulary for trust, shipping, returns, damage, payment, and FAQ.
- `src/components/Header.tsx`: become an async server wrapper; replace unsupported announcement copy.
- `src/components/Footer.tsx`: become an async server wrapper; replace unsupported guarantees.
- `src/app/page.tsx`
- `src/app/artwork/[slug]/page.tsx`
- `src/app/collections/[slug]/page.tsx`
- `src/app/shipping-returns/page.tsx`
- `src/app/shipping/page.tsx`
- `src/app/returns/page.tsx`
- `src/app/custom-painting/page.tsx`
- `src/app/about/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/links/page.tsx`
- `src/app/artworks/page.tsx`
- `src/components/CustomPaintingRequestForm.tsx`
- `src/lib/seo.ts`
- `src/lib/storefront-content.ts`
- `src/lib/collections.ts`
- `messages/en.json`
- `src/sanity/schemas/artwork.ts`
- `src/lib/storefront/editorial-presentation.ts`
- `src/lib/storefront/editorial-presentation.test.ts`

## Task 1: Enforce Honest Public Copy

**Files:**
- Modify: `scripts/check-public-copy.mjs`
- Modify: `src/lib/policy-content.ts`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Modify: `src/app/collections/[slug]/page.tsx`
- Modify: `src/app/shipping-returns/page.tsx`
- Modify: `src/app/shipping/page.tsx`
- Modify: `src/app/returns/page.tsx`
- Modify: `src/app/custom-painting/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `src/app/links/page.tsx`
- Modify: `src/app/artworks/page.tsx`
- Modify: `src/components/CustomPaintingRequestForm.tsx`
- Modify: `src/lib/seo.ts`
- Modify: `src/lib/storefront-content.ts`
- Modify: `src/lib/collections.ts`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: the current page-level content and the project policy rules in `yiiart简介.md`.
- Produces: `trustPrinciples`, `shippingHighlights`, `returnHighlights`, `paymentHighlights`, and `faqItems` containing only supportable language; `npm run copy:check` rejects regressions.

- [ ] **Step 1: Add failing public-copy rules**

Extend `bannedPatterns` with narrowly scoped storefront claims:

```js
const bannedPatterns = [
  { pattern: /free worldwide (?:shipping|delivery)/i, reason: "unsupported universal free delivery" },
  { pattern: /shipping is (?:free|included in the price)/i, reason: "unsupported included shipping" },
  { pattern: /30[- ]day (?:returns?|return window|trial)/i, reason: "unconfirmed fixed return window" },
  { pattern: /refund(?:s|ed)? within \d+ business days/i, reason: "unconfirmed refund timing" },
  { pattern: /fully insured/i, reason: "unconfirmed insurance scope" },
  { pattern: /signed certificate/i, reason: "unconfirmed certificate fulfillment" },
  { pattern: /repl(?:y|ies) within 12 hours/i, reason: "unconfirmed response SLA" },
  { pattern: /\b(?:3-5|5-10) business days\b/i, reason: "unconfirmed shipping timing" },
  { pattern: /\b2-4 weeks\b/i, reason: "unconfirmed production timing" },
  { pattern: /within 48 hours/i, reason: "unconfirmed damage deadline" },
  { pattern: /free replacement or (?:a )?full refund/i, reason: "unsupported damage remedy" },
  { pattern: /for any reason/i, reason: "unsupported unconditional return" },
]
```

- [ ] **Step 2: Run the copy check and verify it fails on current storefront files**

Run: `npm run copy:check`

Expected: FAIL listing `Header.tsx`, `Footer.tsx`, policy pages, product copy, `policy-content.ts`, and `messages/en.json`.

- [ ] **Step 3: Replace central policy content with the approved vocabulary**

Use these meanings throughout `src/lib/policy-content.ts`:

```ts
export const trustPrinciples = [
  {
    title: "Hand-painted to order",
    text: "Each listed design is recreated by studio artists, with natural variations in brushwork and color.",
  },
  {
    title: "Confirm details before production",
    text: "Ask for size, palette, framing, room-fit, or current production guidance before the order is confirmed.",
  },
  {
    title: "Worldwide delivery options",
    text: "Available delivery methods depend on destination, artwork size, finish, carrier route, and customs requirements.",
  },
  {
    title: "Damage support",
    text: "Keep the artwork and all packaging, then send photos so YiiArt can review the issue and the available carrier process.",
  },
]

export const shippingHighlights = [
  {
    title: "Processing confirmed per order",
    text: "Preparation and production timing depends on the selected size, finish, surface, and current studio workload.",
  },
  {
    title: "Worldwide delivery options",
    text: "Delivery availability and format are confirmed for the destination before dispatch.",
  },
  {
    title: "Tracking when available",
    text: "Tracking details are shared when the selected carrier service provides them.",
  },
  {
    title: "Careful packaging",
    text: "Packaging is selected for the artwork size, finish, texture, and carrier route.",
  },
]

export const returnHighlights = [
  {
    title: "Eligibility reviewed by order",
    text: "Return conditions depend on whether the work is standard, custom, already produced, or personalized.",
  },
  {
    title: "Contact YiiArt first",
    text: "Include the order reference, artwork title, reason, and current condition so the available next step can be confirmed.",
  },
  {
    title: "Custom work has separate conditions",
    text: "Custom sizes, colors, and compositions may have different cancellation and return conditions confirmed before production.",
  },
  {
    title: "Damage review",
    text: "Keep the artwork, box, inner packaging, and shipping label and provide clear photos for review.",
  },
]
```

Keep payment copy limited to encrypted provider processing, accepted methods actually configured, and the fact that YiiArt does not store raw card details.

- [ ] **Step 4: Replace every page-local unsupported claim**

Use these exact replacements across the listed files and `messages/en.json`:

```text
Announcement: Hand-painted modern art, custom sizes, and worldwide delivery options.
Shipping: Delivery timing and format are confirmed by destination, size, finish, and carrier route.
Tracking: Tracking information is shared when the selected carrier service provides it.
Returns: Standard and custom orders may have different conditions; contact YiiArt with the order details before returning artwork.
Damage: Keep the artwork and all packaging and send clear photos so YiiArt can review the issue and available carrier process.
Production: Production timing is confirmed before the order is finalized.
Response time: YiiArt replies as soon as practical with sizing, palette, and pricing guidance.
Authenticity: Physical hand-painted artwork, not a printed reproduction.
```

Do not replace one unsupported number with a different number. Remove `original` and one-of-a-kind wording where the product is now made to order.

- [ ] **Step 5: Verify no banned public claim remains**

Run:

```powershell
rg -n -i "free worldwide|shipping is included|30-day|30 days|fully insured|signed certificate|within 12 hours|3-5 business|5-10 business|2-4 weeks|within 48 hours|free replacement|for any reason" src messages
npm run copy:check
```

Expected: `rg` returns no public-copy matches; `npm run copy:check` prints `Public copy check passed.` Internal schema fields such as `soldAt` are not targeted by these patterns.

- [ ] **Step 6: Run the complete test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 7: Commit the copy-integrity change**

```powershell
git add -- scripts/check-public-copy.mjs src/lib/policy-content.ts src/components/Header.tsx src/components/Footer.tsx src/app/page.tsx "src/app/artwork/[slug]/page.tsx" "src/app/collections/[slug]/page.tsx" src/app/shipping-returns/page.tsx src/app/shipping/page.tsx src/app/returns/page.tsx src/app/custom-painting/page.tsx src/app/about/page.tsx src/app/terms/page.tsx src/app/links/page.tsx src/app/artworks/page.tsx src/components/CustomPaintingRequestForm.tsx src/lib/seo.ts src/lib/storefront-content.ts src/lib/collections.ts messages/en.json
git commit -m "fix: remove unsupported storefront claims"
```

## Task 2: Add Tested Size and Benchmark Pricing Rules

**Files:**
- Create: `src/lib/storefront/catalog-config.test.ts`
- Create: `src/lib/storefront/catalog-config.ts`

**Interfaces:**
- Consumes: physical width, physical height, orientation, size-profile ID, and finish ID.
- Produces: `getCatalogSizes(profile, orientation)`, `calculateRolledPriceCny(widthCm, heightCm)`, `calculateFinishEstimateCny(finishId, rolledPriceCny)`, `partitionRolledSizesForCheckout(sizes)`, `quoteFinishOptions`, `SizeProfileId`, `CatalogSizeOption`, and `QuoteFinishOption`.

- [ ] **Step 1: Write failing catalog tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import {
  calculateFinishEstimateCny,
  calculateRolledPriceCny,
  getCatalogSizes,
  partitionRolledSizesForCheckout,
  quoteFinishOptions,
} from "./catalog-config"

test("uses the approved benchmark formula and CNY 10 rounding", () => {
  assert.equal(calculateRolledPriceCny(60, 60), 1730)
  assert.equal(calculateFinishEstimateCny("stretched", 1730), 2940)
  assert.equal(calculateFinishEstimateCny("black-frame", 1730), 3090)
})

test("returns the approved square profile with stable ids", () => {
  const sizes = getCatalogSizes("square", "portrait")
  assert.equal(sizes.length, 9)
  assert.deepEqual(sizes[0], { id: "60x60", label: "60 x 60 cm", widthCm: 60, heightCm: 60 })
  assert.deepEqual(sizes.at(-1), { id: "180x180", label: "180 x 180 cm", widthCm: 180, heightCm: 180 })
})

test("swaps two-to-three dimensions for landscape products", () => {
  assert.deepEqual(getCatalogSizes("two-three", "landscape")[0], {
    id: "75x50",
    label: "75 x 50 cm",
    widthCm: 75,
    heightCm: 50,
  })
})

test("keeps only rolled sizes with a longest side at most 210 cm checkout eligible", () => {
  const result = partitionRolledSizesForCheckout(getCatalogSizes("panoramic", "landscape"))
  assert.equal(result.direct.at(-1)?.id, "210x70")
  assert.deepEqual(result.quote.map((size) => size.id), ["240x80"])
})

test("publishes one stretched and five framed quote choices", () => {
  assert.deepEqual(quoteFinishOptions.map((finish) => finish.id), [
    "stretched",
    "black-frame",
    "white-frame",
    "natural-frame",
    "gold-frame",
    "silver-frame",
  ])
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx tsx --test src/lib/storefront/catalog-config.test.ts`

Expected: FAIL because `catalog-config.ts` does not exist.

- [ ] **Step 3: Implement the catalog configuration**

Use explicit readonly profile data, stable IDs, and one rounding helper:

```ts
export type SizeProfileId = "square" | "two-three" | "three-four" | "near-square" | "panoramic"
export type CatalogOrientation = "portrait" | "landscape" | "square"
export type QuoteFinishId = "stretched" | "black-frame" | "white-frame" | "natural-frame" | "gold-frame" | "silver-frame"

export type CatalogSizeOption = {
  id: string
  label: string
  widthCm: number
  heightCm: number
}

export type QuoteFinishOption = {
  id: QuoteFinishId
  label: string
  estimateKind: "stretched" | "framed"
}

const ROLLED_AREA_RATE_CNY = 0.48
export const MAX_DIRECT_ROLLED_SIDE_CM = 210

function round10(value: number) {
  return Math.round(value / 10) * 10
}

export function calculateRolledPriceCny(widthCm: number, heightCm: number) {
  if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm) || widthCm <= 0 || heightCm <= 0) return null
  return round10(widthCm * heightCm * ROLLED_AREA_RATE_CNY)
}

export function calculateFinishEstimateCny(finishId: QuoteFinishId, rolledPriceCny: number) {
  const stretched = round10(rolledPriceCny * 1.70)
  return finishId === "stretched" ? stretched : round10(stretched * 1.05)
}
```

Define all five approved size ladders verbatim from the design specification. `getCatalogSizes` swaps dimensions only for landscape orientation and rebuilds the ID and label from the final customer-facing width and height.

- [ ] **Step 4: Run the focused test**

Run: `npx tsx --test src/lib/storefront/catalog-config.test.ts`

Expected: PASS.

- [ ] **Step 5: Run all unit tests**

Run: `npm run test:unit`

Expected: PASS.

- [ ] **Step 6: Commit the catalog rules**

```powershell
git add src/lib/storefront/catalog-config.ts src/lib/storefront/catalog-config.test.ts
git commit -m "feat: add made-to-order catalog pricing rules"
```

## Task 3: Extend the Sanity Artwork Schema Safely

**Files:**
- Create: `src/sanity/schemas/artwork.test.ts`
- Modify: `src/sanity/schemas/artwork.ts`

**Interfaces:**
- Consumes: the existing `artwork` Sanity schema.
- Produces: `seriesSlug`, `seriesRank`, and `sizeProfile` fields; made-to-order defaults for newly created records; `Figurative` category support. Existing document values remain unchanged until the migration runs.

- [ ] **Step 1: Write the failing schema regression test**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import artworkSchema from "./artwork"

function field(name: string) {
  return artworkSchema.fields.find((item: any) => item.name === name) as any
}

test("new artwork records default to the made-to-order catalog", () => {
  assert.equal(field("collectionType").initialValue, "new_collection")
  assert.equal(field("productionModel").initialValue, "hand_painted_to_order")
})

test("supports series merchandising and explicit size profiles", () => {
  assert.equal(field("seriesSlug").type, "string")
  assert.equal(field("seriesRank").type, "number")
  assert.deepEqual(field("sizeProfile").options.list.map((item: any) => item.value), [
    "square",
    "two-three",
    "three-four",
    "near-square",
    "panoramic",
  ])
})

test("keeps figurative artwork as a real category", () => {
  assert.ok(field("category").options.list.includes("Figurative"))
})
```

- [ ] **Step 2: Run the schema test and verify it fails**

Run: `npx tsx --test src/sanity/schemas/artwork.test.ts`

Expected: FAIL on missing fields and old defaults.

- [ ] **Step 3: Add focused schema fields and defaults**

Add fields beside the current collection and catalog fields:

```ts
{
  name: "seriesSlug",
  title: "Primary storefront series",
  type: "string",
  description: "Stable merchandising series slug, for example ink-garden.",
},
{
  name: "seriesRank",
  title: "Series display rank",
  type: "number",
  validation: (Rule: any) => Rule.integer().min(1),
},
{
  name: "sizeProfile",
  title: "Made-to-order size profile",
  type: "string",
  options: {
    list: [
      { title: "Square", value: "square" },
      { title: "2:3", value: "two-three" },
      { title: "3:4", value: "three-four" },
      { title: "Near-square", value: "near-square" },
      { title: "Panoramic", value: "panoramic" },
    ],
  },
},
```

Change only the initial values for new documents. Do not remove `original` from the option list because old records and historical orders still require backward-compatible parsing.

- [ ] **Step 4: Run schema and full unit tests**

Run:

```powershell
npx tsx --test src/sanity/schemas/artwork.test.ts
npm run test:unit
```

Expected: PASS.

- [ ] **Step 5: Commit the schema extension**

```powershell
git add src/sanity/schemas/artwork.ts src/sanity/schemas/artwork.test.ts
git commit -m "feat: add catalog series schema fields"
```

## Task 4: Build the Pure Migration Planner

**Files:**
- Create: `src/lib/catalog-migration.test.ts`
- Create: `src/lib/catalog-migration.ts`

**Interfaces:**
- Consumes: `SourceArtwork`, `MigrationDecision`, and catalog functions from `src/lib/storefront/catalog-config.ts`.
- Produces: `parsePhysicalDimensions(value)`, `planArtworkMigration(source, decision)`, `PlannedArtworkMigration`, and `MigrationSkipReason`.

Define these public types exactly:

```ts
export type SourceArtwork = {
  _id: string
  slug?: { current?: string }
  dimensions?: string | null
  widthCm?: number | null
  heightCm?: number | null
  orientation?: string | null
  category?: string | null
  roomTypes?: string[] | null
  colorFamilies?: string[] | null
  styleTags?: string[] | null
  collectionType?: string | null
  productionModel?: string | null
  rightsStatus?: string | null
  migrationStatus?: string | null
  allowCheckout?: boolean | null
  shippingProfile?: string | null
  productMedia?: unknown[] | null
}

export type MigrationDecision = {
  artworkId: string
  expectedSlug: string
  sizeProfile: SizeProfileId
  physicalSize?: { widthCm: number; heightCm: number }
  category?: string
  roomTypes?: string[]
  colorFamilies?: string[]
  styleTags?: string[]
  rightsApproved: boolean
  contentReady: boolean
  enableRolledCheckout: boolean
  seriesSlug?: string
  seriesRank?: number
}

export type PlannedArtworkPatch = {
  productionModel: "hand_painted_to_order"
  collectionType?: "new_collection"
  rightsStatus?: "approved"
  migrationStatus?: "ready"
  allowCheckout: boolean
  widthCm: number
  heightCm: number
  orientation: "Portrait" | "Landscape" | "Square"
  sizeProfile: SizeProfileId
  standardSizes: Array<{
    _key: string
    _type: "standardSize"
    label: string
    widthCm: number
    heightCm: number
    priceCny: number
  }>
  frameOptions: Array<{
    _key: "rolled"
    _type: "frameOption"
    label: "Rolled canvas"
    priceDeltaCny: 0
  }>
  category?: string
  roomTypes?: string[]
  colorFamilies?: string[]
  styleTags?: string[]
  seriesSlug?: string
  seriesRank?: number
}
```

- [ ] **Step 1: Write failing dimension and planner tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { parsePhysicalDimensions, planArtworkMigration } from "./catalog-migration"

test("parses physical centimeters without reading image dimensions", () => {
  assert.deepEqual(parsePhysicalDimensions("80 x 120 cm"), { widthCm: 80, heightCm: 120 })
  assert.equal(parsePhysicalDimensions("1865 x 2785 pixels"), null)
})

test("plans made-to-order rolled options with deterministic keys", () => {
  const result = planArtworkMigration(
    {
      _id: "art-1",
      slug: { current: "green-rain-study" },
      dimensions: "80 x 120 cm",
      orientation: "Portrait",
      shippingProfile: "Ships rolled",
    },
    {
      artworkId: "art-1",
      expectedSlug: "green-rain-study",
      sizeProfile: "three-four",
      rightsApproved: true,
      contentReady: true,
      enableRolledCheckout: true,
    },
  )

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.equal(result.patch.productionModel, "hand_painted_to_order")
  assert.equal(result.patch.collectionType, "new_collection")
  assert.equal(result.patch.allowCheckout, true)
  assert.deepEqual(result.patch.frameOptions, [
    { _key: "rolled", _type: "frameOption", label: "Rolled canvas", priceDeltaCny: 0 },
  ])
  assert.ok(result.patch.standardSizes.every((size) => Math.max(size.widthCm, size.heightCm) <= 210))
  assert.ok(result.patch.standardSizes.every((size) => size._key === `rolled-${size.widthCm}x${size.heightCm}`))
})

test("keeps checkout disabled when commercial approval is absent", () => {
  const result = planArtworkMigration(
    { _id: "art-2", slug: { current: "mint-field" }, dimensions: "60 x 80 cm", shippingProfile: "Ships rolled" },
    {
      artworkId: "art-2",
      expectedSlug: "mint-field",
      sizeProfile: "three-four",
      rightsApproved: true,
      contentReady: true,
      enableRolledCheckout: false,
    },
  )
  assert.equal(result.status, "ready")
  if (result.status === "ready") assert.equal(result.patch.allowCheckout, false)
})

test("skips an ambiguous physical dimension and preserves source fields", () => {
  const result = planArtworkMigration(
    { _id: "art-3", slug: { current: "unknown" }, dimensions: "large" },
    {
      artworkId: "art-3",
      expectedSlug: "unknown",
      sizeProfile: "square",
      rightsApproved: false,
      contentReady: false,
      enableRolledCheckout: false,
    },
  )
  assert.deepEqual(result, { status: "skipped", artworkId: "art-3", reason: "missing_physical_dimensions" })
})
```

- [ ] **Step 2: Run the planner tests and verify they fail**

Run: `npx tsx --test src/lib/catalog-migration.test.ts`

Expected: FAIL because the planner module does not exist.

- [ ] **Step 3: Implement strict physical-dimension parsing**

Accept `cm` and the multiplication separators `x`, `X`, and `×`. Reject values that explicitly say `px`, `pixel`, or `pixels`, values without two positive numbers, and values without `cm`.

```ts
export function parsePhysicalDimensions(value: unknown) {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase()
  if (!normalized.includes("cm") || /\b(?:px|pixels?)\b/.test(normalized)) return null
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm\b/)
  if (!match) return null
  const widthCm = Number(match[1])
  const heightCm = Number(match[2])
  return widthCm > 0 && heightCm > 0 ? { widthCm, heightCm } : null
}
```

- [ ] **Step 4: Implement deterministic patch planning**

Rules:

```ts
const mayPublish = decision.rightsApproved && decision.contentReady
const mayCheckout = mayPublish
  && decision.enableRolledCheckout
  && source.shippingProfile === "Ships rolled"

const patch: PlannedArtworkPatch = {
  productionModel: "hand_painted_to_order",
  allowCheckout: Boolean(mayCheckout),
  widthCm,
  heightCm,
  orientation: normalizedOrientation,
  sizeProfile: decision.sizeProfile,
  standardSizes: directSizes.map((size) => ({
    _key: `rolled-${size.widthCm}x${size.heightCm}`,
    _type: "standardSize",
    label: size.label,
    widthCm: size.widthCm,
    heightCm: size.heightCm,
    priceCny: calculateRolledPriceCny(size.widthCm, size.heightCm)!,
  })),
  frameOptions: [{
    _key: "rolled",
    _type: "frameOption",
    label: "Rolled canvas",
    priceDeltaCny: 0,
  }],
}

if (mayPublish) patch.collectionType = "new_collection"
if (decision.rightsApproved) patch.rightsStatus = "approved"
if (decision.contentReady) patch.migrationStatus = "ready"
```

Only include optional category, room, color, style, and series fields when the reviewed decision supplies them. Map `Textured Art` to `Texture`. Never emit `undefined` properties or deletion operations.

- [ ] **Step 5: Add identity, orientation, and publication-gate tests**

Add tests that assert:

```ts
assert.equal(planArtworkMigration(source, { ...decision, expectedSlug: "wrong" }).status, "skipped")
const rightsBlocked = planArtworkMigration(source, { ...decision, rightsApproved: false })
assert.equal(rightsBlocked.status, "ready")
if (rightsBlocked.status === "ready") assert.equal(rightsBlocked.patch.collectionType, undefined)

const contentBlocked = planArtworkMigration(source, { ...decision, contentReady: false })
assert.equal(contentBlocked.status, "ready")
if (contentBlocked.status === "ready") assert.equal(contentBlocked.patch.migrationStatus, undefined)
```

Also assert that rerunning the planner with the same source and decision returns a deeply equal patch.

- [ ] **Step 6: Run focused and full tests**

Run:

```powershell
npx tsx --test src/lib/catalog-migration.test.ts
npm run test:unit
```

Expected: PASS.

- [ ] **Step 7: Commit the migration planner**

```powershell
git add src/lib/catalog-migration.ts src/lib/catalog-migration.test.ts
git commit -m "feat: plan safe artwork catalog migrations"
```

## Task 5: Add the Dry-Run-First Sanity Migration CLI

**Files:**
- Create: `src/lib/catalog-migration-io.test.ts`
- Create: `src/lib/catalog-migration-io.ts`
- Create: `scripts/migrate-made-to-order-catalog.mts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Sanity artwork documents, a decision JSON file, and `planArtworkMigration`.
- Produces: a JSON dry-run report, a timestamped full backup before apply, per-record Sanity patches, and a final result report.

CLI contract:

```text
npx tsx scripts/migrate-made-to-order-catalog.mts --inventory-only --report-dir=reports/catalog-migration
npx tsx scripts/migrate-made-to-order-catalog.mts --decisions=reports/catalog-migration/operator-decisions.json --report-dir=reports/catalog-migration
npx tsx scripts/migrate-made-to-order-catalog.mts --decisions=reports/catalog-migration/operator-decisions.json --report-dir=reports/catalog-migration --apply
```

- [ ] **Step 1: Write failing IO-helper tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { buildBackupFilename, parseCatalogMigrationArgs, summarizeMigrationPlans } from "./catalog-migration-io"

test("supports a read-only inventory without a decision file", () => {
  assert.deepEqual(parseCatalogMigrationArgs([
    "--inventory-only",
    "--report-dir=reports/catalog-migration",
  ]), {
    apply: false,
    inventoryOnly: true,
    reportDir: "reports/catalog-migration",
  })
})

test("requires explicit apply flag", () => {
  assert.equal(parseCatalogMigrationArgs([
    "--decisions=config/catalog-decisions.json",
    "--report-dir=reports/catalog-migration",
    "--apply",
  ]).apply, true)
})

test("creates timestamped backup names", () => {
  assert.equal(
    buildBackupFilename(new Date("2026-08-08T02:03:04.000Z")),
    "sanity-artworks-20260808-020304.json",
  )
})

test("summarizes ready and skipped records", () => {
  assert.deepEqual(summarizeMigrationPlans([
    { status: "ready", artworkId: "a", patch: {} },
    { status: "skipped", artworkId: "b", reason: "slug_mismatch" },
  ] as any), { total: 2, ready: 1, skipped: 1, reasons: { slug_mismatch: 1 } })
})
```

- [ ] **Step 2: Run the helper tests and verify they fail**

Run: `npx tsx --test src/lib/catalog-migration-io.test.ts`

Expected: FAIL because the IO module does not exist.

- [ ] **Step 3: Implement deterministic CLI helpers**

`parseCatalogMigrationArgs` must reject a missing `--report-dir`, unknown flags, empty values, `--apply` with `--inventory-only`, and a normal dry-run without `--decisions`. `buildBackupFilename` must use UTC. `summarizeMigrationPlans` must count every skip reason.

Add these generated paths to `.gitignore`:

```gitignore
reports/catalog-migration/
reports/catalog-migration-backups/
```

- [ ] **Step 4: Implement read-only orchestration first**

The script must:

1. Load `.env.local` without logging secrets.
2. Fetch all artwork documents with `useCdn: false`.
3. Read and validate a decision array, or use an empty decision array only when `--inventory-only` is present.
4. Require every decision `artworkId` to match exactly one source record.
5. Generate a plan for each source record; records without decisions receive `missing_review_decision`.
6. Write `dry-run.json` containing source count, decision count, summary, and per-record proposed patches.
7. Print counts and exit without mutation when `--apply` is absent.

Use a projection that includes the existing product fields but no order, customer, or review data:

```ts
const ARTWORK_QUERY = `*[_type == "artwork"] | order(_id asc){
  _id,
  _rev,
  title,
  slug,
  dimensions,
  widthCm,
  heightCm,
  orientation,
  category,
  roomTypes,
  colorFamilies,
  styleTags,
  collectionType,
  productionModel,
  rightsStatus,
  migrationStatus,
  allowCheckout,
  shippingProfile,
  sizeProfile,
  standardSizes,
  frameOptions,
  seriesSlug,
  seriesRank,
  productMedia
}`
```

- [ ] **Step 5: Implement the explicit apply path**

When `--apply` is present:

1. Abort unless the dry-run source count is exactly `63`.
2. Write every fetched source document to `reports/catalog-migration-backups/<timestamp>/sanity-artworks-<timestamp>.json` before constructing a mutation transaction.
3. Abort if the backup cannot be read back and parsed with 63 records.
4. Patch only `ready` records with non-empty patches.
5. Use `ifRevisionId(source._rev)` and verify the expected slug again immediately before the patch.
6. Commit records sequentially so a failure identifies one artwork without hiding prior results.
7. Write `apply-result.json` with applied IDs, skipped IDs, and errors.

Do not call `unset`, `delete`, `createOrReplace`, or `createIfNotExists`.

- [ ] **Step 6: Test helpers and TypeScript behavior**

Run:

```powershell
npx tsx --test src/lib/catalog-migration-io.test.ts
npm run test:unit
```

Expected: PASS.

- [ ] **Step 7: Run a production read-only inventory check**

Use inventory mode to exercise the reporting path without a decision file and without allowing any patch:

```powershell
npx tsx scripts/migrate-made-to-order-catalog.mts --inventory-only --report-dir="reports/catalog-migration"
```

Expected: `total: 63`, `ready: 0`, `skipped: 63`, with `missing_review_decision` for each record. No backup directory is created and Sanity is not mutated.

- [ ] **Step 8: Commit the migration CLI**

```powershell
git add .gitignore scripts/migrate-made-to-order-catalog.mts src/lib/catalog-migration-io.ts src/lib/catalog-migration-io.test.ts
git commit -m "feat: add dry-run catalog migration command"
```

## Task 6: Build Collection Matching and Visibility Rules

**Files:**
- Create: `src/lib/storefront/collection-catalog.test.ts`
- Create: `src/lib/storefront/collection-catalog.ts`
- Modify: `src/lib/collections.ts`

**Interfaces:**
- Consumes: `MarketingCollection`, minimal public artwork records, `PUBLIC_ARTWORK_GROQ_FILTER`, and Sanity `client`.
- Produces: `matchesMarketingCollection(artwork, collection)`, `visibleCollectionSlugs(counts, minimum)`, `filterCatalogLinks(links, state)`, `getCollectionArtworks(slug)`, and cached `getCatalogNavigationState()`.

Public state:

```ts
export type CatalogNavigationState = {
  visibleCollectionSlugs: string[]
  visibleCategories: string[]
}
```

- [ ] **Step 1: Write failing pure collection tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import {
  filterCatalogLinks,
  matchesMarketingCollection,
  visibleCollectionSlugs,
} from "./collection-catalog"

test("requires four public products for primary navigation", () => {
  assert.deepEqual(visibleCollectionSlugs(new Map([
    ["large-canvas-art", 4],
    ["textured-wall-art", 3],
    ["neutral-canvas-art", 0],
  ]), 4), ["large-canvas-art"])
})

test("matches category collections without inventing fallback products", () => {
  const collection = { slug: "textured-wall-art", categories: ["Texture", "Textured Art"] } as any
  assert.equal(matchesMarketingCollection({ category: "Texture" }, collection), true)
  assert.equal(matchesMarketingCollection({ category: "Abstract" }, collection), false)
})

test("matches large art from physical dimensions", () => {
  const collection = { slug: "large-canvas-art" } as any
  assert.equal(matchesMarketingCollection({ dimensions: "120 x 180 cm" }, collection), true)
  assert.equal(matchesMarketingCollection({ dimensions: "40 x 40 cm" }, collection), false)
})

test("filters only catalog links and keeps support links", () => {
  const links = [
    { href: "/collections/large-canvas-art", label: "Large Wall Art" },
    { href: "/collections/textured-wall-art", label: "Textured Wall Art" },
    { href: "/custom-painting", label: "Custom Painting" },
  ]
  assert.deepEqual(filterCatalogLinks(links, {
    visibleCollectionSlugs: ["large-canvas-art"],
    visibleCategories: [],
  }).map((link) => link.href), ["/collections/large-canvas-art", "/custom-painting"])
})
```

- [ ] **Step 2: Run the collection tests and verify they fail**

Run: `npx tsx --test src/lib/storefront/collection-catalog.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement collection matching without fallback substitution**

Rules:

```ts
export function matchesMarketingCollection(artwork: CollectionArtwork, collection: MarketingCollection) {
  if (collection.seriesSlug) return artwork.seriesSlug === collection.seriesSlug
  if (collection.categories?.length) return collection.categories.includes(normalizeCategory(artwork.category))
  if (collection.slug === "large-canvas-art") {
    const size = inferArtworkSize(artwork.dimensions)
    return size === "Large" || size === "Oversized"
  }
  return false
}
```

Add optional `seriesSlug?: string` to `MarketingCollection`. Do not return arbitrary products when a collection has zero matches.

- [ ] **Step 4: Implement one cached Sanity inventory read**

Fetch minimal fields for all publicly visible artworks once, then count in TypeScript with the same matcher used by collection pages:

```ts
const fetchPublicCollectionInventory = unstable_cache(
  async () => client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}]{
    _id,
    slug,
    category,
    dimensions,
    widthCm,
    heightCm,
    orientation,
    seriesSlug
  }`),
  ["public-collection-inventory-v1"],
  { revalidate: 600 },
)
```

`getCatalogNavigationState` returns slugs with count at least four plus categories with count at least four. On Sanity failure it returns empty catalog arrays, which hides optional collection links while retaining non-catalog navigation.

- [ ] **Step 5: Implement collection fetch reuse**

`getCollectionArtworks(slug)` must:

1. Resolve `getMarketingCollection(slug)`.
2. Fetch publicly visible matching records in deterministic order.
3. Apply `matchesMarketingCollection` for special size or series collections.
4. Return only real matches.
5. Return `[]` on an unknown slug or read failure.

- [ ] **Step 6: Run focused and full tests**

Run:

```powershell
npx tsx --test src/lib/storefront/collection-catalog.test.ts
npm run test:unit
```

Expected: PASS.

- [ ] **Step 7: Commit the collection catalog helper**

```powershell
git add src/lib/collections.ts src/lib/storefront/collection-catalog.ts src/lib/storefront/collection-catalog.test.ts
git commit -m "feat: add collection visibility rules"
```

## Task 7: Integrate Dynamic Collection Visibility Without Breaking Header or Footer Behavior

**Files:**
- Create: `src/components/HeaderClient.tsx`
- Create: `src/components/FooterClient.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/lib/storefront/editorial-presentation.ts`
- Modify: `src/lib/storefront/editorial-presentation.test.ts`
- Modify: `src/app/collections/[slug]/page.tsx`

**Interfaces:**
- Consumes: `CatalogNavigationState`, `filterCatalogLinks`, `getCatalogNavigationState`, and `getCollectionArtworks` from Task 6.
- Produces: server `Header` and `Footer` components with unchanged import paths; interactive `HeaderClient` and `FooterClient`; collection pages with filtered internal links and honest empty states.

- [ ] **Step 1: Add failing navigation-group regression tests**

Extend `editorial-presentation.test.ts`:

```ts
test("keeps the first four remaining links primary after empty collections are removed", () => {
  const groups = headerNavigationGroups([
    "Shop Art",
    "Custom Painting",
    "Size Guide",
    "Reviews",
    "Artists",
  ])
  assert.deepEqual(groups.primary, ["Shop Art", "Custom Painting", "Size Guide", "Reviews"])
  assert.deepEqual(groups.secondary, ["Artists"])
})
```

Run: `npx tsx --test src/lib/storefront/editorial-presentation.test.ts`

Expected: PASS with current grouping; this locks the behavior before component extraction.

- [ ] **Step 2: Extract client components without visual or interaction changes**

Move the current client implementations verbatim to `HeaderClient.tsx` and `FooterClient.tsx`, then add props:

```ts
type HeaderClientProps = {
  navigationState: CatalogNavigationState
}

type FooterClientProps = {
  navigationState: CatalogNavigationState
}
```

Filter `primaryNav` and footer shop links through `filterCatalogLinks` before rendering. Keep account menu, search dialog, mobile menu, language, currency, wishlist, cart, newsletter, WhatsApp, and session behavior unchanged.

- [ ] **Step 3: Replace current component files with async server wrappers**

```tsx
import HeaderClient from "@/components/HeaderClient"
import { getCatalogNavigationState } from "@/lib/storefront/collection-catalog"

export default async function Header() {
  const navigationState = await getCatalogNavigationState()
  return <HeaderClient navigationState={navigationState} />
}
```

Use the same shape for `Footer`. All existing pages continue importing `@/components/Header` and `@/components/Footer`.

- [ ] **Step 4: Reuse collection fetching and filter internal links**

In `src/app/collections/[slug]/page.tsx`:

- Remove the local `getCollectionArtworks` implementation.
- Import it from `collection-catalog`.
- Fetch `navigationState` beside the collection artwork list.
- Filter `internalCollectionLinks` with `filterCatalogLinks`.
- Remove the fallback that substitutes unrelated products into an empty large-art collection.
- Replace `Available works` with `Collection artworks`.
- Replace the empty text with `No reviewed artworks are available in this collection. Browse all artworks or request a custom painting.`
- Keep the H1, SEO copy, canonical URL, FAQ schema, and route available when the grid is empty.

- [ ] **Step 5: Run unit, copy, and build checks**

Run:

```powershell
npm run test:unit
npm run copy:check
npm run build
```

Expected: PASS.

- [ ] **Step 6: Verify desktop and mobile header behavior locally**

Start the app on an unused port:

```powershell
npm run dev -- --port 3011
```

Use the in-app browser to inspect `/`, `/artworks`, `/collections/large-canvas-art`, `/cart`, and `/checkout` at desktop and mobile widths. Verify search, mobile menu, account controls, wishlist count, cart count, footer links, and collection-link hiding. Do not submit payment.

- [ ] **Step 7: Commit navigation integration**

```powershell
git add -- src/components/Header.tsx src/components/HeaderClient.tsx src/components/Footer.tsx src/components/FooterClient.tsx "src/app/collections/[slug]/page.tsx" src/lib/storefront/editorial-presentation.ts src/lib/storefront/editorial-presentation.test.ts
git commit -m "feat: hide under-populated catalog links"
```

## Task 8: Generate and Review the 63-Artwork Migration Report

**Files:**
- Generated, not committed: `reports/catalog-migration/dry-run.json`
- Generated, not committed: an operator decision JSON outside the public application bundle

**Interfaces:**
- Consumes: the CLI from Task 5 and the 63 live Sanity artwork records.
- Produces: a reviewed decision for every artwork and an apply-ready dry-run with zero unexplained records.

- [ ] **Step 1: Export the current 63-record dry-run inventory**

Run the dry-run command with an empty decision array as in Task 5.

Expected: exactly 63 source records and 63 `missing_review_decision` skips.

- [ ] **Step 2: Build the operator decision file from source IDs and slugs**

Create one decision per source record using the exact `MigrationDecision` shape. Set these defaults for safety:

```json
{
  "rightsApproved": false,
  "contentReady": false,
  "enableRolledCheckout": false
}
```

Assign `sizeProfile` from reviewed physical proportions, not image pixels. Preserve existing non-empty tags. Map only reviewed `Textured Art` categories to `Texture`; keep `Figurative` unchanged. Do not assign Ink Garden in Release 1 because that belongs to Release 2.

- [ ] **Step 3: Run the complete reviewed dry-run**

Run:

```powershell
npx tsx scripts/migrate-made-to-order-catalog.mts --decisions="reports/catalog-migration/operator-decisions.json" --report-dir="reports/catalog-migration"
```

Expected:

- `total: 63`
- every source `_id` represented exactly once
- no slug mismatches
- no pixel-derived physical dimensions
- every skipped record has one explicit reason
- no Sanity mutation and no backup directory

- [ ] **Step 4: Stop for the production-data approval checkpoint**

Present `dry-run.json` with counts for ready, skipped, rights-approved, content-ready, checkout-enabled, category changes, and ambiguous dimensions. Do not run `--apply` until the user approves this exact report.

- [ ] **Step 5: Apply only the approved report**

After approval, run the identical command with `--apply`:

```powershell
npx tsx scripts/migrate-made-to-order-catalog.mts --decisions="reports/catalog-migration/operator-decisions.json" --report-dir="reports/catalog-migration" --apply
```

Expected: backup parse verification succeeds before the first patch; each applied record passes `_rev` and slug checks; no document is deleted.

- [ ] **Step 6: Verify production data after apply**

Run a read-only Sanity query and report:

```groq
{
  "total": count(*[_type == "artwork"]),
  "madeToOrder": count(*[_type == "artwork" && productionModel == "hand_painted_to_order"]),
  "newCollection": count(*[_type == "artwork" && collectionType == "new_collection"]),
  "checkoutEnabled": count(*[_type == "artwork" && allowCheckout == true]),
  "missingPhysicalSize": count(*[_type == "artwork" && (!defined(widthCm) || !defined(heightCm))])
}
```

Expected: `total` remains 63. Other counts must match the approved dry-run exactly.

## Task 9: Final Release 1 Verification and Preview Handoff

**Files:**
- No new files unless verification exposes a defect; fix defects in the owning task's files and rerun that task's tests.

**Interfaces:**
- Consumes: all Release 1 tasks.
- Produces: a passing mainline candidate and a preview ready for user inspection.

- [ ] **Step 1: Run all automated checks from a clean command session**

```powershell
npm test
npm run build
npm run lint
git diff --check
```

Expected: tests, copy check, build, and diff check pass. If `npm run lint` enters the removed Next.js lint setup path, record that exact result and do not alter lint tooling inside this release.

- [ ] **Step 2: Inspect the final Git diff**

Run:

```powershell
git status --short
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

Expected: only Release 1 files and the approved design/plan docs are present. Existing untracked audit reports remain untouched.

- [ ] **Step 3: Perform responsive storefront QA**

Inspect desktop and mobile versions of:

- `/`
- `/artworks`
- one populated collection
- one under-four or empty collection
- one made-to-order product
- `/custom-painting`
- `/shipping-returns`
- `/cart`
- `/checkout`

Verify no overlapping text, broken menus, empty navigation destinations, fake trust claims, changed URLs, or cart regressions. Do not complete a purchase.

- [ ] **Step 4: Create a preview deployment from the reviewed mainline branch**

Use the repository's existing Vercel connection. Do not promote to production. Record the preview commit hash and verify the preview source is the Release 1 branch rather than the divergent storefront branch.

- [ ] **Step 5: Request code review**

Use `superpowers:requesting-code-review` against the complete Release 1 diff. Resolve critical and important findings before handoff.

- [ ] **Step 6: Present the Release 1 preview and migration result**

Report:

- automated check results
- migration ready/applied/skipped counts
- backup path and checksum when apply occurred
- hidden collection links
- unchanged cart, checkout, and payment boundaries
- preview URL
- remaining operator inputs for Release 2 media work

Do not start Release 2 until Release 1 is accepted.
