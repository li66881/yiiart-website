# YiiArt Natural Studio Product Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild YiiArt's existing generic artwork-detail hero as the selected Natural Studio design while preserving real gallery, cart, invoice, WhatsApp, related-artwork, and checkout behavior.

**Architecture:** Keep the server route responsible for resolving safe listing facts and composing the page. Extend the existing `artwork-detail` feature boundary with pure content resolvers, a responsive gallery, a focused purchase component, and a separate similar-art strip. Preserve the existing cart and checkout contracts by continuing to store only the configured presentation label.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, Vitest, Testing Library, Sanity, `@phosphor-icons/react`.

## Global Constraints

- Preserve the existing `/artwork/[slug]` route, YiiArt header/footer, Sanity data, cart, checkout, currency, WhatsApp, and preview behavior.
- Use the selected visual target at `docs/superpowers/specs/assets/yiiart-natural-studio-product-detail-selected.png`.
- Desktop QA viewport is exactly `1440 × 1024`; mobile QA viewport is exactly `390 × 844`.
- Use a `64 / 36` room-first desktop split with a vertical thumbnail rail; mobile uses a horizontal strip.
- Never render fake urgency, countdowns, recent-sale messages, review counts, certificate claims, availability, or unsupported presentation options.
- Use Phosphor regular-weight icons; do not add handcrafted SVG, CSS art, emoji, or text-symbol icons.
- Keep the primary CTA authoritative: cart when checkout is available, invoice/support otherwise, local feedback only in preview mode.
- Avoid gradients, nested cards, excessive rounding, and pill-heavy UI.
- Follow TDD for each behavior change and commit each independently testable task.

---

## File Map

- `src/features/artwork-detail/model.ts` — shared artwork-detail types and pure content resolvers.
- `src/features/artwork-detail/model.test.ts` — tag, presentation-description, and normalization tests.
- `src/features/artwork-detail/preview.ts` — local Quiet Meridian fixture facts for the selected design.
- `src/features/artwork-detail/preview.test.ts` — preview truth and production isolation.
- `src/features/artwork-detail/ArtworkHeroGallery.tsx` — responsive dominant image and thumbnail rail.
- `src/features/artwork-detail/ArtworkHeroGallery.test.tsx` — gallery layout and interaction tests.
- `src/features/artwork-detail/ArtworkPurchaseExperience.tsx` — Natural Studio purchase panel and mobile bar.
- `src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx` — purchase content, selection, accordion, cart, and invoice tests.
- `src/features/artwork-detail/ArtworkSimilarStrip.tsx` — visually similar artwork strip.
- `src/features/artwork-detail/ArtworkSimilarStrip.test.tsx` — strip rendering and empty-state tests.
- `src/features/artwork-detail/ArtworkSupportingSections.tsx` — long-form content after the similar-art strip.
- `src/app/artwork/[slug]/page.tsx` — server data resolution and page composition.
- `src/sanity/schemas/artwork.ts` — optional certificate fact.
- `package.json` / `package-lock.json` — Phosphor icon dependency and lint coverage.
- `design-qa.md` — final same-viewport visual comparison and QA result.

---

### Task 1: Resolve Truth-Aware Product Content

**Files:**
- Modify: `src/features/artwork-detail/model.ts`
- Modify: `src/features/artwork-detail/model.test.ts`
- Modify: `src/features/artwork-detail/preview.ts`
- Modify: `src/features/artwork-detail/preview.test.ts`

**Interfaces:**
- Produces: `ProductTag`, `ArtworkProductFacts`, `buildArtworkProductTags(facts)`, `getPresentationDescription(label)`, and `PresentationOption.description`.
- Consumes: existing presentation labels and listing facts from the artwork route.

- [ ] **Step 1: Write failing resolver tests**

Add these tests to `model.test.ts`:

```ts
import {
  buildArtworkProductTags,
  getPresentationDescription,
} from "./model"

describe("natural studio product content", () => {
  it("shows only truthful product tags", () => {
    expect(buildArtworkProductTags({
      medium: "Mixed media on canvas",
      surfaceFinish: "Raised plaster texture",
      certificateIncluded: false,
      previewMode: false,
    })).toEqual([
      { label: "Original Artwork" },
      { label: "Hand-Painted Texture" },
    ])
  })

  it("allows the certificate tag only from configured or preview facts", () => {
    expect(buildArtworkProductTags({ certificateIncluded: true, previewMode: false }))
      .toContainEqual({ label: "Certificate Included" })
    expect(buildArtworkProductTags({ certificateIncluded: false, previewMode: true }))
      .toContainEqual({ label: "Certificate Included" })
  })

  it("returns safe supporting copy for known presentation labels", () => {
    expect(getPresentationDescription("Rolled Canvas"))
      .toBe("Ships rolled in a protective tube")
    expect(getPresentationDescription("Stretched"))
      .toBe("Ready to hang")
    expect(getPresentationDescription("Natural Oak Float Frame"))
      .toBe("Warm oak frame with a float mount")
    expect(getPresentationDescription("Custom format")).toBeUndefined()
  })
})
```

Update the preview test to assert that every preview presentation option has `description` and the fixture sets `certificateIncluded: true`.

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
npm test -- src/features/artwork-detail/model.test.ts src/features/artwork-detail/preview.test.ts
```

Expected: FAIL because the new resolver exports, `description`, and certificate fixture fact do not exist.

- [ ] **Step 3: Implement the pure resolvers**

Add to `model.ts`:

```ts
export type ProductTag = { label: string }

export type ArtworkProductFacts = {
  medium?: string
  surfaceFinish?: string
  certificateIncluded?: boolean
  previewMode?: boolean
}

export type PresentationOption = {
  label: string
  image?: string
  description?: string
}

export function buildArtworkProductTags({
  medium = "",
  surfaceFinish = "",
  certificateIncluded = false,
  previewMode = false,
}: ArtworkProductFacts): ProductTag[] {
  const textureSource = `${medium} ${surfaceFinish}`
  const tags: ProductTag[] = [
    { label: "Original Artwork" },
    { label: /texture|plaster|mixed media/i.test(textureSource)
      ? "Hand-Painted Texture"
      : "Hand-Painted" },
  ]
  if (certificateIncluded || previewMode) tags.push({ label: "Certificate Included" })
  return tags.slice(0, 3)
}

export function getPresentationDescription(label: string) {
  const descriptions: Record<string, string> = {
    "Rolled Canvas": "Ships rolled in a protective tube",
    Stretched: "Ready to hang",
    "Natural Oak Float Frame": "Warm oak frame with a float mount",
  }
  return descriptions[label]
}
```

When normalizing string options, return `{ label, description: getPresentationDescription(label) }`. Preserve explicit preview images and add the matching description in `preview.ts`. Extend `ArtworkDetailPreview` with `certificateIncluded: boolean` and set the Quiet Meridian value to `true`.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm test -- src/features/artwork-detail/model.test.ts src/features/artwork-detail/preview.test.ts
```

Expected: both files pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/artwork-detail/model.ts src/features/artwork-detail/model.test.ts src/features/artwork-detail/preview.ts src/features/artwork-detail/preview.test.ts
git commit -m "feat: resolve natural studio product facts"
```

---

### Task 2: Build the Responsive Thumbnail Rail

**Files:**
- Modify: `src/features/artwork-detail/ArtworkHeroGallery.tsx`
- Modify: `src/features/artwork-detail/ArtworkHeroGallery.test.tsx`

**Interfaces:**
- Consumes: `ArtworkGalleryItem[]`.
- Produces: the same `ArtworkHeroGallery` component API with a responsive rail and unchanged keyboard behavior.

- [ ] **Step 1: Write the failing layout test**

Add:

```tsx
it("uses a vertical desktop rail and horizontal mobile strip", () => {
  const { container } = render(<ArtworkHeroGallery items={items} />)
  expect(container.querySelector('[data-gallery-layout="natural-studio"]'))
    .toHaveClass("lg:grid-cols-[6.5rem_minmax(0,1fr)]")
  expect(screen.getByRole("group", { name: "Artwork views" }))
    .toHaveClass("lg:flex-col", "overflow-x-auto", "lg:overflow-visible")
})
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
npm test -- src/features/artwork-detail/ArtworkHeroGallery.test.tsx
```

Expected: FAIL because the layout marker and desktop rail classes are absent.

- [ ] **Step 3: Implement the responsive layout**

Use this structure while preserving the existing state and keyboard functions:

```tsx
<section aria-label="Artwork gallery" className="min-w-0">
  <div
    data-gallery-layout="natural-studio"
    className="grid min-w-0 gap-3 lg:grid-cols-[6.5rem_minmax(0,1fr)] lg:gap-4"
  >
    {items.length > 1 && (
      <div
        className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:overflow-visible lg:pb-0"
        role="group"
        aria-label="Artwork views"
      >
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            ref={(node) => { thumbnailRefs.current[index] = node }}
            type="button"
            aria-label={`Show ${item.alt}`}
            aria-pressed={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => handleThumbnailKeyDown(event, index)}
            className={`h-24 w-20 shrink-0 border bg-[#f1eee7] p-1 transition lg:h-[7.25rem] lg:w-full ${
              selectedIndex === index
                ? "border-[#181613] opacity-100"
                : "border-transparent opacity-70 hover:opacity-100"
            } focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2`}
          >
            <img src={item.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    )}
    <div className="relative order-1 aspect-[4/3] overflow-hidden bg-[#f1eee7] lg:order-2 lg:aspect-auto lg:min-h-[calc(100vh-7rem)]">
      <img
        key={selected.url}
        src={selected.url}
        alt={selected.alt}
        className={selected.role === "room" ? "h-full w-full object-cover" : "h-full w-full object-contain"}
      />
      {selected.isVisualization && (
        <span className="absolute bottom-3 left-3 bg-[#fbfaf6]/95 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em]">
          Room visualization
        </span>
      )}
    </div>
  </div>
</section>
```

For one image, render only the dominant image and use `lg:grid-cols-1`.

- [ ] **Step 4: Run the gallery tests**

Run:

```bash
npm test -- src/features/artwork-detail/ArtworkHeroGallery.test.tsx
```

Expected: all gallery tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/artwork-detail/ArtworkHeroGallery.tsx src/features/artwork-detail/ArtworkHeroGallery.test.tsx
git commit -m "feat: add natural studio gallery rail"
```

---

### Task 3: Rebuild the Purchase Panel

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/features/artwork-detail/ArtworkPurchaseExperience.tsx`
- Modify: `src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx`

**Interfaces:**
- Consumes: existing purchase props plus `productTags: ProductTag[]`, `sizeGuideHref: string`, and `studioPhotoMode: "included" | "request"`.
- Produces: selected Natural Studio purchase UI while preserving cart item shape and invoice fallback.

- [ ] **Step 1: Write failing purchase-panel tests**

Extend `baseProps`:

```ts
productTags: [
  { label: "Original Artwork" },
  { label: "Hand-Painted Texture" },
  { label: "Certificate Included" },
],
sizeGuideHref: "/size-guide",
studioPhotoMode: "included" as const,
```

Add:

```tsx
it("renders natural studio tags, size guide, and photo approval copy", () => {
  render(<ArtworkPurchaseExperience {...baseProps} />)
  expect(screen.getByText("Original Artwork")).toBeInTheDocument()
  expect(screen.getByText("Hand-Painted Texture")).toBeInTheDocument()
  expect(screen.getByText("Certificate Included")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "Size & room guide" }))
    .toHaveAttribute("href", "/size-guide")
  expect(screen.getByText("We send studio photos before shipping.")).toBeInTheDocument()
})

it("renders presentation options as rows with supporting copy", () => {
  render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[
    { label: "Rolled Canvas", image: "/rolled.png", description: "Ships rolled in a protective tube" },
    { label: "Stretched", image: "/stretched.png", description: "Ready to hang" },
  ]} />)
  expect(screen.getByRole("button", { name: "Rolled Canvas" }))
    .toHaveAttribute("aria-pressed", "true")
  expect(screen.getByText("Ships rolled in a protective tube")).toBeInTheDocument()
  expect(screen.getByText("Ready to hang")).toBeInTheDocument()
})

it("uses request wording when studio photos are not included", () => {
  render(<ArtworkPurchaseExperience {...baseProps} studioPhotoMode="request" />)
  expect(screen.getByText("Request studio photos before shipping.")).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the purchase tests and verify failure**

Run:

```bash
npm test -- src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx
```

Expected: FAIL because the new props and Natural Studio content are absent.

- [ ] **Step 3: Install the icon dependency**

Run:

```bash
npm install @phosphor-icons/react
```

Expected: `package.json` and `package-lock.json` record the dependency.

- [ ] **Step 4: Implement the Natural Studio purchase structure**

Add props:

```ts
productTags: ProductTag[]
sizeGuideHref: string
studioPhotoMode: "included" | "request"
```

Import regular-weight icons:

```ts
import {
  ArrowCounterClockwise,
  Camera,
  CaretRight,
  Check,
  LockKey,
  Package,
  Truck,
  WhatsappLogo,
} from "@phosphor-icons/react"
```

Replace the current tag/size/presentation/action body with:

```tsx
<div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-[#ded8ce] py-3">
  {productTags.map((tag) => (
    <span key={tag.label} className="text-xs text-[#6f675d]">{tag.label}</span>
  ))}
</div>

<div className="border-b border-[#ded8ce] py-4">
  <div className="flex items-center justify-between gap-4">
    <p className="text-xs uppercase tracking-[0.13em] text-[#6f675d]">{t("product.selectedSize")}</p>
    <a href={sizeGuideHref} className="text-xs underline underline-offset-4">Size & room guide</a>
  </div>
  <div className="mt-2 flex min-h-11 items-center justify-between border border-[#ded8ce] px-3 text-sm font-medium">
    <span>{dimensions}</span>
    <CaretRight size={16} aria-hidden="true" />
  </div>
</div>

<div className="py-4">
  <p className="text-xs uppercase tracking-[0.13em] text-[#6f675d]">{t("product.chooseFinish")}</p>
  {presentationOptions.length > 0 ? (
    <div className="mt-3 space-y-2">
      {presentationOptions.map((option) => {
        const selected = selectedPresentation === option.label
        return (
          <button
            key={option.label}
            type="button"
            aria-label={option.label}
            aria-pressed={selected}
            onClick={() => setSelectedPresentation(option.label)}
            className={`flex min-h-[4.25rem] w-full items-center gap-3 border px-2 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2 ${
              selected ? "border-[#181613] bg-[#f7f5ef]" : "border-[#ded8ce] hover:border-[#181613]"
            }`}
          >
            {option.image && <img src={option.image} alt="" className="h-12 w-20 shrink-0 object-cover" />}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description && <span className="mt-0.5 block text-xs text-[#6f675d]">{option.description}</span>}
            </span>
            {selected ? <Check size={18} aria-hidden="true" /> : <CaretRight size={18} aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  ) : (
    <p className="mt-3 text-sm leading-6 text-[#6f675d]">{presentationFallbackText || t("product.confirmPresentation")}</p>
  )}
</div>

<div className="mb-3 flex gap-3 border border-[#cfd6c8] bg-[#f3f5ef] px-3 py-3 text-sm">
  <Camera size={20} aria-hidden="true" className="shrink-0" />
  <div>
    <p className="font-medium">{studioPhotoMode === "included"
      ? "We send studio photos before shipping."
      : "Request studio photos before shipping."}</p>
    <p className="mt-1 text-xs text-[#6f675d]">Review the surface and framing before dispatch.</p>
  </div>
</div>
```

Render the secondary WhatsApp action with `WhatsappLogo`. Render reassurance content using native `<details>` rows with these title/icon pairs: one-of-a-kind or made-for-you (`Package`), worldwide delivery (`Truck`), returns (`ArrowCounterClockwise`), and secure payment (`LockKey`). Keep the existing fixed mobile purchase bar, cart item, invoice link, preview feedback, and review rendering behavior.

- [ ] **Step 5: Run purchase tests**

Run:

```bash
npm test -- src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx
```

Expected: all tests pass, including existing cart and invoice cases.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/features/artwork-detail/ArtworkPurchaseExperience.tsx src/features/artwork-detail/ArtworkPurchaseExperience.test.tsx
git commit -m "feat: add natural studio purchase panel"
```

---

### Task 4: Extract the Visually Similar Art Strip

**Files:**
- Create: `src/features/artwork-detail/ArtworkSimilarStrip.tsx`
- Create: `src/features/artwork-detail/ArtworkSimilarStrip.test.tsx`
- Modify: `src/features/artwork-detail/ArtworkSupportingSections.tsx`

**Interfaces:**
- Consumes: `artworks: RelatedArtwork[]`.
- Produces: `ArtworkSimilarStrip` that returns `null` when the array is empty.
- Changes: `ArtworkSupportingSections` no longer consumes or renders `relatedArtworks`.

- [ ] **Step 1: Write the failing component test**

Create:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArtworkSimilarStrip from "./ArtworkSimilarStrip"

vi.mock("@/components/PriceText", () => ({ PriceText: () => <span>$420 USD</span> }))

const artwork = {
  _id: "related-1",
  title: { en: "Stone Current" },
  slug: { current: "stone-current" },
  price: 3000,
  dimensions: "80 x 120 cm",
  medium: "Acrylic on canvas",
  category: "Abstract",
  cloudflareImages: [{ url: "/stone-current.jpg" }],
}

describe("ArtworkSimilarStrip", () => {
  it("renders related artwork as the visually similar strip", () => {
    render(<ArtworkSimilarStrip artworks={[artwork]} />)
    expect(screen.getByRole("heading", { name: "Visually Similar Artworks" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Stone Current/ })).toHaveAttribute("href", "/artwork/stone-current")
  })

  it("renders nothing without related artwork", () => {
    const { container } = render(<ArtworkSimilarStrip artworks={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
npm test -- src/features/artwork-detail/ArtworkSimilarStrip.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the similar-art strip**

Create `ArtworkSimilarStrip.tsx` by moving the existing `RelatedArtworkCard` logic into a focused component. Use this section shell:

```tsx
export default function ArtworkSimilarStrip({ artworks }: { artworks: RelatedArtwork[] }) {
  if (artworks.length === 0) return null
  return (
    <section className="mt-10 border-t border-[#ded8ce] pt-8 lg:mt-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl font-light lg:text-4xl">Visually Similar Artworks</h2>
        <Link href="/artworks" className="text-sm underline underline-offset-4">View all artworks</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {artworks.map((artwork) => <RelatedArtworkCard key={artwork._id} artwork={artwork} />)}
      </div>
    </section>
  )
}
```

Use `aspect-[4/5]`, the existing image resolver, translated artwork facts, dimensions, and `PriceText`. Remove the old related section, `RelatedArtworkCard`, and `relatedArtworks` prop from `ArtworkSupportingSections`.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm test -- src/features/artwork-detail/ArtworkSimilarStrip.test.tsx
```

Expected: both tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/artwork-detail/ArtworkSimilarStrip.tsx src/features/artwork-detail/ArtworkSimilarStrip.test.tsx src/features/artwork-detail/ArtworkSupportingSections.tsx
git commit -m "feat: add visually similar artwork strip"
```

---

### Task 5: Integrate Production Facts and Page Composition

**Files:**
- Modify: `src/sanity/schemas/artwork.ts`
- Modify: `src/app/artwork/[slug]/page.tsx`
- Create: `src/features/artwork-detail/page-composition.test.ts`

**Interfaces:**
- Consumes: `certificateIncluded?: boolean` from Sanity and the local preview fixture.
- Produces: resolved `productTags`, `studioPhotoMode`, and the new hero/similar/material ordering.

- [ ] **Step 1: Write the failing composition test**

Create:

```ts
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("natural studio page composition", () => {
  it("places visually similar artwork before the material story", () => {
    const source = readFileSync("src/app/artwork/[slug]/page.tsx", "utf8")
    expect(source.indexOf("<ArtworkSimilarStrip"))
      .toBeLessThan(source.indexOf("<ArtworkMaterialStory"))
  })

  it("queries the optional certificate fact", () => {
    const source = readFileSync("src/app/artwork/[slug]/page.tsx", "utf8")
    expect(source).toContain("certificateIncluded")
  })
})
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
npm test -- src/features/artwork-detail/page-composition.test.ts
```

Expected: FAIL because the new component and certificate query are absent.

- [ ] **Step 3: Add the optional Sanity certificate fact**

Add to `artwork.ts`:

```ts
{
  name: "certificateIncluded",
  title: "Certificate included",
  type: "boolean",
  initialValue: false,
  description: "Enable only when collector documentation will ship with this artwork.",
},
```

- [ ] **Step 4: Integrate route resolution and ordering**

Import `ArtworkSimilarStrip` and `buildArtworkProductTags`. Query `certificateIncluded`. Resolve:

```ts
const productTags = buildArtworkProductTags({
  medium: visibleMedium,
  surfaceFinish,
  certificateIncluded: preview?.certificateIncluded || artwork.certificateIncluded === true,
  previewMode: Boolean(preview),
})
const studioPhotoMode = preview ? "included" : "request"
```

Pass to the purchase component:

```tsx
productTags={productTags}
sizeGuideHref="/size-guide"
studioPhotoMode={studioPhotoMode}
```

Change the hero grid to:

```tsx
<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(400px,1fr)] lg:gap-8">
```

Then compose:

```tsx
<ArtworkSimilarStrip artworks={relatedArtworks} />
<ArtworkMaterialStory ... />
<SocialShare ... />
<ArtworkSupportingSections
  title={title}
  medium={medium}
  surfaceFinish={surfaceFinish}
  framingNotes={framingNotes}
  shippingProfile={shippingProfile}
  dimensionsSource={artwork.dimensions}
  roomTypes={roomTypes}
  customRequestUrl={customRequestUrl}
  reviews={reviews}
  reviewStats={reviewStats}
/>
```

- [ ] **Step 5: Run page and feature tests**

Run:

```bash
npm test -- src/features/artwork-detail/page-composition.test.ts src/features/artwork-detail
```

Expected: all artwork-detail tests pass.

- [ ] **Step 6: Commit**

```bash
git add -- src/sanity/schemas/artwork.ts src/app/artwork/[slug]/page.tsx src/features/artwork-detail/page-composition.test.ts
git commit -m "feat: compose natural studio artwork detail"
```

---

### Task 6: Run Visual QA and Complete the Branch

**Files:**
- Modify: `design-qa.md`
- Create: `docs/superpowers/specs/assets/yiiart-natural-studio-desktop-qa.png`
- Create: `docs/superpowers/specs/assets/yiiart-natural-studio-mobile-qa.png`
- Create: `docs/superpowers/specs/assets/yiiart-natural-studio-mobile-bottom-qa.png`

**Interfaces:**
- Consumes: selected mock, MesonArt reference, live generic artwork, and local Quiet Meridian fixture.
- Produces: final visual evidence and a `design-qa.md` result of `passed` or `blocked`.

- [ ] **Step 1: Run complete automated verification**

Run:

```bash
npm test
npm run copy:check
npm run lint
npm run build
git diff --check
```

Expected: zero test failures, copy check passes, targeted lint has zero warnings, build exits `0`, and diff check reports no whitespace errors. Existing unrelated Next.js build warnings may be recorded but must not be introduced by this feature.

- [ ] **Step 2: Start the local production preview**

Build and run with the local fixture flag:

```powershell
$env:YIIART_ENABLE_LOCAL_PREVIEW='1'
npm run build
npm run start
```

Open:

```text
http://localhost:3000/artwork/white-boat-on-grey
http://localhost:3000/artwork/afternoon?productPreview=quiet-meridian
```

- [ ] **Step 3: Verify interactions in the selected browser**

At `1440 × 1024` and `390 × 844`, verify:

- Gallery thumbnail selection updates the dominant image.
- Arrow, Home, and End keys retain gallery behavior.
- Presentation selection updates `aria-pressed` and cart presentation.
- Preview `Add to cart` shows local success feedback.
- Real artwork add-to-cart reaches `/cart` and is removed after the check.
- Invoice fallback remains a link when direct checkout is unavailable.
- Reassurance rows expand with `aria-expanded`.
- Mobile has no horizontal overflow.
- WhatsApp widget and footer remain above the fixed purchase bar.

- [ ] **Step 4: Run the blocking design comparison**

Open these images together in the same comparison input:

```text
docs/superpowers/specs/assets/yiiart-natural-studio-product-detail-selected.png
docs/superpowers/specs/assets/mesonart-sg234-reference.png
docs/superpowers/specs/assets/yiiart-natural-studio-desktop-qa.png
```

Fix all P0, P1, and P2 findings. Repeat the same-viewport capture until the implementation matches the selected composition, spacing, typography, control density, colors, imagery, and copy hierarchy.

- [ ] **Step 5: Update `design-qa.md`**

Record:

- Source-of-truth image paths.
- Viewports and states.
- Full-view and focused comparisons.
- Typography, layout, colors, imagery, copy, and icon checks.
- Each fixed iteration.
- Intentional differences caused by truthful production data.
- Browser console findings.
- `Final result: passed.` only when no P0/P1/P2 issues remain.

- [ ] **Step 6: Commit final QA evidence**

```bash
git add design-qa.md docs/superpowers/specs/assets/yiiart-natural-studio-desktop-qa.png docs/superpowers/specs/assets/yiiart-natural-studio-mobile-qa.png docs/superpowers/specs/assets/yiiart-natural-studio-mobile-bottom-qa.png
git commit -m "test: verify natural studio artwork detail"
```

- [ ] **Step 7: Re-run final verification after the last commit**

Run:

```bash
npm test
npm run copy:check
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all commands pass and `git status --short` is empty.
