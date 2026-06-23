# YiiArt Project Brief

YiiArt is an independent e-commerce website selling handmade modern paintings, custom canvas art, large wall art, and home interior artwork.

This file is the long-term project brief. Before making website, SEO, content, or conversion changes, read this brief first and keep the work aligned with it.

## Business Positioning

YiiArt should feel like a curated art and interior decor brand, not a low-end product listing store.

Primary customers:

- Homeowners looking for living room or bedroom wall art
- Interior designers
- Hotels, offices, studios, Airbnb hosts, and hospitality buyers
- Buyers looking for custom-size or custom-color paintings
- Collectors who want original handmade artwork with clear buying guidance

## Brand Feel

YiiArt should feel:

- Calm, curated, and trustworthy
- Modern, interior-focused, and visually refined
- Helpful for real home decisions such as size, color, framing, and room fit
- Premium but practical, not cold or overly luxury
- Honest about production, shipping, returns, and custom work

## Core Selling Points

- Handmade paintings
- Custom size and color options
- Modern, abstract, textured, neutral, wabi-sabi, and minimalist styles
- Suitable for living rooms, bedrooms, dining rooms, offices, hotels, and large feature walls
- Secure worldwide shipping where carrier service is available
- Carefully packaged artwork
- Damage support based on photos, packaging evidence, and carrier process
- Custom painting service for exact wall sizes and room palettes
- Size guidance and room-fit advice before purchase

## Website Priorities

1. Build trust.
2. Help users imagine artwork in their space.
3. Make size selection easier.
4. Promote custom painting inquiries.
5. Improve SEO through collection pages, guide pages, and helpful content.
6. Improve product page conversion.
7. Keep navigation, product discovery, and internal links clear.
8. Keep policies realistic and easy to understand.

## Preferred Pages

- Home
- All Artworks
- Best Sellers or Featured Artworks
- Abstract Paintings
- Large Wall Art
- Textured Wall Art
- Neutral Wall Art
- Living Room Art
- Bedroom Wall Art
- Custom Painting
- Size Guide
- Shipping & Returns
- FAQ
- About Us

## Existing Key Routes

- Home: `/`
- All artworks: `/artworks`
- Product page: `/artwork/[slug]`
- Collections: `/collections/[slug]`
- Custom Painting: `/custom-painting`
- Size Guide: `/size-guide`
- Shipping & Returns: `/shipping-returns`
- Shipping: `/shipping`
- Returns: `/returns`
- FAQ: `/faq`
- About: `/about`
- Contact: `/contact`

Do not change existing URLs unless the user explicitly approves the reason.

## Technical Working Rules

- Before any site-building task, sync the latest GitHub code first.
- Prefer reusing existing components, styles, helper functions, and data structures.
- Keep changes focused, reviewable, and aligned with existing architecture.
- Run `npm run build` after code changes when practical.
- If `npm run lint` enters ESLint setup instead of running rules, report that clearly.
- Do not modify checkout, payment, order, or customer data logic unless explicitly requested.
- Do not delete existing product data.
- Do not rewrite unrelated files or perform broad refactors unless needed for the task.

## Do Not Do

- Do not modify checkout or payment logic unless explicitly requested.
- Do not create fake reviews, fake sales counts, fake testimonials, or fake customer photos.
- Do not use copyrighted images or random external images.
- Do not delete existing product, order, customer, or review data.
- Do not change URLs without approval.
- Do not make unrealistic shipping, delivery, damage, or refund promises.
- Do not promise unconditional refunds.
- Do not label items as Best Sellers unless real sales or performance data supports it.

## Best Sellers Rule

Only label products as Best Sellers if real sales or performance data exists.

If real best-seller data is not available, use honest alternatives such as:

- Featured Artworks
- Curator Picks
- New Arrivals
- Collector-ready Paintings
- Featured by YiiArt

## SEO Principles

- Use natural English copy written for real buyers.
- Do not keyword stuff.
- Keep page titles clear, specific, and human-readable.
- Write meta descriptions that explain the page value and buyer context.
- Use canonical URLs where supported.
- Use Open Graph metadata where supported.
- Add FAQ schema only for FAQ content that is visible on the page.
- Add product structured data only from real product data.
- Use descriptive image alt text without exaggeration.

Every collection page should ideally include:

- Collection hero with title and helpful intro copy
- Product grid with filters and sorting
- Buying guide
- Internal links to related collections
- FAQ
- Custom painting link where relevant

Every product page should ideally include:

- Product title
- Price or price-on-request handling
- Size and medium
- Artwork details
- Size and room guide
- Custom size or color request entry
- Trust block
- Shipping and returns summary
- FAQ
- Related products

## Image Rules

- Use only owned, licensed, or generated images.
- Prefer existing product images and Cloudflare R2-hosted assets.
- Do not use random external copyrighted images.
- If a real image is missing, use clean placeholders or CSS diagrams.
- Image alt text should describe the actual product, room context, or purpose naturally.

## Content Tone

YiiArt copy should be:

- Clear
- Calm
- Helpful
- Specific
- Trustworthy
- Interior-focused

Avoid:

- Overhyped sales language
- Fake urgency
- Unsupported claims
- Keyword stuffing
- Unrealistic guarantees

## Policy Language Rules

Shipping:

- Do not promise exact shipping times unless a confirmed policy exists.
- It is acceptable to say timing depends on preparation, destination, customs, carrier route, and shipping format.
- Mention tracking only when carrier tracking is available.

Returns:

- Separate ready-made artwork from custom paintings.
- Custom paintings may have different cancellation or return conditions.
- Do not promise unconditional refunds.

Damage:

- Ask customers to keep the artwork and packaging.
- Ask for photos of the artwork, box, inner packaging, and shipping label.
- Say YiiArt will review the issue and available carrier process.

## Custom Painting Priorities

Custom Painting should guide users to share:

- Wall width
- Ceiling height
- Room photo
- Preferred size
- Preferred colors
- Room type
- Style direction
- Budget
- Shipping country
- Reference images for mood only, not direct copyright copying

## Reusable Prompt

For future tasks, use:

`请先阅读 yiiart简介.md，再执行本次任务。`
