# YiiArt 2.1 Design QA

## Captured state

- Reference: `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-preview`
- Migrated production build: `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-integration`
- Captured browser route: `http://127.0.0.1:3002/`

## Automated evidence

- `npm run test`: 31 tests passed; public copy check passed.
- `npm run build`: completed successfully and generated 41 routes.

## Accepted current captures

- Home: current 2.1 hero copy, dark editorial header, image-led composition, and three trust points are visible.
- Artworks: current 2.1 header, editorial display typography, warm paper surface, and curated path grid are visible.

## Visual review status

The local preview initially reused an older listener on port 3001. Port 3002 now serves the current production build and has accepted home and catalogue captures. Product detail, cart, checkout, and mobile captures remain outstanding, so this is not a release approval.

## Required interactive checks after a current preview is available

- Collection tabs and filters update the visible artwork grid.
- Product gallery thumbnails update the selected image.
- Size and finish selections add the correct cart variant.
- Original artworks remain quantity one.
- Cart proceeds to checkout; enabled payment choices remain selectable.
- Mobile menu, search, focus state, and reduced-motion behavior remain usable.

legacy result: blocked
# Editorial gallery refinement QA — 2026-07-26

- Automated checks: `npm run test` passed (36 tests and public-copy check).
- Production build: `npm run build` passed and generated 41 routes.
- Local homepage check: confirmed updated hero hierarchy, room-guidance heading, studio-process heading, primary navigation, image-led featured works, and all primary home actions at `http://127.0.0.1:3003/`.
- Interaction safeguards preserved by unit coverage: filtering, sorting inputs, collection membership, product variants, cart selection, and made-to-order disclosures.
- Manual follow-up for release: recheck desktop and mobile screenshots of `/artworks` and `/artwork/afternoon2` after deployment because browser screenshot capture has intermittently timed out in this environment.

---

# MesonArt product-detail implementation QA — 2026-08-13

## Current result

final result: passed

The controller's final same-viewport browser QA passed the approved product-detail architecture on desktop and mobile.

## Final approved purchase-overlay architecture

- Desktop collision avoidance is presence-based: CSS detects the rendered `.stickyPurchaseShell` and moves the global Chat control above it. The layout does not depend on JavaScript-published body state.
- On mobile artwork-detail routes, the floating Chat control remains mounted but is intentionally hidden. The in-page `Ask an art advisor` and `Ask on WhatsApp` actions remain available.
- Mobile routes outside artwork detail retain the normal floating Chat control; the homepage was explicitly rechecked.
- Sticky-purchase visibility continues to follow the real purchase-action geometry and footer visibility, while cookie and safe-area offsets remain reserved by the sticky shell.

## Final browser evidence

- Desktop `1440 x 1000`: one sticky purchase shell rendered (`shell=1`); Chat occupied `y=828..872`; the sticky CTA occupied `y=919..967`; `overlap=false`.
- Mobile product detail `390 x 844`: Chat remained present in the DOM with a zero rectangle and was hidden; the visible finish thumbnail reported `complete=true` and `naturalWidth=88`; the page had no horizontal overflow; the sticky CTA occupied `y=785.2..831.6`; `Ask an art advisor` and `Ask on WhatsApp` were both present in-page.
- Mobile homepage: the floating Chat control remained visible.

## Evidence custody

Reference and implementation evidence files remain controller-owned, untracked local QA artifacts under `audits/mesonart-product-detail-implementation-2026-08-12/`. This external local QA location is intentionally documented here; the images are not committed.

## Final automated and preview gate

- `npm test`: `200/200` unit tests and `6/6` mounted integration tests passed; the public-copy check passed.
- `npx tsc --noEmit`: exited `0` with no diagnostics.
- `npm run build`: exited `0`; Next.js 15.5.15 compiled successfully and generated `43/43` static pages.
- The restarted preview at `http://127.0.0.1:3010/artwork/ink-garden-01` returned HTTP `200` and server-rendered the product title plus both in-page advisory actions.

## Non-blocking product-data constraint

The representative `ink-garden-01` product exposes only Rolled canvas. Its explicit product-specific finish data validly overrides the seven-option catalog fallback under the confirmed specification. This is not a code defect. The Natural wood float frame purchase journey cannot be performed on this product; use a product that actually exposes that finish if the controller needs to exercise that variant journey.
