# Sanity Artwork Migration Rules

The expanded artwork schema supports both the current YiiArt catalog and the made-to-order storefront. Existing production documents are not changed automatically.

## Legacy defaults

When a field is absent, the application resolves it as follows:

```text
collectionType = artist_collection
productionModel = original
rightsStatus = needs_review
migrationStatus = needs_rights_review
```

This keeps every current record available to the migration team without automatically promoting it into the redesigned New Collection.

## New made-to-order record

A record can enter the customer-facing New Collection only when all of the following are true:

- `collectionType` is `new_collection`.
- `productionModel` is `hand_painted_to_order`.
- `rightsStatus` is `approved`.
- `migrationStatus` is `ready`.
- At least one `standardSizes` item has a stable key, customer-facing label, and positive CNY price.
- Every `frameOptions` item has a stable key, label, and non-negative CNY price adjustment.
- The main artwork image and every supporting image have recorded provenance and approval.

Checkout treats the Sanity size and finish prices as authoritative. Browser-submitted prices and labels are not accepted.

## Existing artist-collection record

Existing records continue to use the base `price`, listed `dimensions`, and current availability rules. They remain separate from the main made-to-order catalog through the `Artist Collection` tab and filter. A paid original can still be marked sold; a made-to-order catalog record must remain available after payment.

## Safe migration order

1. Review title, artist or studio attribution, image source, and selling rights.
2. Set `rightsStatus` and `migrationStatus` truthfully.
3. Rewrite short English copy without inventing artist history, exhibitions, awards, reviews, or customer evidence.
4. Add approved product images, real details, proportional room scenes, and useful alt text.
5. Add standard sizes, finishes, production time, and shipping profile.
6. Preview the product page and checkout calculation.
7. Change the record to `ready` only after the content and commerce checks pass.

Do not run an unreviewed bulk mutation against the production dataset. Migration batches should be reviewed and promoted in groups of 25-50 products.
