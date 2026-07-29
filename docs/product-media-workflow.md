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

## Current review notes

The July 29 media audit produced 41 unique high-confidence suggestions and 38 folders that pass the automated completeness gate. Visual comparison suggests the following candidates, but they remain unapproved until the CSV review fields are completed:

- `30-40-5` resembles `mint-field`.
- `30-40-12` resembles `nocturne-diptych`.
- `40-40-8` resembles `earth-song`.
- `40-40-9` resembles `green-rain-study`, but the recorded size appears inconsistent.
- `30-40-3` remains ambiguous; `lime-blossom-field` is only a palette-level candidate.

The folder `400-400-12` is also held back because its physical-size code is implausible and may be a naming error.
