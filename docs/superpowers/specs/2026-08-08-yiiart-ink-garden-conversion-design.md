# YiiArt Made-to-Order Catalog and Ink Garden Launch Design

## Objective

Turn YiiArt's current catalog into a coherent, trustworthy made-to-order art store, then launch the first complete six-product collection, Ink Garden, as the merchandising foundation for the homepage, collection pages, and product recommendations.

The program must preserve existing product URLs, cart behavior, checkout, payment integrations, customer data, and product records. It must not create fake reviews, fake sales counts, fake discounts, unsupported delivery promises, or copyrighted product imagery.

## Approved Direction

The approved commercial direction is:

- All 63 current artworks are repeatable, hand-painted-to-order designs.
- Pricing should sit near the MesonArt benchmark rather than retain the current high area rate.
- Products should offer six to ten common sizes where the composition supports them.
- The storefront should present rolled canvas, stretched canvas, and five frame colors, while respecting the existing checkout constraint described below.
- The first fully merchandised collection is Ink Garden.
- Each launch product uses an eight-image and one-video media package.
- The homepage, collection page, and product page use real collection content instead of unverified Best Sellers, sales counts, or reviews.

## Current-State Constraints

- The source-of-truth branch is `main`. It is synchronized with `origin/main` at commit `a719cef` when this design was written.
- The currently published experience appears to include work from the divergent `origin/feat/sprint0-mesonart-design-spec` branch. That branch must not be merged wholesale because it contains unsupported promotional and social-proof content.
- Sanity contains 63 artworks. All 63 currently lack an explicit `collectionType` and `productionModel`.
- Most records lack normalized physical `widthCm` and `heightCm`; physical dimensions must be parsed from the real `dimensions` field or supplied by a reviewed decision file. Image pixel dimensions are never artwork dimensions.
- Existing product media import records correctly contain both the Cloudflare R2 object `key` and public `url`. The storefront already has an approved-media fallback path.
- Existing checkout validation treats size price plus finish price as an additive combination. It cannot represent a size-dependent finish multiplier without changing checkout logic.
- The project brief prohibits modifying checkout or payment logic in this program.

## Source and Deployment Strategy

- Build every release from `main` or a short-lived branch based on `main`.
- Do not merge the divergent storefront branch wholesale. Port only reviewed ideas or files that satisfy this specification.
- Deploy each release to a preview environment first and compare the preview with current production on desktop and mobile.
- Promote the reviewed mainline build to production only after content-integrity, catalog, cart-regression, and responsive checks pass.
- After promotion, verify that the production deployment source points to the reviewed mainline commit and that unsupported social proof, discounts, and policy promises are absent.

## Scope and Release Sequence

This design is one coordinated program delivered in four gated releases. Each release is independently deployable and must pass its own verification before the next begins.

### Release 1: Catalog integrity and migration

1. Remove or replace unsupported global claims such as unconditional free worldwide shipping, fixed 30-day returns, fixed refund timing, guaranteed certificates, and any unverified Best Sellers or sales language.
2. Add a versioned made-to-order catalog configuration for size profiles, rolled-canvas pricing, finish estimates, and quote thresholds.
3. Produce a dry-run migration report for all 63 artworks.
4. Back up the 63 source documents before any write.
5. Apply only reviewed, idempotent Sanity patches.
6. Hide empty or under-populated collections from primary navigation while preserving their URLs.

### Release 2: Ink Garden products and media

1. Assign the six approved products to the Ink Garden series.
2. Complete and approve the eight-image and one-video media package for each product.
3. Apply made-to-order copy, size options, rolled-canvas prices, finish quote options, room tags, and related-product ranking.
4. Publish products only when their rights, copy, pricing, physical dimensions, and required media pass validation.

### Release 3: Storefront merchandising

1. Re-merchandise the homepage around Ink Garden and real featured products.
2. Add the Ink Garden collection content within the existing `/collections/[slug]` route.
3. Refine product pages around media proof, made-to-order variation, size guidance, and rolled-versus-quote finish handling.
4. Keep related products series-first, then style, room, orientation, and color.

### Release 4: Verified growth systems

1. Import only attributable, permission-cleared reviews from prior stores or external marketplaces.
2. Keep public sales counts and Best Seller labels disabled until real order data supports them.
3. Complete GA4 commerce and lead-event verification without transmitting personal information.
4. Treat the Trade Program as a separate follow-on release after the catalog and inquiry workflow are stable.

## Catalog Model

### Production and publication fields

The final target state for each reviewed artwork is:

- `productionModel: "hand_painted_to_order"`
- `collectionType: "new_collection"`
- `rightsStatus: "approved"` only after the artwork and media are confirmed as owned or licensed for storefront use
- `migrationStatus: "ready"` only after required data validation passes
- `allowCheckout: true` only when the record has reviewed prices, valid rolled-canvas sizes, an appropriate shipping profile, and an explicit operator approval

The migration must never mass-set `rightsStatus`, `migrationStatus`, or `allowCheckout` merely because a document exists. Records that fail a gate remain unchanged and appear in the report with a reason.

### Series fields

Add two focused fields to the artwork schema:

- `seriesSlug`: stable primary merchandising series, such as `ink-garden`
- `seriesRank`: integer ordering within that series

One primary series is sufficient for the first release. Existing category, style, room, color, and orientation fields remain available for cross-collection discovery.

### Category normalization

- Map legacy `Textured Art` values to `Texture`.
- Keep `Abstract`, `Landscape`, `Figurative`, and `Minimalist` as meaningful catalog categories. Add `Figurative` to the Sanity category options rather than silently rewriting those products as portraits.
- Preserve existing non-empty style, color, and room tags.
- Fill missing tags through an explicit review decision file. Do not generate unreviewed descriptive claims into production data.

### Physical dimensions

The migration uses this precedence:

1. Reviewed `widthCm` and `heightCm` from the decision file.
2. Parsed values from the existing physical `dimensions` string.
3. No patch when the physical size is ambiguous.

Image width and height are used only for image layout. They are never copied into artwork dimensions. Portrait and landscape records are validated against orientation before a patch is accepted.

## Size Profiles

The global configuration exposes these visible size ladders. A hand-painted recreation may adjust spacing and composition to the selected proportions; the storefront never stretches or mechanically crops the original image.

- Square: `60x60`, `70x70`, `80x80`, `90x90`, `100x100`, `120x120`, `140x140`, `160x160`, `180x180` cm.
- 2:3: `50x75`, `60x90`, `70x105`, `80x120`, `90x135`, `100x150`, `120x180`, `140x210` cm. Landscape products swap width and height.
- 3:4: `45x60`, `60x80`, `75x100`, `90x120`, `105x140`, `120x160`, `135x180`, `150x200` cm. Landscape products swap width and height.
- Near-square: `50x60`, `60x70`, `70x80`, `80x90`, `90x100`, `100x120`, `120x140`, `140x160` cm. The per-product decision file sets portrait or landscape orientation.
- Panoramic: `30x90`, `40x120`, `50x150`, `60x180`, `70x210`, `80x240` cm.

Profile assignment is based on reviewed physical proportions and composition suitability. It is not inferred from a photograph's pixel ratio alone.

## Pricing and Finish Handling

### Benchmark pricing

All catalog calculations are versioned in one configuration module and rounded to the nearest CNY 10:

```text
rolledPriceCny = round10(widthCm * heightCm * 0.48)
stretchedEstimateCny = round10(rolledPriceCny * 1.70)
framedEstimateCny = round10(stretchedEstimateCny * 1.05)
```

These are benchmark-led target prices because no verified cost table exists. The migration defaults `allowCheckout` to false. Direct checkout is enabled record by record only after the operator confirms that the target price and shipping profile are commercially acceptable.

### Finish options

The customer-facing finish set is:

1. Rolled canvas
2. Stretched canvas
3. Black float frame
4. White float frame
5. Natural wood float frame
6. Gold float frame
7. Silver float frame

Only rolled canvas is written into the existing checkout-compatible finish data during this program. It uses the authoritative `standardSizes.priceCny` values and the current cart and checkout flow without code changes to checkout validation.

Stretched and framed options are displayed as quote choices with the benchmark estimate and a clear `Request this finish` action. The final invoice confirms finish availability, packaging, and delivery. This resolves the conflict between size-dependent finish pricing and the explicit requirement not to change checkout or payment logic.

### Checkout and quote boundaries

- Rolled canvas with a longest side of 210 cm or less may be approved for direct checkout.
- Rolled canvas above 210 cm uses `Request Shipping Quote`.
- All stretched and framed selections use the quote path in this program.
- No quote-only combination is inserted into `standardSizes` or `frameOptions`, so the existing checkout cannot accept it accidentally.
- A future project may add variant-aware checkout only with explicit approval.

## Safe Sanity Migration

Create a catalog migration workflow with `--dry-run` as the default and `--apply` as an explicit action.

### Inputs

- Live Sanity artwork documents.
- Versioned global catalog configuration.
- A reviewed JSON decision file keyed by artwork `_id` or slug.
- Existing product-media audit decisions where available.

### Dry-run outputs

- Source and proposed value for every changed field.
- Parsed physical dimensions and orientation validation.
- Assigned size profile and calculated rolled prices.
- Category and tag normalization.
- Series assignment.
- Publication, rights, migration, and checkout gates.
- Warnings for ambiguous dimensions, missing rights approval, incomplete copy, incomplete media, or unsupported shipping configuration.

### Apply behavior

- Export a timestamped backup before the first patch.
- Patch by immutable Sanity `_id`, never by title.
- Verify the expected slug before applying each patch.
- Use deterministic array keys so reruns do not duplicate sizes or media.
- Preserve titles, descriptions, slugs, images, price history, review references, and unknown fields.
- Stop a record on validation failure without blocking safe records.
- Print applied, skipped, and failed counts and a machine-readable result file.

## Collection Visibility

Primary navigation shows only collections with at least four publicly visible products. The count uses the same publication filter as the collection grid.

- Empty and under-four collection routes remain accessible and retain their canonical URLs.
- These routes show their existing SEO copy and a helpful path to All Artworks or Custom Painting rather than a broken empty grid.
- Header and footer receive visible collection links from a server-side navigation helper. Existing account, search, wishlist, cart, legal, and policy links remain unchanged.
- `Best Sellers` is not rendered unless a later verified-data release explicitly enables it.

## Ink Garden Launch Collection

The collection slug is `ink-garden`, using the existing dynamic route at `/collections/ink-garden`.

| Rank | Existing slug | Product role | Format | Primary room use | Current media state |
| --- | --- | --- | --- | --- | --- |
| 1 | `green-rain-study` | Series hero | Portrait | Entryway, office | Main image only |
| 2 | `rain-garden-lines` | Commercial core | Square | Living room, bedroom | Main image only |
| 3 | `pale-leaves` | Soft neutral | Near-square | Bedroom, reading area | Six product-media records |
| 4 | `green-reflection` | Color anchor | Square | Living room, dining room | Main image only |
| 5 | `green-river-horizon` | Panoramic statement | Panoramic | Sofa wall, dining room | Six product-media records |
| 6 | `mint-field` | Accessible entry | Portrait | Office, entryway | Seven product-media records |

Existing titles and slugs remain unchanged. Ink Garden is a merchandising series, not a claim that all six physical paintings are identical editions.

## Media Standard

Each launch product targets this storefront order:

1. Clean front view.
2. Real original or studio photograph.
3. Texture detail one.
4. Texture detail two.
5. Angle or edge view.
6. Living-room scene.
7. Secondary room scene appropriate to the product.
8. Scale reference.
9. Ten-to-twenty-five-second process video with a real poster image.

All media must be owned, licensed, or created from YiiArt's own artwork. A room composite may use a real YiiArt artwork image, but its color, crop, orientation, and relative scale must remain truthful. Generated concept art is not published as a physical product image.

Product media stays in Cloudflare R2 and uses the existing `productMedia` schema, storefront approval flag, provenance note, stable object key, public URL, descriptive alt text, and deterministic display order.

An Ink Garden product is eligible for the homepage hero or principal campaign placement only after all required media roles are approved. Incomplete products may remain accessible but are not presented as complete campaign products.

## Storefront Merchandising

### Homepage

Reuse `EditorialHome` and the existing visual system. The homepage order becomes:

1. Ink Garden hero using an approved real room scene.
2. Featured Ink Garden products.
3. Shop by format: square, portrait, panoramic, and large wall art.
4. Custom Painting Service.
5. Real studio process.
6. Size Guide.
7. Trust and policy summary using supportable language.
8. FAQ.

Use `Featured Collection`, `Featured Artworks`, or `New Collection`; do not use `Best Sellers` without verified sales data. Review and customer-photo sections render only when approved records with display permission exist.

### Collection page

Extend the existing collection route and copy model to support a `seriesSlug` filter as well as category-based marketing collections.

The Ink Garden page includes:

- H1 and a natural English introduction.
- The six products in `seriesRank` order.
- Existing filter and sort behavior.
- Format, room, and size guidance.
- Buying guide and made-to-order variation explanation.
- Internal links to relevant populated collections and Custom Painting.
- Visible FAQ content with matching FAQ structured data.

Pagination and current URLs remain unchanged.

### Product page

Reuse `ProductGallery`, `ProductPurchasePanel`, product disclosures, policy content, FAQ, and related-product components.

The purchase sequence is:

1. Product title and hand-painted-to-order label.
2. Eight-image and one-video gallery.
3. Rolled-canvas size selection and authoritative price.
4. Direct Add to Cart only when the record is explicitly approved.
5. Stretched and frame quote choices with benchmark estimates.
6. Made-to-order variation note.
7. Artwork details and materials.
8. Size and room guide.
9. Shipping, damage, and returns summary using editable policy content.
10. FAQ.
11. Related products.

Related ranking uses the same series first, then category/style overlap, room overlap, color overlap, and orientation. It never uses invented popularity.

## Trust, Reviews, Sales, and Growth Data

### Immediate trust content

Replace unsupported promises with statements that match the project brief:

- Hand-painted to order.
- Custom size and color support.
- Worldwide delivery options where carrier service is available.
- Careful packaging.
- Damage support after photo and packaging review.
- Secure payment through the existing providers.

### Review migration

Reuse the existing verified-review workflow. Add provenance fields for imported reviews: source platform, source review ID, source URL when available, original review date, import batch ID, and permission evidence. Overall rating remains required; category sub-ratings become optional because external platforms may not provide them.

Imported reviews default to `pending`, `displayPermission: false`, and `photoPermission: false`. Approval requires an attributable source and display permission. Review text is stored faithfully; any translation is labeled separately rather than replacing the original.

### Sales claims

This program does not publish product sales counts or Best Seller labels. Existing paid, non-refunded order data may later support private merchandising rankings, but public claims require a separately approved rule and verified source data.

### Analytics and Trade Program

The existing GA4 property uses measurement ID `G-8B8R7YY67Q`. The later growth release verifies product-list views, product views, item selection, rolled Add to Cart, custom-painting leads, quote requests, and WhatsApp clicks. No event sends names, email addresses, room photos, message text, or other personal data.

The Trade Program is intentionally deferred until product pricing, production capacity, shipping handling, and lead response are stable. It is not added as an empty navigation destination in the first three releases.

## Data Flow and Failure Handling

1. Sanity remains the source of product facts, publication state, reviewed prices, and media metadata.
2. Cloudflare R2 remains the source of approved product images and videos.
3. Storefront builders normalize Sanity data into existing product and collection view models.
4. The cart receives only an approved rolled-canvas size and authoritative Sanity price.
5. Quote selections go to the existing invoice, custom request, email, or WhatsApp paths and never enter checkout as a direct-price variant.

Failure behavior is conservative:

- Missing or invalid price: disable Add to Cart and show a quote action.
- Missing required media: use current safe image fallbacks, but exclude the product from campaign hero placement.
- Missing collection products: hide the link from primary navigation and retain the route.
- Sanity read failure: render current error or empty states without fabricated products.
- Migration validation failure: skip the record and report the reason.
- R2 media failure: retain the existing Sanity image fallback.

## Expected Code Ownership

The implementation plan may refine filenames, but changes stay within these existing boundaries:

- Catalog schema: `src/sanity/schemas/artwork.ts`, `src/sanity/schemas/productMedia.ts`, `src/sanity/schemas/review.ts`.
- Catalog rules: new focused modules under `src/lib/storefront/` for size profiles, pricing, series, media completeness, and collection visibility.
- Migration workflow: a new dry-run/apply script under `scripts/` plus a reviewed decision file under `reports/` or another non-public operational path.
- Homepage: `src/app/page.tsx`, `src/components/home/EditorialHome.tsx`, and its existing module CSS.
- Collection: `src/app/collections/[slug]/page.tsx`, `src/lib/collections.ts`, and existing collection components.
- Product: `src/app/artwork/[slug]/page.tsx`, `src/components/storefront/ProductGallery.tsx`, `src/components/storefront/ProductPurchasePanel.tsx`, and storefront presentation helpers.
- Navigation and trust language: `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, and policy/content helpers.
- Reviews and analytics: existing review schemas/helpers and `src/lib/marketing-events.ts` in Release 4.

Checkout routes, payment routes, cart storage, order storage, PayPal, Stripe, and webhook handlers are out of scope.

## Verification

### Automated checks

- Unit tests for physical-dimension parsing and orientation validation.
- Unit tests for each size profile and benchmark price calculation.
- Unit tests that quote-only finishes never enter checkout-compatible options.
- Unit tests for migration idempotency, skip reasons, deterministic keys, and backup creation.
- Unit tests for collection visibility and Ink Garden series ordering.
- Unit tests for media completeness and related-product ranking.
- Public-copy checks for unsupported shipping, return, refund, discount, sales, and review language.
- Existing `npm test` and `npm run build`.
- Run `npm run lint`; if Next.js enters an unsupported setup flow, report that result without changing lint configuration opportunistically.

### Visual and live checks

- Desktop and mobile screenshots for homepage, `/collections/ink-garden`, and all six product pages.
- Gallery image and video selection, keyboard access, mobile purchase bar, and text overflow.
- Collection filter, sort, pagination, internal links, and empty-collection handling.
- Rolled Add to Cart regression without proceeding through payment.
- Quote actions for stretched and framed selections.
- Production checks confirming no fake reviews, sales counts, discounts, or unsupported policy promises.

### Data acceptance checks

- Exactly 63 artworks appear in the migration input report.
- Every applied dimension comes from physical data, never pixels.
- Exactly six reviewed products have `seriesSlug: "ink-garden"` with unique ranks 1 through 6.
- No existing slug changes.
- No existing product, review, order, customer, or media record is deleted.
- Sanity backup exists before an apply run.

## Operator Inputs Required Before Release

Implementation can proceed without a cost table, using the approved benchmark formula, but these operational gates remain explicit:

- Confirm which artwork records and product media are owned or licensed for publication before setting `rightsStatus: "approved"`.
- Approve each record's proposed dimensions, category normalization, and checkout status in the migration report.
- Supply or approve missing original/studio photos, texture details, edge photos, room scenes, scale references, and process videos for the six Ink Garden products.
- Confirm which stretched and frame finishes YiiArt can actually fulfill before they appear as quote choices.
- Confirm commercially acceptable production and shipping wording before enabling direct checkout.
- Supply review export data and display permission evidence before Release 4 review import.

## Acceptance Criteria

1. All 63 artworks have a reviewed migration outcome, and safe records reach the hand-painted-to-order target state without deleting or changing existing URLs.
2. Empty or under-four collections disappear from primary navigation but retain working routes.
3. Rolled-canvas sizes and prices come from one tested configuration and remain authoritative in the existing checkout flow.
4. Stretched and framed choices are visible as quote options and cannot be charged through checkout accidentally.
5. The six approved Ink Garden products retain their existing slugs and appear in the intended order.
6. Complete launch products show eight approved images and one real process video in the defined sequence.
7. Homepage, Ink Garden collection, product pages, and related products use real catalog data and honest labels.
8. Header, footer, trust blocks, and policies contain no unsupported shipping, returns, refund, sales, review, or discount claims.
9. Cart, checkout, payment, order, and webhook behavior remain unchanged.
10. Automated tests, production build, desktop QA, and mobile QA pass before deployment.
