# YiiArt 2.1 Visual Migration Design

## Goal

Make YiiArt feel like the approved 2.0 art-first storefront across its core shopping journey while preserving the existing production commerce, content, and operations capabilities.

## Product Positioning

YiiArt sells made-to-order, hand-painted canvas works for English-speaking collectors and interior-focused shoppers. The site should lead with large interior images and calm editorial composition, then make the purchase path clear without looking like a generic marketplace.

The product image is the primary sales surface. Generated room-scene images may illustrate intended composition, palette, and scale. The product detail page will disclose lower in the page that each canvas is hand-painted to order and that brushwork and minor details naturally vary.

## Visual Reference and Non-Negotiables

The existing `yiiart-preview` 2.0 project is the visual source of truth. The migrated production site must preserve its:

- warm paper palette, near-black/forest contrast sections, and muted clay accents;
- large, light-weight display typography with short line lengths;
- dark editorial header and concise navigation;
- full-bleed room-scene hero with restrained overlay copy;
- image-led three-column desktop work grids and two-column mobile grids;
- generous vertical rhythm, thin rules, low-radius surfaces, and understated hover motion;
- clear distinction between `New Collections` and legacy `Artist Collection` work.

The site must not retain an unrelated 1.0 visual shell around a 2.0 page. Header, footer, page backgrounds, controls, card language, and typographic scale all belong to the 2.0 system.

## Scope

### 1. Shared shell and visual foundation

- Replace the current fixed, dense light header with the 2.0 dark header treatment.
- Retain functional search, language/currency controls, cart, wishlist, account access, responsive menu, and translated labels.
- Rebuild the footer around the 2.0 editorial layout while retaining links required for policy, contact, account, and SEO routes.
- Establish shared CSS tokens for paper, ink, muted copy, forest, clay, rules, content width, gutters, display type, interactive focus state, and reduced-motion behavior.
- Keep the header usable at desktop and mobile sizes without competing controls or overlap.

### 2. Homepage

- Replace the current 1.0 section/card home page with the 2.0 sequence: room-scene hero, featured work grid, room discovery, studio process, artist collection, custom commission callout, trust evidence, and FAQ.
- Feed featured and collection blocks from approved public Sanity artworks rather than preview-only fixtures.
- Use the available generated room-scene images as hero and discovery imagery; never show an empty decorative image tile.
- Keep working paths for shop, room/style browsing, artist collection, custom commission, and contact.

### 3. Catalogue and collection pages

- Apply the same image-first grid, filters, collection tabs, typography, and controls to `/artworks` and collection routes.
- Preserve public-artwork gating, existing search indexing, filters, price display, locale support, and legacy artist collection separation.
- Make the collection switch visible without giving legacy material equal visual weight to new collections.

### 4. Artwork detail page

- Keep 2.0 gallery and purchase-panel hierarchy: image/gallery first, purchase choices second, specification/story/support content below.
- Preserve size, framing, made-to-order variant selection, cart, checkout hand-off, reviews, artist context, related works, structured data, and SEO metadata.
- Display `Hand-painted to order` near the purchase options for relevant products.
- Place this low in the detail page, after core product information and before FAQ/support material:

  > Listing images illustrate the intended composition, palette, and room scale. Each canvas is hand-painted to order, so brushwork and small details will naturally vary.

- Do not describe generated scene images as customer photography, an in-home photograph, or an exact reproduction.

### 5. Cart and checkout presentation

- Preserve the already-tested cart, order, Stripe, PayPal, invoice, login, and server-side validation behavior.
- Align layout, typography, buttons, summaries, and confirmation states with the 2.0 visual system without changing payment contracts or order data.

## Content and Image Strategy

### Image hierarchy

1. Generated room scene: default hero, collection, and card image when available.
2. Generated product scene or detail crop: product detail supporting gallery image.
3. Actual hand-painted work/process image: trust, texture, packaging, and commission context.
4. Neutral fallback: only when no approved image exists; it must be an intentional simple surface, not a fake artwork.

### Data rules

- Continue to render only artworks that meet the current public rights and migration status checks.
- Retain `original` and `hand_painted_to_order` production models.
- Keep original artist work in its separate collection path so it does not disrupt the new collection's visual or commercial structure.
- Use existing Cloudflare/Sanity image fields; introduce additional asset metadata only when a page needs a deterministic `hero`, `roomScene`, or `detail` image role.

## Functional Boundaries

Preserve, test, and do not regress:

- Sanity publication controls and content migration status;
- product sizes, finishes, price calculation, cart variant keys, and server-side checkout validation;
- Stripe, PayPal, and invoice checkout paths;
- search, locale controls, wishlist, authentication, orders, admin entry points, sitemap, metadata, and analytics;
- responsive navigation, keyboard focus, touch targets, and reduced-motion support.

Do not build new payment, customer-review, inventory, or image-generation infrastructure during the visual migration. Asset generation and bulk product enrichment remain a separate content-production workstream once the presentation pattern is approved.

## Implementation Structure

The work is divided into independently testable visual layers:

1. Shared visual tokens and shell.
2. Homepage and reusable editorial sections.
3. Catalogue, collection, and card system.
4. Detail gallery, purchase hierarchy, and disclosure.
5. Cart and checkout skin.
6. Browser-based visual comparison, interaction testing, automated tests, and deployment verification.

Each layer must use the production codebase and existing Sanity/publication rules. The old 2.0 preview is a reference, not a second storefront to deploy.

## Acceptance Criteria

### Visual

- At desktop and mobile widths, the home, catalogue, detail, cart, and checkout pages read as one 2.0 system rather than a mix of two designs.
- The header, footer, spacing, type scale, buttons, cards, and controls use the same palette and interaction language.
- The home hero and product grids are image-led; no dense text wall competes with artwork imagery.
- The product disclosure is present below the initial purchase area and is readable without being promoted as the headline.

### Functional

- New-collection and artist-collection tabs filter correctly.
- A made-to-order product can select a permitted size/finish, enter the cart, and reach every enabled payment hand-off.
- An original product remains limited to quantity one.
- Search, account, cart, wishlist, language/currency controls, and mobile menu remain reachable from the new shell.
- Pages with missing images show an intentional empty state and do not break layout.

### Quality

- Existing automated tests pass, with new tests for any extracted visual/data mapping logic.
- Production build completes without errors.
- Same-viewport comparisons are performed against the 2.0 reference for home, catalogue, and detail pages before release.
- Keyboard focus is visible and reduced-motion users do not receive disorienting movement.

## Release Strategy

Complete the migration on `codex/yiiart-2-integration`, validate it locally, and review it against the original 2.0 reference before merging. Publish only after the visual comparison and core shopping-path checks pass. Existing 1.0 production remains the rollback point until the new deployment is verified.
