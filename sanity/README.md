# Sanity schema (optional)

This repository is currently a static prototype (HTML/CSS/JS).

This `sanity/` folder is added so you can reuse a production-grade content model when you introduce Sanity Studio.

## What is included
- `sanity/schemas/artwork.js`: an `artwork` document schema with:
  - multi-language title/description/medium
  - multi-currency pricing
  - shipping formats + lead time
  - UHD gallery + pre-shipment confirmation media
  - SEO fields

## How to use (when you add Sanity Studio)
1. Create a Sanity Studio project (usually a separate repo or a `studio/` folder).
2. Copy `sanity/schemas/*.js` into your Studio `schemas/` directory.
3. Add the schema to your Studio schema index, e.g.:
   - `import artwork from './artwork'`
   - `export const schemaTypes = [artwork, ...]`

## Notes
- The schema references an `artist` type (`{type: 'artist'}`) which should be added separately.
