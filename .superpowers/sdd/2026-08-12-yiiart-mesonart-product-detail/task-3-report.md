# Task 3 Report: Accessible Visual Presentation Selector

## Status

Implemented the accessible visual finish/presentation selector in the live product purchase panel. The selector uses the normalized presentation assets and the existing `resolveFinishDeltaCny()` pricing API. Size cards, selection pricing, cart payloads, and checkout behavior were not changed.

## RED / GREEN evidence

### Cycle 1: selector behavior and size-sensitive pricing

The production change intended to make these tests pass was a selector view model that derives the selected option and positive presentation surcharge from `NormalizedFinishOption[]`, `selectedId`, and the selected size's rolled price.

RED command:

```text
npx tsx --test src/lib/storefront/optimized-storefront.test.ts
```

RED result: exit 1. The test process reported `Error: Cannot find module './finish-selector'`, confirming the behavior-bearing selector model did not exist before implementation.

The behavioral assertions use hand-checked values:

- Rolled at CNY 1,730 has no visible increment (`null`).
- Black frame at CNY 1,730 has a CNY 1,360 increment.
- The same black-frame selection at a CNY 3,120 rolled price has a CNY 2,450 increment.
- The selected label and selected flag remain on `black-frame` across both size prices.

GREEN command:

```text
npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/finish-options.test.ts src/lib/storefront/selection.test.ts
```

GREEN result: exit 0, 19 tests passed, 0 failed.

### Cycle 2: avoid a duplicated accessible option name

The production change intended to make this test pass was making the thumbnail decorative because the adjacent visible label already names the radio option.

RED command:

```text
npx tsx --test src/lib/storefront/optimized-storefront.test.ts
```

RED result: exit 1, 10 tests passed and 1 failed. The accessibility contract expected `alt=""`; the component still had `alt={finish.assetAlt}` and would have repeated the finish label in the radio's accessible name.

GREEN command:

```text
npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/finish-options.test.ts src/lib/storefront/selection.test.ts
```

GREEN result: exit 0, 19 tests passed, 0 failed.

## Implementation

- Added `ProductFinishSelector`, a client component with the requested props.
- Rendered a native `fieldset`, visible `legend`, label-wrapped native radio inputs, local `next/image` thumbnails, visible labels, and currency-aware `PriceText` surcharges only when the resolved delta is positive.
- Added a visible `Selected: {label}` live summary and a native framing-details disclosure.
- Replaced only the purchase panel's generic finish grid. The size card markup and its state handler remain unchanged.
- Passed `selection.size.priceCny`, the normalized active finish ID, and `setFinishId` to the selector. Changing size updates the rolled price input while retaining the current `finishId`.
- Added a pure view model so pricing and selection behavior can be tested without mocking React, Next Image, currency providers, or CSS modules.
- Added a four-column desktop grid for all seven catalog choices and a horizontally scrollable, scroll-snapped mobile row.

## Accessibility decisions

- Native radio-group semantics come from `fieldset` and `legend`; no custom ARIA radio implementation is used.
- Every radio is nested inside its click/tap label and remains keyboard focusable despite being visually clipped.
- React supplies both a selected class and `data-selected`, so selected state does not depend on `:has()`.
- Selected state uses a persistent two-pixel outline; `:focus-visible` adds a separate high-contrast ring, preserving both signals simultaneously.
- Thumbnail controls are 76–88 px. Option names and price increments remain visible text.
- Thumbnail `alt` is empty because the adjacent text supplies the option name, preventing duplicate screen-reader announcements.
- The selected summary uses `aria-live="polite"`; disclosure uses native `details`/`summary` behavior.

The repository has no installed JSX component-testing/rendering harness that can consume this CSS-module client component with its Next and currency contexts. Therefore, observable selection/pricing behavior is covered through the real pure view model. A narrow source contract is retained only for static semantics and CSS invariants that the existing Node test stack cannot render: native `fieldset`/`legend`/radio markup, decorative image alt, explicit React selected-state data, and the independent focus selector. It does not assert component implementation strings for the behavioral pricing logic.

## Files changed

- `src/components/storefront/ProductFinishSelector.tsx` — accessible selector UI.
- `src/components/storefront/ProductPurchasePanel.tsx` — replaces only the old finish grid.
- `src/components/storefront/storefront.module.css` — grid, thumbnail, selected, focus, disclosure, and mobile-scroll presentation.
- `src/lib/storefront/finish-selector.ts` — pure selector view model using the authoritative finish-delta API.
- `src/lib/storefront/optimized-storefront.test.ts` — behavioral coverage plus the narrow static accessibility/CSS contract.
- `.superpowers/sdd/2026-08-12-yiiart-mesonart-product-detail/task-3-report.md` — this report.

## Final verification

Focused/domain tests:

```text
npx tsx --test src/lib/storefront/optimized-storefront.test.ts src/lib/storefront/finish-options.test.ts src/lib/storefront/selection.test.ts
```

Result: exit 0; 19 passed, 0 failed.

Full suite:

```text
npm test
```

Result: exit 0; 158 unit tests passed, 0 failed; `Public copy check passed.`

Production build:

```text
npm run build
```

Result: exit 0; Next.js compiled successfully, linted/type-checked successfully, and generated 43/43 static pages. Next emitted its existing informational warning that an edge-runtime page disables static generation for that page.

Additional checks:

```text
npx tsc --noEmit
git diff --check
```

Both exited 0 before the final report was written.

## Self-review

- Confirmed no pricing formula was copied or altered: the view model calls `resolveFinishDeltaCny()` directly.
- Confirmed exact normalized `assetSrc` values flow to `next/image`; no assets were changed or regenerated.
- Confirmed zero and negative deltas cannot render a surcharge; positive deltas use `PriceText` and the live currency context.
- Confirmed size changes do not call `setFinishId`; a still-valid finish remains selected and its surcharge is recalculated from the new rolled price.
- Confirmed cart additions still use `getProductSelection()` and the same size/finish IDs, labels, total price, quantity, and marketing payload.
- Confirmed the existing size cards are unchanged.
- Mutation check: changing selected-option derivation, rendering a zero surcharge, fixing the surcharge to one size, removing native semantics, removing explicit selected data, or collapsing focus into selected state would fail an added test.
- Scope check: no Task 4–7 files or behavior were touched.

## Concerns

- No functional concern remains within Task 3 scope.
- The static semantics/CSS assertions are intentionally narrow because the repository lacks a compatible component renderer; a future browser-level accessibility suite could replace them with computed accessibility-tree and focus-style assertions.
