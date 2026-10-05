# Room-Based Collection Pages for English SEO

## Context and goals

YiiArt's SEO focus is English first. Other languages may follow later; this change does not introduce translated collection routes or change the existing language experience. The goal is to make a small set of room-specific English collection pages accurately reflect the artwork catalog, improve useful internal navigation, and avoid indexable pages whose product inventory does not support their promise.

The current collection matcher supports category, series, and large-format rules, but not room tags. As a result, `/collections/abstract-art-for-living-room` currently selects by Abstract category alone, and `/collections/bedroom-wall-art` selects a set of categories rather than artworks explicitly tagged for bedrooms. Public Sanity inventory evidence shows 163 eligible artworks, including 155 explicitly tagged Living room, 137 Bedroom, 50 Dining room, and 116 Office. Abstract + Living room has 79 items. Entryway has 9 and Hospitality space has 2.

## User-approved direction

- English is the primary SEO language; localization is a later phase.
- Extend the existing marketing collection system, not a parallel page framework.
- Use explicit Sanity `roomTypes` as the source of truth for room-specific SEO pages. Do not use inferred rooms for indexable collection membership.
- Correct the existing living-room and bedroom collection membership; add focused Dining Room and Office pages.
- Do not create standalone Entryway or Hospitality SEO pages at current inventory levels.
- Keep the number of room pages curated and finite; do not generate every room-by-style combination.

## Proposed design

### Collection matching

Add optional `roomTypes` to `MarketingCollection` and to the public collection inventory projection. `matchesMarketingCollection` will support room matching and combine dimensions when present: a collection with both `categories` and `roomTypes` must satisfy both; a room-only collection must satisfy the explicit room tag. Existing category, series, and large-canvas collections retain their behavior. The interactive `/artworks` filter can continue its current inferred-room behavior; that inference must not enter room SEO collection matching.

Normalize stored room labels consistently with the canonical Sanity values (`Living room`, `Bedroom`, `Dining room`, `Entryway`, `Office`, `Hospitality space`). Missing, unknown, or inferred-only room values do not qualify for SEO collections.

### Page set and content

- Keep `/collections/abstract-art-for-living-room`, requiring both Abstract category and `Living room` room type. Current expected inventory: 79.
- Keep `/collections/bedroom-wall-art`, matching explicit `Bedroom` room type without the current category restriction. Current expected inventory: 137.
- Add `/collections/dining-room-wall-art`, matching explicit `Dining room` room type. Current expected inventory: 50.
- Add `/collections/office-wall-art`, matching explicit `Office` room type. Current expected inventory: 116.
- Do not add Entryway or Hospitality pages at this time (9 and 2 explicitly tagged products respectively).

Each page uses the existing collection template and requires authored, room-specific title, meta description, intro, buying guidance, size advice, and FAQs. Copy must help a buyer make a room-specific choice, not merely repeat keywords or substitute the room name in generic text. The template should continue to expose the actual matching artworks and existing product links. Existing style, color, and scale collections remain unchanged.

### Indexability and discovery

Use a shared minimum inventory threshold of four matching public products for room-page indexability and inclusion in the collection sitemap. This matches the existing collection-navigation minimum and is an operational quality gate, not a claim about a search-engine ranking rule. Below the threshold, the route may remain routable for future recovery or direct references, but its metadata must set `noindex,follow` and the sitemap must omit it. At or above the threshold, use the existing canonical metadata and include the route in the sitemap. Ensure page metadata and sitemap eligibility use the same matching/counting rule so they cannot disagree.

Add contextual internal links to the Dining Room and Office pages from the home-wall-art pairing guide. Update relevant collection and size-guide links where they add a natural next step; do not add sitewide links solely to increase keyword repetition. Preserve the current links for Living Room and Bedroom. Do not add translated routes in this scope.

### Data and error handling

Room inventory is read from the existing public artwork query and cached collection inventory where the current architecture allows. Only publicly eligible artworks count. If Sanity data is absent or a fetch fails, do not fabricate room matches. Existing catalog error behavior remains empty results; page metadata must fail closed for indexability, and sitemap generation must omit room pages whose eligibility cannot be established. Do not broaden this work into unrelated sitemap failure handling for product or artist URLs.

### Scope exclusions

- No new CMS fields or backfill; use the existing canonical `roomTypes` field and its current values.
- No room-by-style page matrix, programmatic long-tail page generation, or thin pages for low-inventory rooms.
- No translated collection URLs, hreflang redesign, or translation workflow changes.
- No changes to artwork taxonomy, inferred-room behavior in interactive discovery, product schema, or unrelated SEO metadata.
- No claim of ranking or traffic improvement without Search Console evidence.

## Implementation components

1. `src/lib/collections.ts`: add room filters and two authored collection definitions; correct the living-room and bedroom definitions.
2. `src/lib/storefront/catalog-rules.ts` and `collection-catalog.ts`: normalize/match explicit room values, combine category and room predicates, and fetch `roomTypes`.
3. Collection metadata/page and sitemap plumbing: use the shared four-product eligibility rule for room-page `noindex` and sitemap inclusion.
4. Pairing guide and size-guide/internal collection links: add contextual Dining Room and Office destinations.
5. Focused unit tests: collection matching (including AND semantics and no inferred fallback), inventory threshold, metadata/indexability, sitemap inclusion/exclusion, unique editorial metadata, and internal destinations.

## Verification and acceptance criteria

- Living Room Abstracts match only public artworks tagged `Living room` and category `Abstract` (baseline 79).
- Bedroom, Dining Room, and Office pages match only public artworks with their corresponding explicit room tag (baselines 137, 50, and 116).
- Missing room tags and inferred-room-only cases never match these SEO pages.
- A room collection with 4 or more matching public works is indexable and appears once in the sitemap; one with fewer than 4 is `noindex,follow` and absent from the sitemap.
- The two new collections have unique, useful English editorial content and unique metadata within the existing 100-160-character description test range.
- Dining and Office pages are reachable through the contextual pairing guide; room pages remain discoverable through existing collection navigation when they meet its inventory threshold.
- Existing non-room collection matching and interactive inferred-room filters continue to behave as before.
- Run focused tests, full `npm test`, typecheck, and production build. Before any release, inspect generated metadata and sitemap and compare live product counts against Sanity inventory.

## Risks and mitigations

- **Room-tag quality drift:** counts may change as catalog data changes. Compute eligibility from current public inventory, fail closed, and make the threshold testable.
- **Near-duplicate editorial pages:** keep only the four supported room intents and require distinct, genuinely useful advice and FAQs.
- **Sitemap and metadata disagreement:** centralize the eligibility rule and cover both surfaces with tests.
- **Baseline inventory changes:** treat the stated counts as observed design-time baselines, not hard-coded runtime expectations; refresh before release.

## Review status

This document captures the approved direction for user review. Implementation planning and code changes are intentionally gated on approval of this written specification.
