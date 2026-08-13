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

`final result: pending browser retest`

The controller's same-viewport QA found two P1 defects. Both have automated regression coverage and code fixes, but neither is marked visually passed until the controller repeats desktop and mobile browser checks.

## P1-A — finish thumbnail does not load

- Browser evidence: the visible Rolled canvas `<img>` remained `complete=false` and `naturalWidth=0` after several seconds on desktop and mobile, leaving the swatch blank.
- Boundary evidence: the direct Next image-optimizer URL returned HTTP 200, so the generated WebP file was valid.
- Root cause: tiny project-local finish assets were rendered through lazy `next/image` optimizer delivery, adding deferral and a generated `src/srcset` path to an 88px selector asset.
- Fix: finish thumbnails now request eager loading and bypass optimizer indirection while preserving the existing asset, label, pricing, and radio selection behavior.
- Automated evidence: the focused suite first failed because the eager/unoptimized contract and component wiring were absent, then passed with the contract `{ loading: "eager", unoptimized: true }` wired into `ProductFinishSelector`.
- Status: fixed in code; desktop and mobile browser retest pending.

## P1-B — desktop Chat overlaps sticky purchase action

- Browser evidence: at 1440 x 1000, Chat covered the right side of the sticky purchase CTA.
- Mobile evidence: at 390 x 844, Chat (`y=704..748`) and the sticky CTA (`y=785..831`) did not overlap.
- Root cause: sticky-purchase visibility existed only inside `ProductStickyPurchaseBar`, so the globally mounted Chat widget had no lifecycle signal for desktop positioning.
- Fix: the sticky bar now applies `body[data-sticky-purchase-visible="true"]` while visible and removes it on hide/unmount. A desktop-only rule moves Chat above the sticky bar and includes cookie-banner height; the mobile offset remains unchanged.
- Automated evidence: the focused suite first failed for missing apply/cleanup helpers and missing component/CSS wiring, then passed lifecycle apply/cleanup plus desktop-only offset invariants.
- Status: fixed in code; 1440 x 1000 overlap retest and 390 x 844 preservation retest pending.

## Non-blocking product-data constraint

The representative `ink-garden-01` product exposes only Rolled canvas. Its explicit product-specific finish data validly overrides the seven-option catalog fallback under the confirmed specification. This is not a code defect. The Natural wood float frame purchase journey cannot be performed on this product; use a product that actually exposes that finish if the controller needs to exercise that variant journey.

## Automated verification after fixes

- Focused storefront suite: `27/27` passed after the recorded RED run.
- Full unit suite: `174/174` passed; `0` failed, cancelled, skipped, or todo.
- Public copy check: passed.
- `npx tsc --noEmit`: exited 0 with no output.
- `npm run build`: exited 0; Next.js 15.5.15 compiled successfully and generated `43/43` static pages.
- Build warning retained as non-blocking: `Using edge runtime on a page currently disables static generation for that page`.

## Local preview evidence and concerns

- Current product preview: `http://127.0.0.1:3010/artwork/ink-garden-01`, listener PID `3612`, HTTP 200.
- Server-rendered markup contains the direct eager Rolled canvas asset and no Rolled canvas optimizer URL; browser visual confirmation is still required.
- Running the production build invalidated the prior live development module graph, so the preview was restarted after build completion.
- The latest detached preview logs contain non-blocking Watchpack scan errors for protected drive-root paths and an existing `/api/auth/session` 500 because the local detached process has no usable Auth secret. The product route and purchase CTA remain available for the requested visual retest.
