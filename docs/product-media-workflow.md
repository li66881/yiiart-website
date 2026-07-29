# YiiArt Product Media Workflow

YiiArt product galleries support audited images and videos while keeping the existing Sanity and Cloudflare image fields as fallbacks.

## Media order

1. Clean front view
2. Original artwork photo
3. Texture detail
4. Studio or product video
5. Living room scene
6. Angle or edge view
7. Bedroom scene
8. Scale or additional view

## Audit first

Run the media audit before uploading or changing production records:

```powershell
npm run media:audit -- --source="C:\path\to\product-media"
```

The command writes:

- `reports/product-media-audit.json` for automation and detailed review.
- `reports/product-media-audit.csv` for confirming folder-to-product matches.
- `reports/product-media-review-*.jpg` may be added for side-by-side review of ambiguous folders and existing Sanity product images.

Matching signals are applied in this order:

- Exact `catalogCode` match.
- Existing Sanity main-image pixel dimensions.
- Legacy `dimensions` values that match the original image pixels.
- Real artwork width and height.
- Plausible listed artwork dimensions.

Only a unique high-confidence match is placed in `suggestedMatch`. Other candidates remain review-only.

`readyForUpload` is true only when the match is high confidence, all six expected image roles are present, no role is duplicated, and the folder size is plausible. A reviewer must still complete the CSV review columns before any production import.

## Production safety

- Do not upload or patch Sanity until the CSV mapping has been reviewed.
- Do not overwrite existing `images` or `cloudflareImages` during the first migration.
- Set `approvedForStorefront` only after media ownership, product identity, alt text, and room-scene proportions are confirmed.
- Use optimized public derivatives for the storefront and keep full-resolution originals private.
- Product videos should have a poster image, use mobile-friendly H.264 MP4, and remain short enough for reliable playback.

## Current review decisions

The July 29 media audit produced 41 unique high-confidence suggestions and 38 folders that pass the automated completeness gate. The YiiArt owner reviewed the held-back mappings on July 30. The durable decisions are stored in `reports/product-media-review-decisions.json`, and the matching CSV reviewer columns are completed.

- `30-40-5` is approved for `mint-field`. Upload the available owned media; the original image is missing and the two angle and bedroom variants are distinct.
- `30-40-12` is approved for `nocturne-diptych`. Upload the available owned media; the original and bedroom views are missing and both detail variants may be retained.
- `40-40-8` is approved for `earth-song`. Upload the available owned media; the living-room scene is missing.
- `40-40-9` is excluded because it does not correspond to a current product.
- `30-40-3` is excluded because it does not correspond to a current product.
- `400-400-12` is approved for `pink-garden-rhythm`; the owner confirmed the real size is `40 x 40 cm`, so use catalog code `40-40-12`.

Automated upload tooling must treat explicit exclusions as final, apply the corrected size and catalog code, and leave any other incomplete folder on hold until it receives an explicit decision.

## Dry run and import

Generate a production import plan without uploading:

```powershell
npm run media:import -- --source="C:\path\to\product-media"
```

The dry run writes `reports/product-media-import-plan.json`. Review its approved, excluded, held, missing-file, and media totals before applying.

Production import requires these local environment variables:

- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_PUBLIC_URL`
- `SANITY_WRITE_TOKEN`

After credentials are present, run:

```powershell
npm run media:import -- --source="C:\path\to\product-media" --apply
```

Use `--folders=30-40-5,30-40-12` for a small reviewed batch or `--limit=3` for a staged rollout. Images are converted to web-friendly WebP derivatives before upload. The importer verifies each source-file hash, uses deterministic R2 keys, retains existing Sanity media, skips media already linked by the same R2 key, and only appends approved entries.

The reviewed product-media bucket is `yiiart-media`, and its production custom domain is `https://art-media.yiiart.com`. Keep `https://assets.yiiart.com` reserved for the separate legacy `yiiart-assets` bucket.
