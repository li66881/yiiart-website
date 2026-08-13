# YiiArt MesonArt-Aligned Product Detail Design

Date: 2026-08-12  
Status: Approved direction, awaiting written-spec review

## Objective

Bring YiiArt's artwork detail page closer to MesonArt's product-page hierarchy and conversion clarity while preserving YiiArt's own identity, real product data, cautious delivery language, and server-authoritative checkout.

The page must remain image-led, easy to scan, and credible for an English-market buyer ordering a hand-painted work. The implementation must not introduce countdowns, fake discounts, fabricated saves, sales counts, inventory activity, arrival dates, or third-party payment branding that YiiArt cannot verify.

## Reference and evidence

- Reference product: `https://www.mesonart.com/products/wabi-sabi-wall-art-tx012`
- YiiArt product: `https://www.yiiart.com/artwork/ink-garden-01`
- Audit folder: `D:/Documents/网站yiiart.com建设/audits/mesonart-product-detail-2026-08-12`
- Audit notes: `D:/Documents/网站yiiart.com建设/audits/mesonart-product-detail-2026-08-12/README.md`

## Selected direction

Use a complete conversion-focused layout:

1. Keep a dominant left gallery and a sticky right purchase panel.
2. Offer seven directly purchasable presentation choices for eligible made-to-order works.
3. Show finish choices as real image swatches with names and selection states.
4. Show the selected total in the primary add-to-cart control.
5. Provide a compact sticky purchase bar after the main purchase controls leave view.
6. Move long product information out of the right column and into full-width anchored sections below the main product area.
7. Preserve YiiArt's honest handmade, production, payment, packing, damage-support, and shipping language.

## Product-page information architecture

### Global header

Retain the current YiiArt header and catalog navigation. On desktop, it may compact to the current sticky header state while the buyer scrolls. No new promotional strip or sale countdown is introduced.

### Breadcrumb

Use one compact breadcrumb line immediately above the product area. Remove the separate `Back to artworks` line because it duplicates the breadcrumb and adds vertical space.

### Main product area

Desktop uses a two-column layout:

- Gallery: approximately 58–61% of the content width.
- Purchase panel: approximately 39–42%, sticky below the compact header.
- Gap: 36–52 px depending on viewport.

The gallery remains a vertical thumbnail rail plus a large square media stage. The primary image should be visually dominant, with neutral backgrounds and restrained radii. Thumbnail labels distinguish front view, room view, detail, edge, scale, and video where those roles exist.

The purchase panel contains only conversion-critical information:

1. Production model and save control.
2. Product title and artist.
3. A short description of no more than three visible lines on desktop before expansion.
4. Selected price and currency disclosure.
5. Size selection.
6. Presentation/finish selection.
7. Production or dispatch note.
8. Quantity.
9. Primary add-to-cart action with selected total.
10. Custom request and question actions.
11. Compact trust rows.
12. Two concise disclosure accordions.

Reviews, specifications, the full artwork story, placement guidance, customization, shipping, and related works move below the two-column area.

## Size selection

Size choices remain text cards because dimensions are easier to compare as text than as decorative images.

- Desktop: two-column grid.
- Mobile: two-column grid when labels fit; otherwise one column at very narrow widths.
- The selected card uses a dark border and an inset selected ring.
- Each card shows centimeters first. Inch conversion may appear as secondary text where reliable conversion data is available.
- A `Size guide` link sits beside the section label.
- Size options and prices remain derived from authoritative product data.

## Presentation and framing selection

Eligible made-to-order products expose these seven choices in this order:

1. Rolled canvas
2. Stretched canvas
3. Black float frame
4. White float frame
5. Natural wood float frame
6. Gold float frame
7. Silver float frame

### Visual behavior

- Each choice uses a real square or circular thumbnail showing the physical edge or frame treatment.
- Each control retains a visible text label; thumbnails never carry meaning alone.
- The selected option has a two-pixel dark outline, a visible selected indicator, and `aria-checked=true` through native radio behavior.
- Keyboard focus is independently visible and not replaced by the selected outline.
- The group heading reads `Choose a presentation`.
- A selected summary reads, for example, `Selected: Natural wood float frame`.
- If a finish adds cost, its control displays the incremental amount in the active store currency when that amount is available.
- A short `See framing details` disclosure explains rolled, stretched, and float-frame construction without promising materials or dimensions not present in product data.

### Asset source

Create seven reusable YiiArt-owned finish thumbnails. They must show a neutral cream artwork crop and the relevant canvas or frame edge under consistent studio lighting. They are UI assets, not product-specific depictions. They must be stored locally in the product-detail asset set, optimized for web delivery, and have descriptive alternative text.

### Pricing rules

- Rolled canvas remains the base size price.
- Stretched canvas uses the existing catalog calculation: rounded base price multiplied by `1.70`.
- Each float-frame option uses the existing catalog calculation: rounded stretched price multiplied by `1.05`.
- All visible totals are calculated from CNY source values and converted by the existing storefront currency layer.
- The browser may preview totals, but the checkout server must resolve the selected size and finish again from authoritative artwork data or the approved catalog fallback. Browser-submitted labels and prices are ignored.

### Eligibility and safe fallback

- The seven-option fallback applies only to eligible `hand_painted_to_order` products.
- Original artworks keep their as-listed presentation and do not receive generated frame choices.
- Explicit, valid product-specific frame options override the fallback when they intentionally define a narrower set.
- Invalid, negative, duplicate, or unknown finish data is rejected.
- If checkout cannot authoritatively price a selected presentation, that choice is not shown as directly purchasable; the buyer is routed to a quote instead.
- Delivery copy states that format and timing are confirmed by destination, selected size, presentation, and carrier route. No exact arrival date is generated without carrier data.

## Purchase actions

The primary button reads `Add to cart — {selected total}`. It remains pill-shaped, dark, and visually dominant.

The quantity control sits on the same row as the primary action on wide desktop when space permits; otherwise it remains directly above it. Made-to-order quantity stays capped by the existing cart rule. Originals remain quantity one.

Secondary actions are quieter outline controls:

- `Request custom size or color`
- `Ask an art advisor`

After add-to-cart, the existing confirmation remains announced through a polite live region. The cart line retains size and finish identity so two different presentations remain separate cart lines.

## Trust and reassurance

Use four compact icon-and-copy rows under the purchase action:

- Secure payment
- Hand-painted to order
- Careful packing
- Damage support

Icons come from the project's selected icon library, not custom drawings. Supporting copy is short, factual, and derived from existing policies. No trust badge claims certification unless a real certification source exists.

## Sticky purchase behavior

### Desktop

When the main add-to-cart area is no longer visible and a valid selection exists, show a compact bottom purchase bar containing:

- Small artwork thumbnail
- Product title
- Selected size and presentation
- Selected total
- `Add to cart` button

It hides while the main purchase action is visible and does not cover the footer. It respects reduced-motion preferences.

### Mobile

Keep the existing bottom purchase bar, but add selected size/presentation context and ensure it does not collide with cookie consent or floating support controls. The bar must remain usable at 200% zoom and account for safe-area insets.

## Full-width product information

Immediately below the main product area, provide an anchored navigation row:

- About the artwork
- Details & customization
- Shipping & returns
- Reviews

The navigation uses normal anchor links with sticky offset handling. It may become horizontally scrollable on mobile. It must not depend on JavaScript to reach content.

### About the artwork

Use an editorial two-column composition with the artwork story and one approved detail or room image. Copy is broken into short paragraphs with a maximum reading width around 62 characters.

### Details & customization

Combine material, medium, surface, handmade note, production guidance, size guidance, and presentation details into compact specification cards. Include the custom-painting action without repeating an oversized marketing section.

### Shipping & returns

Present production, dispatch format, tracking, returns, and damage support as concise accordions or cards. Link to the full policies. Copy must preserve the current distinction between production time and shipping time.

### Reviews

Show real review summaries and submitted reviews only. When no reviews exist, use the current honest empty state. Do not fabricate star ratings or review volume.

### Related artworks

Place related works after the information sections and before the final confidence/footer area. Use image-led cards with restrained metadata so they do not compete with the current product.

## Responsive behavior

- At tablet widths, the purchase panel stops being sticky and stacks below the gallery.
- At mobile widths, the gallery appears first, thumbnails scroll horizontally, and the product title/purchase controls follow.
- Finish swatches use a horizontally scrollable row or compact grid with labels retained.
- Long navigation and purchase elements never cause horizontal page overflow.
- Tap targets are at least 44 CSS pixels.

## Component boundaries

### `ProductGallery`

Owns product media selection, thumbnails, arrows, zoom/lightbox, media role labels, and gallery captions. It does not own price or finish state.

### `ProductPurchasePanel`

Owns the selected size, presentation, quantity, authoritative display total, cart action, custom/advisory actions, purchase trust, and purchase disclosures.

### `ProductFinishSelector`

A focused child component owns the finish radio group, thumbnails, selected summary, incremental price labels, and accessibility labels. It receives options and selection state; it does not calculate checkout prices itself.

### `ProductStickyPurchaseBar`

Owns desktop/mobile compact purchase presentation and observes whether the main purchase action is visible. It invokes the same cart action and never duplicates price calculations.

### `ProductDetailNavigation`

Owns anchored links and responsive scrolling. Content sections remain semantic sections on the page.

### Storefront product and checkout selection modules

Own finish fallback construction, finish pricing, validation, and server-side selection resolution. UI components consume normalized options and do not accept arbitrary browser prices.

## Data flow

1. The artwork record is loaded from Sanity.
2. `buildStorefrontProduct` normalizes product media, sizes, and eligible finish choices.
3. The purchase panel selects size and finish IDs and asks the selection module for the display total.
4. Cart state stores IDs, safe display labels, quantity, and preview price for immediate UI rendering.
5. Checkout sends product ID, size ID, finish ID, and quantity only.
6. The server reloads the artwork, rebuilds/validates eligible options, resolves the authoritative price, and rejects stale or unknown selections.
7. Checkout providers receive only the server-resolved line item.

## Error and edge handling

- Missing finish thumbnail: show the text control with a neutral existing asset; never show a broken image.
- Missing valid size or finish: disable direct cart action and show the invoice/quote route.
- Stale selection after data change: checkout returns an actionable availability message and cart remains intact for correction.
- Image failure: the gallery uses the existing valid fallback image behavior.
- Cookie banner and sticky purchase collision: purchase bar reserves bottom space or moves above the banner until consent is resolved.
- Reduced motion: selection, thumbnail, sticky-bar, and image transitions are disabled.

## Test and acceptance criteria

### Unit and integration tests

- Made-to-order fallback produces exactly seven ordered presentation choices.
- Originals do not receive generated presentation choices.
- Rolled, stretched, and framed calculations match the approved formulas and CNY rounding.
- Explicit valid product-specific finishes override fallback behavior.
- Invalid and unknown finishes fail closed.
- Server checkout ignores browser-provided labels and prices.
- Different size/finish selections produce distinct cart keys.
- Sticky purchase bar uses the same selected total and cart action as the main panel.
- Public copy check rejects fake promotion, scarcity, or arrival claims.

### Visual acceptance

- At the reference desktop viewport, the gallery and purchase panel have comparable balance to the captured MesonArt product page.
- All seven presentation controls show a real thumbnail, name, selected state, and keyboard focus state.
- The purchase CTA includes the selected total.
- Below the main area, content occupies the full page width without a large empty left column.
- Anchored detail navigation reaches all four named sections.
- Desktop and mobile sticky purchase bars do not obscure content, cookie controls, or footer actions.

### Functional acceptance

- A buyer can select every eligible size and presentation and see the total update.
- Adding to cart preserves the selected size and presentation.
- Cart and checkout show the same server-authoritative total.
- Custom request and art-advisor actions retain their current behavior.
- Gallery thumbnail switching and lightbox continue to work.

### Verification gate

Before release, run the full unit suite, copy check, TypeScript check, and production build. Capture the reference and local implementation at the same desktop and mobile viewports, compare them together, fix P0/P1/P2 differences, and record a passing design QA report before offering deployment.

## Explicitly out of scope

- Copying MesonArt source code or proprietary assets.
- Countdown timers, sale banners, fake savings, fake sales activity, fake scarcity, or unverified delivery dates.
- Shop Pay, Klarna, Afterpay, or other payment branding unless YiiArt actually enables that provider.
- New backend inventory, review, or delivery-estimate systems.
- Changing homepage, catalog page, cart layout, or checkout flow beyond what is required to preserve the new product presentation selection.
