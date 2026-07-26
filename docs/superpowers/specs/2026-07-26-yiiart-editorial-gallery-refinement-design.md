# YiiArt Editorial Gallery Refinement Design

## Objective

Refine the published YiiArt 2.1 storefront into a quieter, more premium editorial gallery while preserving the existing shopping, discovery, custom-order, account, and checkout functionality.

## Audience and outcome

The primary customer is an English-speaking home-art buyer who needs to judge an artwork quickly, imagine it in a room, understand that it is hand-painted to order, and feel safe proceeding to purchase or requesting advice.

The site should communicate this sequence clearly:

1. See the artwork and its room mood.
2. Understand its scale, price, and hand-painted status.
3. Choose a size or request room advice.
4. Buy with confidence, without reading repeated sales copy.

## Chosen direction: editorial gallery

YiiArt will use the existing dark-ink, warm-paper, muted-clay palette and image-led 2.0 foundation. The refinement is not a new brand or a high-animation fashion site. It is a restrained gallery treatment with generous whitespace, concise typography, measured motion, and fewer competing visual signals.

### Visual principles

- Artwork imagery has the highest visual priority on every commercial page.
- Large serif display type is reserved for page and artwork titles; utility copy stays compact and calm.
- Warm paper backgrounds, dark ink surfaces, thin rules, and muted clay accents remain the visual system.
- Motion is limited to short opacity, underline, and image-scale transitions; all movement honors `prefers-reduced-motion`.
- Cards use one clear title, one concise metadata line, and price. Tags only appear when they change a buyer decision.

## Scope

### 1. Header and footer hierarchy

- Keep all existing navigation destinations and account/cart access.
- Reduce visual competition in the desktop header by separating primary browse links from secondary utilities, reducing utility emphasis, and making the room-advice action the single supportive call to action.
- Retain the mobile menu and its current functional coverage.
- Group the footer into fewer visual clusters and soften low-priority links without removing legal, contact, support, or collection destinations.

### 2. Homepage editorial pacing

- Preserve the current hero, featured works, room browsing, studio process, custom-art, trust, and FAQ content.
- Make the hero image and its headline the strongest first impression; shorten supporting copy and preserve two actions with a clear primary/secondary relationship.
- Remove redundant headline phrasing and make each later section answer a different buyer question: discover, place, understand process, customize, trust, then ask.
- Increase image dominance in the featured-work and room sections; lower the density of supporting labels.

### 3. Artwork discovery

- Preserve tabs, filtering, sorting, counts, and current collection separation.
- Make the collection tab strip and sort control visually quieter and more intentional.
- De-emphasize filters with zero matching works and avoid rendering product-card badges that duplicate information already visible in the card.
- Use a consistent artwork card hierarchy: image, material/style, title, artist or dimensions, price.
- Keep artist-collection and custom-request distinctions, but present them once as a concise collection cue instead of repeated card noise.

### 4. Product detail purchase experience

- Keep gallery selection, size and finish selection, add-to-cart, custom request, WhatsApp question, disclosure, related works, shipping, return, and FAQ functionality.
- Make the gallery visually dominant and give the purchase panel a calmer fixed hierarchy: collection cue, title, artist, short description, price, options, creation reassurance, purchase action.
- Keep the lower-page handmade-variation disclosure, as previously approved, but shorten duplicate trust and delivery copy across the page.
- Consolidate long-form confidence content into fewer clearly named expandable or grouped sections: artwork details, room scale, handmade and shipping, and collector support.
- Keep primary checkout intent visible on mobile through the existing purchase bar, refined to match the new hierarchy.

### 5. Accessibility and responsive quality

- Retain semantic headings, labels, keyboard focus indicators, and readable contrast.
- Preserve functional link and button destinations.
- Ensure touch targets remain at least 44px on mobile controls.
- Add no motion that cannot be reduced by the existing motion preference rules.

## Explicit non-goals

- No change to payment, cart, account, checkout, Sanity data, pricing calculations, or product ordering logic.
- No new routes or content-management workflow.
- No fabricated artwork, room-scene imagery, or brand assets.
- No removal of the user-approved handmade-to-order disclosure.

## Acceptance criteria

1. Homepage, artworks, product detail, cart, and checkout retain their existing working routes and core actions.
2. The first viewport of home and product detail is led by an artwork image rather than support copy or controls.
3. Artwork cards display no more than four buyer-facing metadata elements outside the image.
4. Product detail has one clear primary purchase action and no duplicated trust paragraph in the initial purchase area.
5. Desktop navigation presents primary browsing and utility actions with visibly different emphasis; mobile navigation remains accessible.
6. Filtering, sorting, gallery selection, add-to-cart, and custom-order links continue to work.
7. Automated tests and production build pass; desktop and mobile visual checks cover the home, artwork discovery, and product-detail views.

## Risks and handling

- Existing content is information-rich and may resist visual reduction. The implementation will hide only redundant presentation layers, not product facts or buyer safeguards.
- Product-detail content comes from multiple components. Consolidation must be presentation-level first so that storefront behavior and data remain stable.
- Image quality is content-dependent. The refinement will improve framing and priority but will not stretch, synthesize, or substitute the existing artwork assets.
