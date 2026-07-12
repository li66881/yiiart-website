# YiiArt Natural Studio Product Detail — Design Specification

## Status

Selected visual direction: option 3, `Natural Studio Purchase`.

Visual target: `docs/superpowers/specs/assets/yiiart-natural-studio-product-detail-selected.png`.

Reference source: `https://www.mesonart.com/products/plaster-art-texture-painting-sg234`.

This specification refines the previously approved room-first product-detail direction. It does not replace YiiArt's identity, artwork imagery, commerce data, or existing application routes.

## Product Goal

Help a collector understand the artwork, choose a delivery presentation, and purchase or ask a question without the page feeling promotional or crowded. The page should feel like a quiet visit to an artist studio: tactile, natural, editorial, and commercially clear.

## Scope

The implementation applies to the existing generic route `src/app/artwork/[slug]/page.tsx`, including the current live artwork pages and the local Quiet Meridian visual fixture. The first implementation target is the artwork-detail hero and the first supporting strip below it.

In scope:

- Desktop vertical artwork thumbnail rail.
- Mobile horizontal thumbnail strip.
- Compact natural-studio purchase panel.
- Truth-aware product tags.
- A full-width selected-size row and size-guide link.
- Text-led presentation rows with real thumbnails.
- Studio-photo approval notice.
- Primary and secondary purchase actions.
- Expandable reassurance rows.
- A visually similar artworks strip directly after the hero.
- Desktop and mobile interaction, accessibility, and regression tests.

Out of scope:

- New authentication, review, payment, or inventory systems.
- Fake urgency, countdowns, recent-sale messages, review counts, or fabricated availability.
- New artwork routes or a separate product-detail template.
- Replacing the existing YiiArt header, footer, cart, checkout, Sanity content model, or currency behavior unless a small compatible extension is required.

## Visual Language

### Composition

At desktop widths, use a `64 / 36` room-first split below the existing YiiArt header.

- Left: a narrow vertical thumbnail rail and one dominant room visualization.
- Right: a sticky purchase column with compact vertical rhythm.
- At the bottom of the first desktop viewport, begin the visually similar artworks strip.
- The material story and longer product information continue below the similar-art strip.

The page background stays warm ivory. Dividers are thin stone lines. Surfaces remain flat; separation comes from spacing, typography, alignment, and lightweight rules rather than elevated cards.

### Typography

- Product and section headings use the existing YiiArt serif family with lighter weight, tight leading, and restrained tracking.
- Commerce copy uses the existing sans-serif family at readable `14–16px` sizes.
- Uppercase labels use small size and wider tracking.
- Maximum two font families.
- Long descriptions remain below approximately 65 characters per line.

### Color and Material

- Base: warm ivory and limestone.
- Text: graphite and near-black.
- Secondary text: mushroom gray.
- Selected states: near-black rule and a faint linen tint.
- Approval notice: a very light natural sage/stone wash, with no gradient.
- Artwork and natural-oak imagery provide the dominant color.

### Shape

- Square or nearly square controls.
- Minimal border radius only where the existing site already uses it.
- No glossy gradients, pill-heavy UI, or nested cards.

## Desktop Hero

### Artwork Gallery

The desktop gallery uses a left rail of four to six thumbnails. The selected thumbnail has a strong graphite outline. The dominant image fills the rest of the gallery column and uses `object-cover` only when the crop is known to preserve the artwork; otherwise use `object-contain` on the warm gallery surface.

The gallery order remains role-aware:

1. Room visualization.
2. Full artwork.
3. Texture detail.
4. Canvas edge or frame detail.
5. Additional listing images, if present.

Changing a thumbnail updates the dominant image, its accessible label, and its visualization badge. The control remains keyboard accessible and exposes `aria-pressed`.

### Purchase Panel

Order the content as follows:

1. Category and medium eyebrow.
2. Large serif title.
3. Artist byline.
4. One concise material/room description.
5. Price and existing international price disclosure when applicable.
6. Truth-aware product tag row.
7. Selected-size row and `Size & room guide` link.
8. Presentation options.
9. Studio-photo notice.
10. Primary purchase action.
11. WhatsApp support action.
12. Four reassurance rows.

## Product Tags

Tags use light outlines and compact type. A maximum of three tags appear. They must be derived from safe listing facts and never invented for a specific product.

Preferred labels:

- `Original Artwork` when the listing is an original physical artwork.
- `Hand-Painted Texture` when the listing's medium, surface, or handmade note supports that wording; otherwise `Hand-Painted`.
- `Certificate Included` only when certificate availability is configured; otherwise omit it or show a truthful alternative such as `Collector Support`.

The local Quiet Meridian fixture uses `Original Artwork`, `Hand-Painted Texture`, and `Certificate Included` to demonstrate the selected design.

## Size and Presentation Controls

### Size

The current artwork dimensions appear in a full-width bordered selector row. The row links to the existing size guide.

- If the artwork has one configured size, render it as a static selected row, not a fake dropdown.
- If future structured size variants exist, render an accessible selector using real configured values.

### Presentation

Presentation options become stacked horizontal rows instead of the current three-card grid.

Each row includes:

- A real option thumbnail.
- Option name.
- One short supporting line when configured.
- A selected check mark or navigation chevron from a real icon library.
- A strong selected border and `aria-pressed` state.

Default supporting text for the local fixture:

- `Rolled Canvas` — `Ships rolled in a protective tube`.
- `Stretched` — `Ready to hang`.
- `Natural Oak Float Frame` — `Warm oak frame with a float mount`.

Production listings without configured presentation choices retain the existing confirmation fallback and never imply that unavailable formats can be purchased.

## Purchase and Trust Content

The primary CTA remains a full-width near-black `Add to cart` button when direct checkout is available. When it is not available, the existing invoice or support path remains authoritative.

The secondary action is a restrained `Ask on WhatsApp` link or outlined button. It must not compete visually with the primary CTA.

The approval notice reads `Studio photos before shipping` with supporting copy `Review the surface and framing before dispatch.` It is presented as a service promise only where YiiArt can honor it; otherwise use `Request studio photos before shipping`.

Four reassurance rows appear below the actions:

- `One-of-a-kind original` or `Made for you`, selected from listing availability and production mode.
- `Free worldwide shipping` when the site's current shipping promise applies.
- `30-day returns` using the existing return-policy wording.
- `Secure payment` using the existing checkout capability.

Rows may reveal one sentence of supporting copy. They use the closest existing or installed outline icon set; no handcrafted SVG, emoji, or text-symbol icons.

## Similar Artworks Strip

Move the existing related-artwork experience immediately below the hero and present it as a quiet horizontal strip titled `Visually Similar Artworks`.

- Use existing related artwork data and links.
- Show image, title, medium/category, size, and price.
- Do not duplicate the same strip later on the page.
- Desktop begins the strip at the first fold; mobile places it after the purchase panel and before long-form details.

## Responsive Behavior

At widths below the desktop breakpoint:

- Stack gallery before purchase content.
- Convert the thumbnail rail to a horizontal, touch-scrollable strip.
- Keep all presentation rows full width.
- Retain the fixed bottom purchase bar.
- Raise the WhatsApp support widget above the purchase bar.
- Preserve the footer safe area.
- Avoid horizontal page overflow at `390px`.

The mobile first screen should show the dominant artwork/room image and enough purchase context to establish title and price without compressing the image unnaturally.

## Components and Data Flow

### `ArtworkHeroGallery`

- Add responsive rail orientation.
- Preserve role ordering and active-image state.
- Keep thumbnail and dominant-image alternative text behavior.

### `ArtworkPurchaseExperience`

- Accept a maximum-three-item tag list.
- Accept presentation-option supporting text.
- Render horizontal presentation rows.
- Render size-guide link and studio-photo notice.
- Render reassurance rows with optional expanded copy.
- Preserve preview purchase feedback, real cart behavior, invoice fallback, and synchronized mobile purchase action.

### `ArtworkSupportingSections`

- Extract or reorder the related-artwork block so it appears immediately after the hero.
- Preserve the material story, details, sizing guide, customization, shipping, FAQ, and reviews below it.

### Page Resolver

The page composes safe production tags from existing artwork facts and passes fixture-specific content only in local preview mode. Structured production data always wins over visual-demo defaults.

## Error and Empty States

- Missing gallery images use the existing no-image state.
- One image hides unnecessary thumbnail controls.
- Missing presentation options show the existing confirmation fallback.
- Missing certificate data hides the certificate tag.
- Missing related artworks hides the similar-art strip.
- A sold or non-checkout artwork never exposes an active add-to-cart path.
- Preview mode never calls a real payment endpoint.

## Accessibility

- Selected gallery and presentation controls expose `aria-pressed`.
- Expandable reassurance rows expose `aria-expanded` and remain keyboard operable.
- Focus rings use a visible graphite outline and offset.
- Images retain descriptive alternative text.
- Color is never the only selected-state signal.
- The mobile purchase bar does not cover footer content.

## Testing and QA

Implementation follows test-driven development.

Required automated coverage:

- Responsive rail class and role-aware gallery behavior.
- Truth-aware tag resolution and certificate omission.
- Presentation supporting copy and selected state.
- Static single-size behavior and size-guide link.
- Preview cart feedback and real cart-item propagation.
- Invoice fallback.
- Related-art strip placement and empty-state omission.
- Mobile support-widget and footer safe-area regressions.

Required visual QA:

- Desktop at `1440 × 1024`.
- Mobile at `390 × 844`.
- Reference, selected mock, and implementation reviewed together.
- No open P0, P1, or P2 issues before handoff.
- `design-qa.md` updated with final evidence and result.

## Acceptance Criteria

1. The live generic artwork route uses the Natural Studio composition without relying on the preview fixture.
2. Desktop uses a vertical thumbnail rail and a room-first gallery.
3. Mobile uses a horizontal thumbnail strip and has no horizontal overflow.
4. Product tags are truthful and never fabricate certificate, urgency, review, or availability claims.
5. Presentation choices are real, selectable rows with thumbnails and supporting text.
6. The primary cart/invoice path and secondary WhatsApp path work.
7. Studio-photo, shipping, returns, and payment content matches actual YiiArt service behavior.
8. Visually similar artworks appear directly after the hero when data exists.
9. Automated tests, copy checks, lint, production build, and design QA pass.
