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

## Fix round 2 browser evidence and response

- P1-A passed controller retest: the visible Rolled canvas thumbnail in `audits/mesonart-product-detail-implementation-2026-08-12/06-yiiart-local-desktop-finish-fixed.png` rendered with `complete=true` and `naturalWidth=88`.
- P1-B failed its first controller retest: at 1440 x 1000 the visible sticky CTA occupied `x=1254.31..1380, y=919..967`, while Chat occupied `x=1335.31..1400.80, y=932..976`; overlap remained true in `07-yiiart-local-desktop-sticky-fixed.png`. The body dataset was absent even though one visible sticky shell existed.
- Root cause: the sticky shell and body signal were split across render and a deferred `useEffect`. The browser could paint the shell before the effect published `data-sticky-purchase-visible`, leaving the Chat offset inactive during that real boundary window.
- Round-2 fix: the mounted sticky `<aside>` now owns the body state through a stable callback ref during DOM commit; detaching the shell clears it. This removes the rendered-shell/dataset divergence rather than adding more spacing.
- Additional Important mobile finding: at 390 x 844 Chat (`x≈283..344, y≈676..720`) covered the quantity control (`x≈219..344, y≈689..731`) in `09-yiiart-local-mobile-finish-fixed.png` while the main purchase section was visible.
- Mobile response: the real main-action IntersectionObserver now publishes `data-main-purchase-action-visible` directly. At mobile widths Chat is hidden only while the purchase controls intersect the viewport, then returns in its existing sticky-safe position after those controls scroll away. Desktop behavior and cookie-aware sticky spacing are unchanged.
- Automated status: focused `29/29`, full `176/176` plus public-copy check, TypeScript exit 0, and production build exit 0. Controller browser retest remains required; `final result: pending browser retest` is unchanged.

## Fix round 3 browser evidence and response

- Round-2 desktop result remained not addressed: after a reload and the `Details & customization` anchor jump at 1440 x 1000, controller evidence `11-yiiart-local-desktop-sticky-final.png` contained no `.stickyPurchaseShell` (`shells: 0`). The primary Add to Cart action was above the viewport at `top=-1204`; Chat remained at approximately `y=932..976`. Product hydration was healthy because quantity changed from 1 to 2.
- Root cause: the primary action moved directly from below the viewport to above it. Both positions are non-intersecting with ratio zero, so an `IntersectionObserver` using threshold zero is not required to deliver a new entry. The component therefore retained its initial `mainActionVisible=true` state, hid the sticky purchase bar, and could retain stale mobile Chat state.
- Round-3 fix: the mounted primary action now measures its viewport geometry immediately and on passive `scroll` plus `resize`. It treats `rect.bottom > 0 && rect.top < viewportHeight` as visible, drives the existing sticky predicate from that measurement, publishes the mobile body state from the same source, and removes listeners/body state when the ref detaches. Footer observation, sticky DOM-commit ownership, cookie-aware desktop spacing, and mobile sticky access are unchanged.
- Regression boundary: a jsdom/Vitest integration test mounts the real `ProductPurchasePanel` and `ChatWidget` with their actual providers. It performs the real below-to-above scroll transition and asserts the rendered sticky `<aside>`, body datasets, and Chat control. A second 390 x 844 case proves visible purchase controls publish suppression state, then clear it while the sticky bar and Chat return after the controls leave.
- TDD evidence: the valid RED run failed both mounted cases at the actual component boundary; the GREEN run passed `2/2`. Detached helper/source-regex transition assertions were removed rather than used as evidence.
- Status: code and mounted boundary are addressed; desktop and mobile browser retest remains required. `final result: pending browser retest` is unchanged.
