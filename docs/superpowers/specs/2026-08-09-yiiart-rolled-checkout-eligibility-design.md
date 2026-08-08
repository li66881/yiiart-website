# YiiArt Rolled Checkout Eligibility Design

## Goal

Enable direct checkout for the 63 reviewed, hand-painted-to-order artworks when a selected size can be shipped as rolled canvas. The migration must no longer reject an approved product solely because its legacy `shippingProfile` field is empty.

## Confirmed Business Decisions

- All 63 artworks have sales authorization and complete storefront content.
- All 63 artworks may be produced again as hand-painted-to-order products.
- Direct checkout is limited to rolled-canvas delivery for this migration.
- Stretched and framed checkout options, prices, and shipping surcharges are out of scope.
- A rolled size is eligible for direct checkout when its longest side is no more than `210 cm`.
- Larger sizes remain available through custom-order inquiry, not direct checkout.
- Existing payment providers, cart submission, checkout routes, product URLs, and artwork data must not be deleted or restructured.

## Eligibility Rule

The reviewed operator decision is the authoritative commercial input. An artwork may enable direct checkout only when all of these conditions are true:

1. `rightsApproved` is `true`.
2. `contentReady` is `true`.
3. `enableRolledCheckout` is `true`.
4. Its assigned size profile contains at least one size whose longest side is at most `210 cm`.

The existing source value of `shippingProfile` is not an eligibility prerequisite. Requiring that legacy field creates a circular dependency because all 63 current records have it empty.

## Migration Output

For each eligible artwork, the migration plan will:

- set `productionModel` to `hand_painted_to_order`;
- set `collectionType` to `new_collection`;
- set `rightsStatus` to `approved`;
- set `migrationStatus` to `ready`;
- set `allowCheckout` to `true`;
- set `shippingProfile` to `Ships rolled`;
- preserve the reviewed physical dimensions, category, room, color, and style data;
- generate only direct-checkout standard sizes that satisfy the `210 cm` rolled limit;
- provide only the `Rolled canvas` finish with a zero price delta.

For a size profile that also contains an oversize option, only that oversize option is excluded. The artwork and its smaller eligible sizes remain directly purchasable.

## Pricing And Checkout

Rolled-canvas prices continue to use the existing authoritative area-based catalog calculation. No framing price, finished-shipping surcharge, payment-provider behavior, cart payload, or server checkout validation logic changes in this scope.

The storefront and checkout server continue to read the generated Sanity `standardSizes` and `frameOptions`. Server-side checkout validation remains authoritative and does not trust browser-submitted prices or labels.

## Safety Workflow

1. Update the 63 operator decisions to record authorization, content readiness, and rolled-checkout approval.
2. Generate a new dry-run report without mutating Sanity.
3. Verify source count, decision count, eligible count, checkout count, patch fields, fingerprints, and oversize exclusions.
4. Present the exact report summary for user approval.
5. Run the guarded apply command only after explicit approval of that report.
6. Verify the resulting Sanity records and storefront behavior after apply.

The current dry-run is superseded by the new decisions and must not be applied.

## Tests And Acceptance Criteria

- A reviewed artwork with an empty `shippingProfile` becomes checkout-enabled when all four eligibility conditions pass.
- The migration writes `shippingProfile: "Ships rolled"` for eligible records.
- Missing rights approval, missing content readiness, or disabled rolled checkout keeps `allowCheckout` false.
- Generated direct sizes never exceed the `210 cm` longest-side limit.
- Rolled canvas remains the only generated finish.
- Re-running the migration after apply is idempotent.
- The new dry-run contains exactly 63 source records and 63 decisions, with no Sanity mutation before approval.
- Unit tests, lint/type checks available in the repository, and the production build pass before apply.

## Out Of Scope

- Stretched-canvas checkout
- Framed-artwork checkout
- The proposed `600 CNY/m2` finished-shipping surcharge
- Payment or checkout provider changes
- URL changes
- New reviews, sales claims, images, or product copy
