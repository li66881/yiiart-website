# YiiArt Room-First Product Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved room-first YiiArt artwork detail experience with original prototype imagery and copy, real Sanity data, an accessible gallery, validated presentation choices, working cart and checkout behavior, and responsive visual fidelity.

**Architecture:** Keep `src/app/artwork/[slug]/page.tsx` as the server boundary for Sanity, reviews, SEO, currency, and availability. Move normalization and the new user-facing experience into a focused `src/features/artwork-detail/` module; client state is limited to gallery selection, presentation selection, and cart feedback. Price and availability remain server-authoritative, and preview content is development-only.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Tailwind CSS 3.4, Sanity 5, Vitest, Testing Library, Stripe, PayPal, built-in ImageGen, Codex Browser.

## Global Constraints

- Preserve YiiArt colors exactly: paper `#fbfaf6`, ink `#181613`, muted text `#6f675d`, divider `#ded8ce`.
- Keep the existing YiiArt header, currency/language controls, SEO metadata, JSON-LD, review system, WhatsApp links, related artwork, and checkout providers.
- Do not add Shopify, discounts, countdowns, coupons, first-order popups, dynamically priced size variants, new payment providers, or new routes.
- Do not copy NukeArt artwork, copy, logos, promotion graphics, urgency patterns, or review claims.
- Generated room scenes must be identified as visualizations and may not replace the full artwork and texture-proof images.
- Price and availability must always be re-fetched from Sanity during checkout.
- `presentationOptions` are optional, same-price options only; products without them keep the current framing-note path.
- Preview data is available only in development through `?productPreview=quiet-meridian`; production ignores the parameter and cannot submit preview checkout.
- Desktop visual target: `1440 x 1024`; mobile visual target: `390 x 844`.
- Use TDD for pure logic and interactive components, frequent focused commits, and no unrelated refactors.

---

## Planned File Structure

### Create

- `vitest.config.ts` — Vitest alias, DOM environment, and setup configuration.
- `src/test/setup.ts` — Testing Library DOM matchers and cleanup.
- `src/features/artwork-detail/model.ts` — gallery, preview, and presentation types plus pure normalizers.
- `src/features/artwork-detail/model.test.ts` — pure model tests.
- `src/features/artwork-detail/preview.ts` — development-only `Quiet Meridian` prototype fixture.
- `src/features/artwork-detail/preview.test.ts` — preview gating and content tests.
- `src/features/artwork-detail/ArtworkHeroGallery.tsx` — interactive accessible gallery.
- `src/features/artwork-detail/ArtworkHeroGallery.test.tsx` — gallery behavior tests.
- `src/features/artwork-detail/ArtworkMaterialStory.tsx` — two-image material proof strip.
- `src/features/artwork-detail/ArtworkMaterialStory.test.tsx` — collapse and rendering tests.
- `src/features/artwork-detail/ArtworkPurchaseExperience.tsx` — presentation state, desktop purchase panel, and synchronized mobile actions.
- `src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx` — selection and purchase behavior tests.
- `src/features/artwork-detail/ArtworkSupportingSections.tsx` — existing details, size, customization, process, packaging, related works, and review composition.
- `src/sanity/schemas/artworkGalleryAsset.ts` — role-aware gallery asset schema.
- `src/context/CartContext.test.ts` — persisted cart-item presentation validation tests.
- `src/lib/checkout.test.ts` — checkout presentation validation tests.
- `public/prototypes/quiet-meridian/room.png` — generated room visualization.
- `public/prototypes/quiet-meridian/artwork.png` — generated full artwork view.
- `public/prototypes/quiet-meridian/texture.png` — generated texture detail.
- `public/prototypes/quiet-meridian/edge.png` — generated presentation detail.

### Modify

- `package.json`, `package-lock.json` — test scripts and dev dependencies.
- `src/sanity/schemas/index.ts` — register `artworkGalleryAsset`.
- `src/sanity/schemas/artwork.ts` — optional `galleryAssets` and `presentationOptions` fields.
- `src/lib/artwork-images.ts` — resolve role-aware gallery assets with legacy fallback.
- `src/app/artwork/[slug]/page.tsx` — server data orchestration and new composition.
- `src/context/CartContext.tsx` — optional `presentationOption` persistence and validation.
- `src/components/AddToCartButton.tsx` — accept and store selected presentation.
- `src/app/cart/page.tsx` — display presentation choice.
- `src/app/checkout/page.tsx` — submit and display presentation choice.
- `src/lib/checkout.ts` — validate requested choice against Sanity.
- `messages/en.json`, `messages/zh.json`, `messages/de.json`, `messages/fr.json`, `messages/ar.json` — new gallery, presentation, material-story, and trust labels.

---

### Task 1: Add the Test Harness and Product Detail Model

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/features/artwork-detail/model.ts`
- Create: `src/features/artwork-detail/model.test.ts`

**Interfaces:**
- Produces: `GalleryRole`, `ArtworkGalleryItem`, `PresentationOption`, `buildGalleryItems()`, `normalizePresentationOptions()`, `validatePresentationOption()`.
- Consumes: no feature-local dependencies.

- [ ] **Step 1: Install the test dependencies and add scripts**

Run:

```powershell
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest"
```

Expected: `package.json` contains `test` and `test:watch`; `package-lock.json` records the four dev dependencies.

- [ ] **Step 2: Create the Vitest configuration and setup**

Create `vitest.config.ts`:

```ts
import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true,
  },
})
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => cleanup())
```

- [ ] **Step 3: Write the failing model tests**

Create `src/features/artwork-detail/model.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  buildGalleryItems,
  normalizePresentationOptions,
  validatePresentationOption,
} from "./model"

describe("buildGalleryItems", () => {
  it("keeps explicit roles and removes duplicate URLs", () => {
    expect(buildGalleryItems({
      title: "Quiet Meridian",
      explicit: [
        { url: "/room.webp", role: "room", alt: "Room visualization" },
        { url: "/artwork.webp", role: "artwork", alt: "Full artwork" },
        { url: "/room.webp", role: "texture", alt: "Duplicate" },
        { url: "/invalid-role.webp", role: "promotion" as never, alt: "Invalid role" },
      ],
      fallbackUrls: ["/legacy.webp"],
    })).toEqual([
      { url: "/room.webp", role: "room", alt: "Room visualization", isVisualization: true },
      { url: "/artwork.webp", role: "artwork", alt: "Full artwork", isVisualization: false },
      { url: "/invalid-role.webp", role: "artwork", alt: "Invalid role", isVisualization: false },
    ])
  })

  it("uses legacy images when explicit gallery data is empty", () => {
    expect(buildGalleryItems({
      title: "Afternoon",
      explicit: [],
      fallbackUrls: ["/one.jpg", "/two.jpg"],
    })).toEqual([
      { url: "/one.jpg", role: "artwork", alt: "Afternoon, full artwork view", isVisualization: false },
      { url: "/two.jpg", role: "texture", alt: "Afternoon, detail view 2", isVisualization: false },
    ])
  })
})

describe("presentation options", () => {
  it("trims, removes blanks, and deduplicates case-insensitively", () => {
    expect(normalizePresentationOptions([" Rolled Canvas ", "", "rolled canvas", "Stretched"]))
      .toEqual([{ label: "Rolled Canvas" }, { label: "Stretched" }])
  })

  it("accepts only a configured option", () => {
    const options = [{ label: "Rolled Canvas" }, { label: "Stretched" }]
    expect(validatePresentationOption("Stretched", options)).toBe("Stretched")
    expect(validatePresentationOption("Gold Frame", options)).toBeUndefined()
  })
})
```

- [ ] **Step 4: Run the model test and verify the expected failure**

Run:

```powershell
npm test -- src/features/artwork-detail/model.test.ts
```

Expected: FAIL because `./model` does not exist.

- [ ] **Step 5: Implement the pure product detail model**

Create `src/features/artwork-detail/model.ts`:

```ts
export type GalleryRole = "room" | "artwork" | "texture" | "edge"

export type ArtworkGalleryItem = {
  url: string
  role: GalleryRole
  alt: string
  isVisualization: boolean
}

export type PresentationOption = {
  label: string
}

type GalleryInput = {
  title: string
  explicit?: Array<{
    url?: string | null
    role?: unknown
    alt?: string | null
  }>
  fallbackUrls?: string[]
}

export function buildGalleryItems({ title, explicit = [], fallbackUrls = [] }: GalleryInput) {
  const seen = new Set<string>()
  const explicitItems = explicit.flatMap((item): ArtworkGalleryItem[] => {
    const url = item.url?.trim()
    if (!url || seen.has(url)) return []
    seen.add(url)
    const role = normalizeGalleryRole(item.role)
    return [{
      url,
      role,
      alt: item.alt?.trim() || defaultAlt(title, role, 1),
      isVisualization: role === "room",
    }]
  })

  if (explicitItems.length > 0) return explicitItems

  return fallbackUrls.flatMap((url, index): ArtworkGalleryItem[] => {
    if (!url || seen.has(url)) return []
    seen.add(url)
    const role: GalleryRole = index === 0 ? "artwork" : "texture"
    return [{
      url,
      role,
      alt: defaultAlt(title, role, index + 1),
      isVisualization: false,
    }]
  })
}

export function normalizePresentationOptions(input: unknown): PresentationOption[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  return input.flatMap((value): PresentationOption[] => {
    const label = typeof value === "string" ? value.trim() : ""
    const key = label.toLocaleLowerCase()
    if (!label || seen.has(key)) return []
    seen.add(key)
    return [{ label }]
  })
}

export function validatePresentationOption(
  requested: unknown,
  options: PresentationOption[],
) {
  if (typeof requested !== "string" || !requested.trim()) return undefined
  const match = options.find((option) => option.label === requested.trim())
  return match?.label
}

function defaultAlt(title: string, role: GalleryRole, index: number) {
  if (role === "room") return `${title}, room visualization showing artwork scale`
  if (role === "artwork") return `${title}, full artwork view`
  if (role === "edge") return `${title}, canvas edge and presentation detail`
  return `${title}, detail view ${index}`
}

function normalizeGalleryRole(value: unknown): GalleryRole {
  return value === "room" || value === "artwork" || value === "texture" || value === "edge"
    ? value
    : "artwork"
}
```

- [ ] **Step 6: Run the model tests and the existing copy check**

Run:

```powershell
npm test -- src/features/artwork-detail/model.test.ts
npm run copy:check
```

Expected: model test PASS; copy check exits `0`.

- [ ] **Step 7: Commit the test foundation**

```powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/features/artwork-detail/model.ts src/features/artwork-detail/model.test.ts
git commit -m "test: add artwork detail model coverage"
```

---

### Task 2: Add Role-Aware Gallery Data and Sanity Fields

**Files:**
- Create: `src/sanity/schemas/artworkGalleryAsset.ts`
- Create: `src/lib/artwork-images.test.ts`
- Modify: `src/sanity/schemas/index.ts`
- Modify: `src/sanity/schemas/artwork.ts`
- Modify: `src/lib/artwork-images.ts`
- Modify: `src/app/artwork/[slug]/page.tsx:65-95`

**Interfaces:**
- Consumes: `ArtworkGalleryItem`, `buildGalleryItems()` from Task 1.
- Produces: `getArtworkGalleryItems(artwork, options, title): ArtworkGalleryItem[]`; Sanity fields `galleryAssets` and `presentationOptions`.

- [ ] **Step 1: Write the failing artwork image resolver test**

Create `src/lib/artwork-images.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { getArtworkGalleryItems } from "./artwork-images"

describe("getArtworkGalleryItems", () => {
  it("prefers explicit URL assets with roles", () => {
    expect(getArtworkGalleryItems({
      galleryAssets: [
        { role: "room", url: "https://assets.yiiart.com/room.webp", alt: "Room visualization" },
        { role: "artwork", url: "https://assets.yiiart.com/artwork.webp", alt: "Full artwork" },
      ],
      cloudflareImages: [{ url: "https://assets.yiiart.com/legacy.webp" }],
    }, {}, "Quiet Meridian")).toEqual([
      {
        url: "https://assets.yiiart.com/room.webp",
        role: "room",
        alt: "Room visualization",
        isVisualization: true,
      },
      {
        url: "https://assets.yiiart.com/artwork.webp",
        role: "artwork",
        alt: "Full artwork",
        isVisualization: false,
      },
    ])
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npm test -- src/lib/artwork-images.test.ts
```

Expected: FAIL because `getArtworkGalleryItems` is not exported.

- [ ] **Step 3: Add the Sanity gallery asset schema**

Create `src/sanity/schemas/artworkGalleryAsset.ts`:

```ts
export default {
  name: "artworkGalleryAsset",
  title: "Artwork gallery asset",
  type: "object",
  fields: [
    {
      name: "role",
      title: "Role",
      type: "string",
      validation: (Rule: any) => Rule.required(),
      options: {
        list: [
          { title: "Room visualization", value: "room" },
          { title: "Full artwork", value: "artwork" },
          { title: "Texture detail", value: "texture" },
          { title: "Edge or presentation detail", value: "edge" },
        ],
      },
    },
    { name: "alt", title: "Alt text", type: "string" },
    { name: "image", title: "Sanity image", type: "image", options: { hotspot: true } },
    { name: "url", title: "R2 or public URL", type: "url" },
  ],
}
```

Register it in `src/sanity/schemas/index.ts`, and add these fields to `src/sanity/schemas/artwork.ts`:

```ts
{
  name: "galleryAssets",
  title: "Role-aware product gallery",
  type: "array",
  of: [{ type: "artworkGalleryAsset" }],
},
{
  name: "presentationOptions",
  title: "Same-price presentation options",
  type: "array",
  of: [{ type: "string" }],
  description: "Only list options already included in the base price.",
},
```

- [ ] **Step 4: Implement the role-aware resolver**

Add to `src/lib/artwork-images.ts`:

```ts
import { buildGalleryItems, type GalleryRole } from "@/features/artwork-detail/model"

export function getArtworkGalleryItems(
  artwork: any,
  options: ImageUrlOptions = {},
  title = "Artwork",
) {
  const explicit = Array.isArray(artwork?.galleryAssets)
    ? artwork.galleryAssets.map((asset: any) => ({
        url: resolveGalleryAssetUrl(asset, options),
        role: asset?.role as GalleryRole | undefined,
        alt: asset?.alt,
      }))
    : []

  return buildGalleryItems({
    title,
    explicit,
    fallbackUrls: getArtworkImageUrls(artwork, options),
  })
}

function resolveGalleryAssetUrl(asset: any, options: ImageUrlOptions) {
  if (typeof asset?.url === "string" && asset.url.trim()) return asset.url.trim()
  if (!asset?.image) return ""
  let builder = urlFor(asset.image)
  if (options.width) builder = builder.width(options.width)
  if (options.height) builder = builder.height(options.height)
  return builder.url()
}
```

Update the artwork GROQ projection to include:

```groq
galleryAssets[]{role, alt, url, image},
presentationOptions,
```

- [ ] **Step 5: Run the resolver tests and TypeScript build**

Run:

```powershell
npm test -- src/features/artwork-detail/model.test.ts src/lib/artwork-images.test.ts
npm run build
```

Expected: tests PASS; Next.js build exits `0`.

- [ ] **Step 6: Commit the Sanity and gallery model**

```powershell
git add src/sanity/schemas/artworkGalleryAsset.ts src/sanity/schemas/index.ts src/sanity/schemas/artwork.ts src/lib/artwork-images.ts src/lib/artwork-images.test.ts src/app/artwork/[slug]/page.tsx
git commit -m "feat: add role-aware artwork galleries"
```

---

### Task 3: Validate Presentation Choices Through Cart and Checkout

**Files:**
- Create: `src/context/CartContext.test.ts`
- Create: `src/lib/checkout.test.ts`
- Modify: `src/context/CartContext.tsx`
- Modify: `src/components/AddToCartButton.tsx`
- Modify: `src/app/cart/page.tsx`
- Modify: `src/app/checkout/page.tsx`
- Modify: `src/lib/checkout.ts`

**Interfaces:**
- Consumes: `normalizePresentationOptions()` and `validatePresentationOption()` from Task 1.
- Produces: `CartItem.presentationOption?: string`; checkout input `{ id, quantity, presentationOption? }`; server-authoritative validated line-item title.

- [ ] **Step 1: Write failing checkout normalization tests**

Create `src/context/CartContext.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { isValidCartItem } from "./CartContext"

describe("isValidCartItem", () => {
  const baseItem = {
    id: "artwork-1",
    title: "Quiet Meridian",
    artist: "Huang Liang",
    price: 10900,
    image: "/artwork.png",
    quantity: 1,
  }

  it("accepts an optional string presentation option", () => {
    expect(isValidCartItem({ ...baseItem, presentationOption: "Stretched" })).toBe(true)
  })

  it("rejects a non-string presentation option", () => {
    expect(isValidCartItem({ ...baseItem, presentationOption: { label: "Stretched" } })).toBe(false)
  })
})
```

Create `src/lib/checkout.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { normalizeCheckoutItems, resolveCheckoutPresentation } from "./checkout"

describe("normalizeCheckoutItems", () => {
  it("preserves a trimmed presentation option", () => {
    expect(normalizeCheckoutItems([
      { id: "artwork-1", quantity: 1, presentationOption: " Natural Oak Float Frame " },
    ])).toEqual([
      { id: "artwork-1", quantity: 1, presentationOption: "Natural Oak Float Frame" },
    ])
  })
})

describe("resolveCheckoutPresentation", () => {
  it("returns configured same-price choices", () => {
    expect(resolveCheckoutPresentation("Stretched", ["Rolled Canvas", "Stretched"]))
      .toBe("Stretched")
  })

  it("rejects choices not configured in Sanity", () => {
    expect(() => resolveCheckoutPresentation("Gold Frame", ["Rolled Canvas", "Stretched"]))
      .toThrow("Selected presentation option is not available.")
  })

  it("requires a choice when Sanity configures presentation options", () => {
    expect(() => resolveCheckoutPresentation(undefined, ["Rolled Canvas", "Stretched"]))
      .toThrow("Select a presentation option before checkout.")
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npm test -- src/context/CartContext.test.ts src/lib/checkout.test.ts
```

Expected: FAIL because `isValidCartItem`, `normalizeCheckoutItems`, and `resolveCheckoutPresentation` are not exported.

- [ ] **Step 3: Extend the cart item safely**

Add to `CartItem` in `src/context/CartContext.tsx`:

```ts
presentationOption?: string
```

Export `isValidCartItem()` and extend it with:

```ts
&& (value.presentationOption === undefined || typeof value.presentationOption === "string")
```

Extend the `AddToCartButton` item type with the same optional field. In cart and checkout item summaries, render this only when present:

```tsx
{item.presentationOption && (
  <p className="text-sm text-stone-500">{item.presentationOption}</p>
)}
```

Include it in the checkout request:

```ts
items: items.map((item) => ({
  id: item.id,
  quantity: item.quantity,
  presentationOption: item.presentationOption,
})),
```

- [ ] **Step 4: Implement server validation**

In `src/lib/checkout.ts`, extend the public and internal types exactly:

```ts
export type CheckoutLineItem = {
  id: string
  title: string
  artistName?: string
  image?: string
  price: number
  quantity: number
  presentationOption?: string
}

type CheckoutItemInput = {
  id: string
  quantity: number
  presentationOption?: string
}

type ArtworkForCheckout = {
  _id: string
  title?: { zh?: string; en?: string }
  artist?: { name?: { zh?: string; en?: string } }
  price?: number
  availability?: "available" | "reserved" | "sold"
  allowCheckout?: boolean
  reservedUntil?: string
  presentationOptions?: string[]
  cloudflareImages?: unknown[]
  images?: unknown[]
}
```

Add `presentationOptions` to the Sanity checkout projection, export `normalizeCheckoutItems`, trim `presentationOption` during normalization, and add:

```ts
export function resolveCheckoutPresentation(requested: unknown, configured: unknown) {
  const allowed = normalizePresentationOptions(configured)
  if (allowed.length === 0) return undefined
  const requestedLabel = typeof requested === "string" ? requested.trim() : ""
  if (!requestedLabel) {
    throw new CheckoutValidationError("Select a presentation option before checkout.")
  }
  const selected = validatePresentationOption(requestedLabel, allowed)
  if (!selected) {
    throw new CheckoutValidationError("Selected presentation option is not available.")
  }
  return selected
}
```

For each re-fetched Sanity artwork, resolve the requested option and make the persisted/provider title explicit:

```ts
const presentationOption = resolveCheckoutPresentation(
  item.presentationOption,
  artwork.presentationOptions,
)
const baseTitle = pickEnglish(artwork.title, "YiiArt artwork")

return {
  id: item.id,
  title: presentationOption ? `${baseTitle} - ${presentationOption}` : baseTitle,
  artistName: pickEnglish(artwork.artist?.name, ""),
  image: getArtworkImageUrl(artwork, { width: 1000 }),
  price,
  quantity: item.quantity,
  presentationOption,
}
```

- [ ] **Step 5: Run the checkout and model tests**

Run:

```powershell
npm test -- src/context/CartContext.test.ts src/lib/checkout.test.ts src/features/artwork-detail/model.test.ts
```

Expected: all tests PASS.

- [ ] **Step 6: Run the production build**

Run:

```powershell
npm run build
```

Expected: Next.js build exits `0`; checkout routes compile.

- [ ] **Step 7: Commit the validated cart path**

```powershell
git add src/context/CartContext.tsx src/context/CartContext.test.ts src/components/AddToCartButton.tsx src/app/cart/page.tsx src/app/checkout/page.tsx src/lib/checkout.ts src/lib/checkout.test.ts
git commit -m "feat: validate artwork presentation choices"
```

---

### Task 4: Generate the Quiet Meridian Asset Set and Preview Fixture

**Required sub-skill:** `imagegen` for all four raster assets. Use the built-in image generation path, not CLI fallback.

**Files:**
- Create: `public/prototypes/quiet-meridian/room.png`
- Create: `public/prototypes/quiet-meridian/artwork.png`
- Create: `public/prototypes/quiet-meridian/texture.png`
- Create: `public/prototypes/quiet-meridian/edge.png`
- Create: `src/features/artwork-detail/preview.ts`
- Create: `src/features/artwork-detail/preview.test.ts`

**Interfaces:**
- Consumes: `ArtworkGalleryItem`, `PresentationOption` from Task 1.
- Produces: `getArtworkDetailPreview(previewKey, isProduction)` and four project-bound image assets.

- [ ] **Step 1: Write the failing preview gate test**

Create `src/features/artwork-detail/preview.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { getArtworkDetailPreview } from "./preview"

describe("getArtworkDetailPreview", () => {
  it("returns Quiet Meridian only outside production", () => {
    expect(getArtworkDetailPreview("quiet-meridian", false)?.title).toBe("Quiet Meridian")
    expect(getArtworkDetailPreview("quiet-meridian", true)).toBeUndefined()
  })

  it("provides all four required gallery roles", () => {
    expect(getArtworkDetailPreview("quiet-meridian", false)?.gallery.map((item) => item.role))
      .toEqual(["room", "artwork", "texture", "edge"])
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npm test -- src/features/artwork-detail/preview.test.ts
```

Expected: FAIL because `preview.ts` does not exist.

- [ ] **Step 3: Generate four independent project assets with built-in ImageGen**

Use the approved mockup `docs/superpowers/specs/assets/yiiart-room-first-product-detail.png` as the visual reference. Issue one built-in ImageGen call per asset. Preserve the same invented artwork across all four outputs.

Room prompt:

```text
Use case: product-mockup
Asset type: YiiArt product gallery room visualization, 3:2 landscape
Primary request: a calm collector living room with the original horizontal artwork Quiet Meridian above a low oatmeal linen sofa
Subject: the same pale mineral-plaster painting with subtle charcoal marks, weathered sand texture, and one off-center burnished-gold arc
Lighting/mood: warm north-window daylight, understated luxury, natural stone and linen
Composition: straight architectural view, artwork centered above sofa, enough wall and furniture context to judge scale
Constraints: room visualization, no people, no text, no logo, no watermark, no copied artwork, no gold tree
```

Full-artwork prompt:

```text
Use case: product-mockup
Asset type: YiiArt full artwork catalog image, 7:5 landscape
Primary request: straight-on color-accurate studio photograph of Quiet Meridian
Subject: pale mineral plaster, subtle charcoal marks, weathered sand texture, off-center burnished-gold arc, visible canvas edges
Lighting/mood: even neutral daylight, faithful surface and color
Composition: entire canvas visible with generous neutral margin
Constraints: no room furniture, no frame unless edge treatment is part of the canvas, no text, no logo, no watermark
```

Texture prompt:

```text
Use case: product-mockup
Asset type: YiiArt macro texture detail, 4:3 landscape
Primary request: close-up of the same Quiet Meridian painting showing raised plaster ridges, mineral pigment, palette-knife marks, and restrained gold material
Lighting/mood: raking side light that proves real surface depth
Composition: tactile macro crop with recognizable charcoal and gold transition
Constraints: no text, no logo, no watermark, no invented objects
```

Edge prompt:

```text
Use case: product-mockup
Asset type: YiiArt canvas presentation detail, 4:3 landscape
Primary request: close three-quarter view of the same Quiet Meridian canvas showing wrapped painted edge and natural-oak float-frame spacing
Lighting/mood: soft studio daylight, accurate joinery and canvas texture
Composition: corner and edge fill most of the frame
Constraints: no text, no logo, no watermark, physically plausible frame construction
```

Copy each selected generated file into the four exact workspace paths listed above; leave the generated originals in place.

- [ ] **Step 4: Inspect every asset directly**

Use `view_image` on all four files. Confirm the artwork identity is consistent, the room scene is a visualization, texture is visible, no text/logo/watermark appears, and no output copies the NukeArt golden-tree composition.

- [ ] **Step 5: Implement the development-only preview fixture**

Create `src/features/artwork-detail/preview.ts`:

```ts
import type { ArtworkGalleryItem, PresentationOption } from "./model"

export type ArtworkDetailPreview = {
  title: string
  artistName: string
  category: string
  medium: string
  description: string
  dimensions: string
  displayPrice: string
  gallery: ArtworkGalleryItem[]
  presentationOptions: PresentationOption[]
}

const quietMeridian: ArtworkDetailPreview = {
  title: "Quiet Meridian",
  artistName: "Huang Liang",
  category: "Textured Art",
  medium: "Mixed Media on Canvas",
  description: "Built in thin layers of plaster, ash gray, and muted gold, this original painting brings a measured focal point to calm interiors.",
  dimensions: "90 x 140 cm / 35.4 x 55.1 in",
  displayPrice: "$1,520 USD",
  presentationOptions: [
    { label: "Rolled Canvas" },
    { label: "Stretched" },
    { label: "Natural Oak Float Frame" },
  ],
  gallery: [
    { url: "/prototypes/quiet-meridian/room.png", role: "room", alt: "Quiet Meridian room visualization showing artwork scale", isVisualization: true },
    { url: "/prototypes/quiet-meridian/artwork.png", role: "artwork", alt: "Quiet Meridian, full artwork view", isVisualization: false },
    { url: "/prototypes/quiet-meridian/texture.png", role: "texture", alt: "Quiet Meridian, raised plaster and mineral-gold texture detail", isVisualization: false },
    { url: "/prototypes/quiet-meridian/edge.png", role: "edge", alt: "Quiet Meridian, canvas edge and natural-oak float-frame detail", isVisualization: false },
  ],
}

export function getArtworkDetailPreview(previewKey: string | undefined, isProduction: boolean) {
  if (isProduction || previewKey !== "quiet-meridian") return undefined
  return quietMeridian
}
```

- [ ] **Step 6: Run preview tests and copy check**

Run:

```powershell
npm test -- src/features/artwork-detail/preview.test.ts
npm run copy:check
```

Expected: tests PASS; copy check exits `0`.

- [ ] **Step 7: Commit the reviewed prototype content**

```powershell
git add public/prototypes/quiet-meridian src/features/artwork-detail/preview.ts src/features/artwork-detail/preview.test.ts
git commit -m "feat: add Quiet Meridian prototype content"
```

---

### Task 5: Build the Accessible Gallery and Material Story

**Files:**
- Create: `src/features/artwork-detail/ArtworkHeroGallery.tsx`
- Create: `src/features/artwork-detail/ArtworkHeroGallery.test.tsx`
- Create: `src/features/artwork-detail/ArtworkMaterialStory.tsx`
- Create: `src/features/artwork-detail/ArtworkMaterialStory.test.tsx`

**Interfaces:**
- Consumes: `ArtworkGalleryItem[]` from Tasks 1 and 2.
- Produces: `<ArtworkHeroGallery items />` and `<ArtworkMaterialStory items heading />`.

- [ ] **Step 1: Write failing gallery interaction tests**

Create `src/features/artwork-detail/ArtworkHeroGallery.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArtworkHeroGallery from "./ArtworkHeroGallery"

const items = [
  { url: "/room.webp", role: "room" as const, alt: "Room visualization", isVisualization: true },
  { url: "/artwork.webp", role: "artwork" as const, alt: "Full artwork", isVisualization: false },
]

describe("ArtworkHeroGallery", () => {
  it("starts with the room visualization even when it is not the first asset", () => {
    render(<ArtworkHeroGallery items={[
      { url: "/artwork.webp", role: "artwork", alt: "Full artwork", isVisualization: false },
      { url: "/room.webp", role: "room", alt: "Room visualization", isVisualization: true },
    ]} />)
    expect(screen.getByRole("img", { name: "Room visualization" })).toBeInTheDocument()
  })

  it("switches the main image and exposes selected state", () => {
    render(<ArtworkHeroGallery items={items} />)
    expect(screen.getByRole("img", { name: "Room visualization" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Show Full artwork" }))
    expect(screen.getByRole("img", { name: "Full artwork" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Show Full artwork" })).toHaveAttribute("aria-pressed", "true")
  })

  it("supports arrow-key navigation between thumbnails", () => {
    render(<ArtworkHeroGallery items={items} />)
    const roomButton = screen.getByRole("button", { name: "Show Room visualization" })
    roomButton.focus()
    fireEvent.keyDown(roomButton, { key: "ArrowRight" })
    expect(screen.getByRole("button", { name: "Show Full artwork" })).toHaveFocus()
    expect(screen.getByRole("button", { name: "Show Full artwork" })).toHaveAttribute("aria-pressed", "true")
  })

  it("hides thumbnail controls for a single image", () => {
    render(<ArtworkHeroGallery items={[items[0]]} />)
    expect(screen.queryByRole("button", { name: "Show Room visualization" })).not.toBeInTheDocument()
  })

  it("renders nothing when no images exist", () => {
    const { container } = render(<ArtworkHeroGallery items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

Create `src/features/artwork-detail/ArtworkMaterialStory.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArtworkMaterialStory from "./ArtworkMaterialStory"

describe("ArtworkMaterialStory", () => {
  it("renders two detail images", () => {
    render(<ArtworkMaterialStory
      heading="Made by hand, understood in the room."
      items={[
        { url: "/texture.webp", role: "texture", alt: "Texture", isVisualization: false },
        { url: "/edge.webp", role: "edge", alt: "Edge", isVisualization: false },
      ]}
    />)
    expect(screen.getByText("Made by hand, understood in the room.")).toBeInTheDocument()
    expect(screen.getAllByRole("img")).toHaveLength(2)
  })

  it("collapses when fewer than two detail images exist", () => {
    const { container } = render(<ArtworkMaterialStory heading="Material" items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```powershell
npm test -- src/features/artwork-detail/ArtworkHeroGallery.test.tsx src/features/artwork-detail/ArtworkMaterialStory.test.tsx
```

Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement `ArtworkHeroGallery`**

Use a client component. Initialize selection to the first `room` item when one exists, otherwise index `0`. Render the selected image in an `aspect-[4/3]` desktop container with `object-cover` only for `room`; use `object-contain` for original artwork and detail proof. Render thumbnails only when more than one image exists. Thumbnails are buttons with `aria-pressed`, visible focus, and the label `Show ${item.alt}`. Support `ArrowLeft`, `ArrowRight`, `Home`, and `End`, moving both focus and selection with button refs. Add a visible `Room visualization` label only when `isVisualization` is true.

The component export must be:

```tsx
export default function ArtworkHeroGallery({ items }: { items: ArtworkGalleryItem[] })
```

The main image must use:

```tsx
<img
  src={selected.url}
  alt={selected.alt}
  className={selected.role === "room" ? "h-full w-full object-cover" : "h-full w-full object-contain"}
/>
```

- [ ] **Step 4: Implement `ArtworkMaterialStory`**

Filter roles `texture` and `edge`, require two items, and render this structure:

```tsx
export default function ArtworkMaterialStory({
  items,
  heading,
}: {
  items: ArtworkGalleryItem[]
  heading: string
}) {
  const detailItems = items.filter((item) => item.role === "texture" || item.role === "edge").slice(0, 2)
  if (detailItems.length < 2) return null

  return (
    <section className="grid gap-8 border-t border-[#ded8ce] py-14 lg:grid-cols-[0.7fr_1.3fr]">
      <h2 className="max-w-sm font-serif text-4xl font-light leading-tight text-[#181613]">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {detailItems.map((item) => (
          <img key={item.url} src={item.url} alt={item.alt} className="aspect-[4/3] h-full w-full object-cover" />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run component tests**

Run:

```powershell
npm test -- src/features/artwork-detail/ArtworkHeroGallery.test.tsx src/features/artwork-detail/ArtworkMaterialStory.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 6: Commit the visual proof components**

```powershell
git add src/features/artwork-detail/ArtworkHeroGallery.tsx src/features/artwork-detail/ArtworkHeroGallery.test.tsx src/features/artwork-detail/ArtworkMaterialStory.tsx src/features/artwork-detail/ArtworkMaterialStory.test.tsx
git commit -m "feat: add artwork gallery and material proof"
```

---

### Task 6: Build the Purchase Panel and Synchronized Mobile Actions

**Files:**
- Create: `src/features/artwork-detail/ArtworkPurchaseExperience.tsx`
- Create: `src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx`
- Modify: `src/components/AddToCartButton.tsx`

**Interfaces:**
- Consumes: `PresentationOption[]`, existing `PriceText`, `PriceDisclosure`, `ReviewStars`, `AddToCartButton`, and real checkout availability.
- Produces: a desktop sticky purchase panel and mobile bottom bar sharing one selected presentation option.

- [ ] **Step 1: Write failing purchase experience tests**

Create `src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx` with explicit mocks and props:

```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArtworkPurchaseExperience from "./ArtworkPurchaseExperience"

vi.mock("@/components/AddToCartButton", () => ({
  default: ({ item }: { item: { presentationOption?: string } }) => (
    <button type="button" data-testid="cart-presentation">
      {item.presentationOption || "none"}
    </button>
  ),
}))
vi.mock("@/components/PriceText", () => ({
  PriceText: () => <span>$1,520 USD</span>,
  PriceDisclosure: () => <span>International price disclosure</span>,
}))
vi.mock("@/components/ReviewStars", () => ({ default: () => <span>Stars</span> }))

const baseProps = {
  eyebrow: "Textured Art / Mixed Media on Canvas",
  title: "Quiet Meridian",
  artistName: "Huang Liang",
  description: "Built in thin layers of plaster, ash gray, and muted gold.",
  dimensions: "90 x 140 cm / 35.4 x 55.1 in",
  priceCny: 10900,
  reviewCount: 18,
  reviewOverall: 5,
  presentationOptions: [{ label: "Rolled Canvas" }],
  presentationFallbackText: "Confirm presentation before dispatch",
  baseCartItem: {
    id: "artwork-1",
    title: "Quiet Meridian",
    artist: "Huang Liang",
    price: 10900,
    image: "/artwork.png",
  },
  directCheckoutAvailable: true,
  invoiceUrl: "https://example.com/invoice",
  whatsappUrl: "https://example.com/whatsapp",
  displayPriceOverride: undefined,
  previewMode: false,
}

it("selects a presentation option and passes it to both purchase actions", () => {
  render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[
    { label: "Rolled Canvas" },
    { label: "Stretched" },
  ]} />)
  fireEvent.click(screen.getByRole("button", { name: "Stretched" }))
  expect(screen.getByRole("button", { name: "Stretched" })).toHaveAttribute("aria-pressed", "true")
  expect(screen.getAllByTestId("cart-presentation").map((node) => node.textContent))
    .toEqual(["Stretched", "Stretched"])
})

it("hides preview reviews when the real review count is zero", () => {
  render(<ArtworkPurchaseExperience {...baseProps} reviewCount={0} reviewOverall={0} />)
  expect(screen.queryByText(/verified collector reviews/i)).not.toBeInTheDocument()
})

it("shows the framing fallback when no presentation choices are configured", () => {
  render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[]} />)
  expect(screen.getByText("Confirm presentation before dispatch")).toBeInTheDocument()
})

it("uses the invoice path when direct checkout is unavailable", () => {
  render(<ArtworkPurchaseExperience {...baseProps} directCheckoutAvailable={false} />)
  expect(screen.getAllByRole("link", { name: "Request an invoice" })[0])
    .toHaveAttribute("href", "https://example.com/invoice")
  expect(screen.queryByTestId("cart-presentation")).not.toBeInTheDocument()
})

it("uses local feedback and never calls the real cart in preview mode", () => {
  render(<ArtworkPurchaseExperience
    {...baseProps}
    previewMode
    directCheckoutAvailable={false}
    displayPriceOverride="$1,520 USD"
  />)
  fireEvent.click(screen.getAllByRole("button", { name: "Add to cart" })[0])
  expect(screen.getAllByRole("button", { name: "Added to prototype cart" })).not.toHaveLength(0)
  expect(screen.queryByTestId("cart-presentation")).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npm test -- src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the purchase experience**

The exported props must include real product identity, story, price, dimensions, review statistics, presentation options, URLs, and the current cart item:

```ts
type ArtworkPurchaseExperienceProps = {
  eyebrow: string
  title: string
  artistName: string
  description: string
  dimensions: string
  priceCny: number
  displayPriceOverride?: string
  reviewCount: number
  reviewOverall: number
  presentationOptions: PresentationOption[]
  presentationFallbackText: string
  baseCartItem: AddToCartItem
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
  previewMode?: boolean
}
```

Initialize the selected option from the first configured value:

```ts
const [selectedPresentation, setSelectedPresentation] = useState(
  presentationOptions[0]?.label,
)
const cartItem = {
  ...baseCartItem,
  presentationOption: selectedPresentation,
}
```

Use `aria-pressed` on choice buttons. When no choices exist, render `presentationFallbackText` in place of the selector. Render one primary add-to-cart or invoice action, one WhatsApp action, and four flat trust rows. The desktop panel uses `lg:sticky lg:top-24`. Render the same `cartItem` in the desktop action and fixed mobile bottom bar so selection cannot drift; reserve enough page-bottom padding for the bar and include safe-area inset padding. When `displayPriceOverride` exists, render that exact text instead of `PriceText`. When `previewMode` is true, render a local button that changes from `Add to cart` to `Added to prototype cart`; do not render `AddToCartButton`, invoice links, or any payment navigation.

- [ ] **Step 4: Export the cart item input type**

In `src/components/AddToCartButton.tsx`, export the item type:

```ts
export type AddToCartItem = {
  id: string
  title: string
  titleZh?: string
  artist: string
  artistId?: string
  price: number
  image: string
  size?: string
  presentationOption?: string
}
```

- [ ] **Step 5: Run the purchase tests and full component suite**

Run:

```powershell
npm test -- src/features/artwork-detail
```

Expected: all feature tests PASS.

- [ ] **Step 6: Commit the purchase experience**

```powershell
git add src/features/artwork-detail/ArtworkPurchaseExperience.tsx src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx src/components/AddToCartButton.tsx
git commit -m "feat: add room-first artwork purchase panel"
```

---

### Task 7: Compose the New Page and Preserve Existing Supporting Content

**Files:**
- Create: `src/features/artwork-detail/ArtworkSupportingSections.tsx`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Modify: `messages/de.json`
- Modify: `messages/fr.json`
- Modify: `messages/ar.json`

**Interfaces:**
- Consumes: gallery, purchase experience, material story, preview fixture, existing details/review/related data.
- Produces: the complete selected room-first detail page on the existing dynamic route.

- [ ] **Step 1: Add translation keys in all five locale files**

Add the same keys under `product` with localized values:

```json
{
  "selectedSize": "Selected size",
  "chooseFinish": "Choose finish",
  "confirmPresentation": "Confirm presentation before dispatch",
  "roomVisualization": "Room visualization",
  "materialStory": "Made by hand, understood in the room.",
  "oneOfAKind": "One-of-a-kind original",
  "certificateIncluded": "Certificate of authenticity",
  "worldwideDelivery": "Free worldwide delivery",
  "returnWindow": "30-day return window"
}
```

Use native translations in `zh`, `de`, `fr`, and `ar`; do not leave English in those files. Preserve valid JSON and existing keys.

- [ ] **Step 2: Extract the supporting sections without changing behavior**

Move the existing details, scale guidance, customization, advice, process, packaging, related artwork, and review JSX into `ArtworkSupportingSections.tsx`. Move the supporting helpers `ArtworkDetails`, `RelatedArtworkCard`, `ScaleGuidance`, `InfoBlock`, `TrustCard`, and their private formatting helpers with those sections. Do not move data fetching into this component.

Use this exact public interface:

```ts
export type ArtworkSupportingSectionsProps = {
  title: string
  medium?: string
  surfaceFinish?: string
  framingNotes?: string
  shippingProfile?: string
  dimensionsSource?: string
  roomTypes: string[]
  customRequestUrl: string
  relatedArtworks: any[]
  reviews: PublicReview[]
  reviewStats: ReviewStats
}

export default function ArtworkSupportingSections(
  props: ArtworkSupportingSectionsProps,
): ReactNode
```

Import `ReactNode` from `react`, and import `PublicReview` and `ReviewStats` from `@/lib/reviews`. Keep each moved section's existing data-driven guards, links, and copy behavior unchanged; only adjust typography, dividers, and spacing to match the approved paper-and-ink visual system.

The page must remain responsible for:

```ts
const artwork = await getArtwork(slug)
const reviews = await getArtworkReviews(artwork._id)
const relatedArtworks = await getRelatedArtworks(artwork._id, artwork.category, artwork.medium)
```

- [ ] **Step 3: Add development-only preview selection to the server page**

Change the page signature to accept search params:

```ts
export default async function ArtworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ productPreview?: string }>
})
```

Resolve preview data only outside production:

```ts
const { productPreview } = await searchParams
const preview = getArtworkDetailPreview(
  productPreview,
  process.env.NODE_ENV === "production",
)
```

Derive the visible values explicitly:

```ts
const productionGalleryItems = getArtworkGalleryItems(artwork, { width: 1600 }, title)
const galleryItems = preview?.gallery || productionGalleryItems
const visibleTitle = preview?.title || title
const visibleArtistName = preview?.artistName || artistName
const visibleDescription = preview?.description || description
const visibleDimensions = preview?.dimensions || dimensions
const visibleCategory = preview?.category || category
const visibleMedium = preview?.medium || medium
const presentationOptions = preview?.presentationOptions
  || normalizePresentationOptions(artwork.presentationOptions)
```

The preview may replace visible copy and gallery items for visual review, but must set `directCheckoutAvailable` to `false`, may not be included in product JSON-LD, and must not render `ArtworkViewTracker` so prototype traffic cannot alter real artwork analytics.

- [ ] **Step 4: Compose the approved room-first hero**

Replace the current bordered split card with:

```tsx
<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(380px,0.95fr)]">
  <ArtworkHeroGallery items={galleryItems} />
  <ArtworkPurchaseExperience
    eyebrow={[visibleCategory, visibleMedium].filter(Boolean).join(" / ")}
    title={visibleTitle}
    artistName={visibleArtistName}
    description={visibleDescription}
    dimensions={visibleDimensions}
    priceCny={priceCny}
    displayPriceOverride={preview?.displayPrice}
    reviewCount={preview ? 0 : reviewStats.count}
    reviewOverall={preview ? 0 : reviewStats.overall}
    presentationOptions={presentationOptions}
    presentationFallbackText={framingNotes || t("confirmPresentation")}
    baseCartItem={cartItem}
    directCheckoutAvailable={!preview && directCheckoutAvailable}
    invoiceUrl={invoiceUrl}
    whatsappUrl={whatsappUrl}
    previewMode={Boolean(preview)}
  />
</div>
<ArtworkMaterialStory
  items={galleryItems}
  heading={t("materialStory")}
/>
<ArtworkSupportingSections
  title={title}
  medium={medium}
  surfaceFinish={surfaceFinish}
  framingNotes={framingNotes}
  shippingProfile={shippingProfile}
  dimensionsSource={artwork.dimensions}
  roomTypes={roomTypes}
  customRequestUrl={customRequestUrl}
  relatedArtworks={relatedArtworks}
  reviews={reviews}
  reviewStats={reviewStats}
/>
```

Keep breadcrumb, SEO scripts, view tracking, header, footer, and existing policy links.

- [ ] **Step 5: Run JSON, copy, test, and build checks**

Run:

```powershell
Get-Content messages\en.json | ConvertFrom-Json | Out-Null
Get-Content messages\zh.json | ConvertFrom-Json | Out-Null
Get-Content messages\de.json | ConvertFrom-Json | Out-Null
Get-Content messages\fr.json | ConvertFrom-Json | Out-Null
Get-Content messages\ar.json | ConvertFrom-Json | Out-Null
npm run copy:check
npm run lint
npm test
npm run build
```

Expected: all JSON parses; copy check and lint exit `0`; tests PASS; build exits `0`.

- [ ] **Step 6: Commit the complete page composition**

```powershell
git add src/app/artwork/[slug]/page.tsx src/features/artwork-detail/ArtworkSupportingSections.tsx messages/en.json messages/zh.json messages/de.json messages/fr.json messages/ar.json
git commit -m "feat: compose room-first artwork detail page"
```

---

### Task 8: Perform Responsive, Accessibility, and Visual QA

**Required sub-skill:** `Product Design:design-qa` for source-to-render comparison after the page is runnable.

**Files:**
- Modify only files with a demonstrated mismatch or regression from Tasks 1-7.

**Interfaces:**
- Consumes: approved mockup and the runnable page.
- Produces: verified desktop/mobile implementation with no visible regression.

- [ ] **Step 1: Run the full automated verification**

Run:

```powershell
npm test
npm run copy:check
npm run lint
npm run build
git diff --check
```

Expected: tests PASS with zero failures; copy check, lint, and build exit `0`; `git diff --check` prints nothing.

- [ ] **Step 2: Start the production server**

Run and record the returned process ID:

```powershell
$server = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "start" -WorkingDirectory "D:\Documents\网站内容" -WindowStyle Hidden -PassThru
$server.Id | Set-Content -LiteralPath ".next\yiiart-server.pid"
Get-Content -LiteralPath ".next\yiiart-server.pid"
```

Expected: a positive process ID; `http://localhost:3000` responds after the server starts.

- [ ] **Step 3: Capture the desktop implementation**

Open an existing real artwork with the preview query:

```text
http://localhost:3000/artwork/afternoon?productPreview=quiet-meridian
```

Set viewport to `1440 x 1024`, capture the first viewport, and verify:

- room scene uses about two-thirds of the width;
- purchase panel is readable and sticky;
- title, story, price, selected size, choices, CTA, WhatsApp, and trust rows fit without clipping;
- no preview review count is presented as real;
- preview checkout is unavailable;
- the material strip begins below the fold as in the approved mockup.

- [ ] **Step 4: Run a source-to-render visual comparison**

Put the approved mockup `docs/superpowers/specs/assets/yiiart-room-first-product-detail.png` and the desktop screenshot into the same visual comparison input. List concrete mismatches in crop, column ratio, spacing, typography, borders, and control height. Fix only demonstrated mismatches, then capture and compare again.

- [ ] **Step 5: Capture and verify mobile**

Set viewport to `390 x 844`. Verify gallery selection, horizontal thumbnail access, title wrapping, presentation selection, 44 px touch targets, and the bottom purchase bar. Confirm the bar does not cover reviews, policy links, or footer content.

- [ ] **Step 6: Exercise a real cart path**

Open an available Sanity artwork without the preview query. Select a configured presentation option when present, add it to cart, confirm cart and checkout show the same label, and verify the checkout request submits `{ id, quantity: 1, presentationOption }`. Use a non-payment test environment; do not complete a real charge.

- [ ] **Step 7: Re-run verification after visual fixes**

Run:

```powershell
npm test
npm run copy:check
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all tests PASS; copy check, lint, and build exit `0`; no whitespace errors; status lists only intended QA fixes.

- [ ] **Step 8: Stop the local production server**

Run with the process ID saved in Step 2:

```powershell
$serverPid = [int](Get-Content -LiteralPath ".next\yiiart-server.pid")
Stop-Process -Id $serverPid
Remove-Item -LiteralPath ".next\yiiart-server.pid"
```

Expected: the local Next.js process stops; no other process is affected.

- [ ] **Step 9: Commit final QA fixes**

```powershell
git add -- src/app/artwork/[slug]/page.tsx src/features/artwork-detail/ArtworkHeroGallery.tsx src/features/artwork-detail/ArtworkMaterialStory.tsx src/features/artwork-detail/ArtworkPurchaseExperience.tsx src/features/artwork-detail/ArtworkSupportingSections.tsx src/context/CartContext.tsx src/components/AddToCartButton.tsx src/app/cart/page.tsx src/app/checkout/page.tsx src/lib/artwork-images.ts src/lib/checkout.ts messages/en.json messages/zh.json messages/de.json messages/fr.json messages/ar.json public/prototypes/quiet-meridian/room.png public/prototypes/quiet-meridian/artwork.png public/prototypes/quiet-meridian/texture.png public/prototypes/quiet-meridian/edge.png
git commit -m "fix: align artwork detail with approved design"
```

- [ ] **Step 10: Record final evidence**

Report the local preview URL, desktop and mobile screenshots, commands run with exit codes, any deliberate differences from the mockup, and whether real payment was intentionally not completed.
