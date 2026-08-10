# YiiArt Optimized Storefront Recovery Design

## Objective

Restore the approved MesonArt-inspired storefront presentation from
`origin/feat/sprint0-mesonart-design-spec` on top of the current `origin/main`
without reverting current catalog, media, checkout, policy, SEO, or security
work.

The result must look and behave like the optimized storefront while keeping
the current Sanity and R2 data contracts authoritative.

## Recovery Strategy

This is a forward port, not a branch merge or production rollback.

- Current `origin/main` remains the source of truth for data access, routes,
  product eligibility, prices, checkout, payment, policy copy, SEO, and media.
- The optimized branch is the source of truth only for visual composition,
  spacing, storefront density, gallery interaction, option presentation, and
  responsive behavior.
- Old optimized-branch files are not copied wholesale. Each visual unit is
  adapted to current component props and current product models.
- Existing URLs remain unchanged.

## Storefront Scope

### Global Shell

- Restore the denser two-level storefront navigation and compact header rhythm.
- Preserve dynamic catalog-link filtering from `CatalogNavigationProvider`.
- Keep the current WhatsApp contact, account, search, wishlist, cart, locale,
  and currency behavior.
- Restore the optimized footer density while preserving current support links
  and policy routes.

### Homepage

- Restore a full-width, image-led carousel hero with compact controls.
- Use current hero content and current artwork images.
- Do not publish the old hard-coded `40% off`, countdown, or sale claims.
- Restore dense category, style, room, best-seller, new-arrival, custom-painting,
  trust, studio-process, and FAQ merchandising rhythm where current data exists.
- Product rails and cards remain driven by current Sanity results; no fake
  products, reviews, or sales statistics are introduced.

### Artwork And Collection Discovery

- Restore the optimized filter chrome, compact product-card density, image
  treatment, and responsive grid rhythm.
- Preserve current collection handles, pagination, SEO copy, dynamic empty-link
  filtering, physical-dimension safeguards, and catalog publication rules.
- Preserve current `productMedia` ordering and R2 image selection.

### Product Detail

- Restore the optimized multi-view gallery, thumbnail treatment, lightbox,
  purchase-panel density, size and finish controls, quantity controls for
  made-to-order products, trust row, accordion rhythm, and mobile sticky action.
- Current Sanity data remains authoritative for title, media, physical size,
  standard sizes, frame options, price, processing copy, shipping profile,
  availability, and related products.
- `hand_painted_to_order` products may enter direct checkout only when the
  current server and storefront availability rules allow it and
  `shippingProfile` is `Ships rolled`.
- Original artworks retain quantity one and their current availability rules.
- The gallery must support current roles including `front`, `detail`, `angle`,
  `living_room`, `bedroom`, `dining_room`, `scale`, and future video media.

### Cart And Checkout Surface

- Restore optimized cart and purchase-button visual rhythm only.
- Do not replace `CartContext`, checkout selection validation, server-side price
  resolution, PayPal/Stripe integrations, order APIs, or webhook behavior.
- Do not change checkout URLs or payment logic.

## Content And Commercial Guardrails

- No hard-coded sale percentage, countdown, compare-at price, popularity count,
  review count, or inventory urgency unless supplied by current trusted data.
- No fake reviews or testimonials.
- No external copyrighted imagery.
- No unconditional shipping-time, return, damage, or refund promises.
- Current editable policy content remains authoritative.
- Existing Sanity documents and R2 objects are never deleted or rewritten by
  this recovery.

## Component Boundaries

- Global shell components consume current navigation and cart providers.
- Homepage merchandising consumes the existing artwork arrays prepared by the
  current server page.
- Discovery components consume current filter state and current artwork view
  models.
- Product-detail presentation consumes a normalized current product model and
  delegates cart mutations to existing cart actions.
- Checkout remains isolated from presentation code and validates all selections
  on the server.

## Responsive And Accessibility Requirements

- Desktop target: 1440 x 1024.
- Mobile target: 390 x 844.
- No horizontal overflow at either target.
- Header, filters, option controls, gallery, and sticky purchase actions must not
  overlap the WhatsApp support button.
- Interactive controls must have accessible names, keyboard focus, and stable
  dimensions.
- Product titles, prices, size labels, and navigation text must wrap without
  clipping.

## Verification

- Unit tests cover navigation filtering, homepage merchandising, media-role
  ordering, product availability, option selection, cart quantity rules, and
  preservation of current checkout contracts.
- Public-copy validation rejects forbidden fake claims and stale promotional
  text.
- TypeScript and the Next.js production build must pass.
- Visual QA checks the homepage, artwork listing, collection page, one generated
  made-to-order product, one original artwork, and the cart at desktop and
  mobile sizes.
- Production verification confirms current Sanity products and all four
  generated products still render and that no real payment is submitted.

## Release Plan

1. Restore the global shell and homepage presentation.
2. Restore discovery and collection presentation.
3. Restore product-detail presentation against current product contracts.
4. Restore cart presentation without changing checkout logic.
5. Run full automated and visual verification, then merge through a reviewed PR.
