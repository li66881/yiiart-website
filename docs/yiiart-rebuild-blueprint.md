# YiiArt Rebuild Blueprint

## Reference Direction

NukeArt is useful as a reference for ecommerce structure, not as a page to copy. The main transferable patterns are:

- Clear shopping paths by style, room, color, size, and theme.
- Product pages that answer sizing, texture, framing, delivery, returns, and custom questions before checkout.
- International storefront controls for language, currency, and direct chat.
- Repeated trust signals around authenticity, shipping, payment, reviews, and support.
- Content pages that support social traffic and search traffic.

## YiiArt Positioning

YiiArt should keep a different market position:

- Original works by independent Chinese artists.
- One-of-a-kind paintings for real homes and collector spaces.
- International pricing and delivery with direct WhatsApp advice.
- Calm, content-led art commerce rather than aggressive discount retail.

## API-Enabled Direction

The rebuild can use APIs, plugins, and third-party services when they create measurable ecommerce value. The decision rule is simple: add the integration when it improves product discovery, checkout conversion, backend operations, or marketing attribution. Do not add services only because NukeArt uses them.

## NukeArt Feature Matrix

| Area | NukeArt-style capability | YiiArt implementation path |
| --- | --- | --- |
| Storefront localization | Language, country, currency, flags, market labels | Implemented with YiiArt market selector; later add geolocation defaulting if needed |
| Product discovery | Predictive search, collection navigation, filters | Add internal search API first; later add faceted filters by room, color, size, orientation |
| Product page | Variants, size/framing choices, trust accordions, custom request | Strengthen existing Sanity product pages; add optional product option fields before real variant checkout |
| Checkout | Shopify checkout, market rules, taxes/shipping | Current Stripe/PayPal stays active; evaluate Shopify Storefront API only if product/variant operations become too complex |
| Reviews | Review app, verified reviews, customer photos | Existing YiiArt review system is the base; later add Trustpilot/Loox-style widgets if needed |
| Lead capture | Newsletter popup, email capture, first-order incentive | Existing newsletter endpoint can become a modal; connect Resend/SendGrid when credentials are ready |
| WhatsApp | Floating chat and product inquiry | Implemented; later add product-specific prefilled messages and tracking |
| Campaigns | Countdown bars, discount campaigns, bundles | Add configurable announcement/campaign bar; avoid fake urgency |
| Affiliate/referral | GoAffPro-style referral tracking | Add after checkout attribution is stable; possible custom affiliate codes or third-party tool |
| SEO content | Room/style buying guides and collection pages | Continue building collection pages; add editorial guides for social and Google traffic |
| Analytics | Pixels, conversion tracking, attribution | Existing marketing pixels stay; refine events after search/filter/checkout changes |
| Backend | Product metadata, room/color/size fields, social copy | Continue expanding Sanity schema and admin forms |

## Phase 1 Scope

1. Preserve the current international storefront baseline.
2. Upgrade the homepage information architecture.
3. Add collection entry points by style, room, and scale.
4. Strengthen product detail pages with placement advice, certificate/shipping/returns trust, and WhatsApp consultation.
5. Add optional backend fields to the artwork schema for future filtering and richer product content.

## Phase 2 Scope

1. Add predictive search backed by a YiiArt API route.
2. Build real filters for room, color, size, orientation, and availability.
3. Add multilingual content fields for German and French product copy.
4. Add campaign landing pages for Instagram, TikTok, Pinterest, and Google traffic.
5. Add configurable newsletter popup and campaign announcement bar.
6. Improve the admin workflow for uploading product photos, room mockups, social captions, and SEO metadata.
7. Evaluate Shopify Storefront API only after product variants and cart requirements are fully specified.
