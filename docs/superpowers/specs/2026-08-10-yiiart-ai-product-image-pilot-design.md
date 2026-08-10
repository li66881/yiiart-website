# YiiArt AI-Assisted Product Image Pilot Design

## Objective

Create four original, production-feasible painting concepts and a consistent six-image e-commerce gallery for each. The four approved pilots establish the visual and operational standard for a later 24-product collection expansion.

The products are sold as hand-painted-to-order artworks. Customers may order from the displayed design, receive real photos and video of the completed painting, request reasonable adjustments, and approve the finished work before shipment.

## Approved Commercial Model

- YiiArt may use generated artwork and room imagery as the product's visual design target.
- Storefront copy does not need to mention the image-generation tool or process.
- Every pilot is presented as `Made to Order`, not as an already completed one-of-one original.
- The studio must be able to reproduce the visible composition, palette, materials, and general texture at the ordered size.
- Before shipment, YiiArt sends real photos and video of the completed painting through the existing customer communication channel.
- Shipment happens only after the customer approves the completed work.
- The generated gallery must never be described as customer photography, studio-process photography, or photography of a finished physical painting.
- Existing checkout, payment, cart, order, customer, and URL behavior remains unchanged.

## Rollout Strategy

Use a controlled pilot before producing the full catalog:

1. Produce one complete six-image gallery for each of four series.
2. Review artwork quality, cross-image consistency, physical reproducibility, room scale, and storefront suitability.
3. Regenerate only failed images; retain approved files.
4. After the four pilots are approved, expand each series to six products, for 24 products total.
5. Audit the final local folders before any R2 upload or Sanity write.
6. Publish a reviewed batch to a preview deployment before production.

The pilot contains 24 image files. The full 24-product expansion will contain 144 image files at the same six-image standard.

## Originality and Rights Boundaries

- MesonArt is used only to understand commercial categories, room use, format mix, and broad market direction.
- Do not reproduce a competitor's exact composition, title, product code, distinctive visual identity, written copy, room photograph, or product photography.
- Do not use external copyrighted images as generation references or storefront assets.
- Do not use recognizable cartoon characters, celebrity likenesses, protected logos, or third-party brand marks.
- Each concept must have a distinct YiiArt composition and title.
- Internally retain generation provenance and approval status for every asset even though the public product page does not need to mention the generation process.

## Four Pilot Products

| Series | Pilot title | Format | Reference size | Palette | Composition and materials | Primary rooms |
| --- | --- | --- | --- | --- | --- | --- |
| Quiet Geometry | Quiet Geometry 01 | Square | 100 x 100 cm | Olive green, warm white, charcoal | Original geometric divisions with shallow relief; acrylic and texture paste | Living room, office |
| Gilded Shore | Gilded Shore 01 | Landscape | 120 x 80 cm | Warm white, taupe, gray-blue, restrained gold | Original abstract shoreline and horizontal impasto; acrylic, texture paste, optional gold foil | Sofa wall, dining room |
| Ink Garden | Ink Garden 01 | Portrait | 80 x 120 cm | Ink green, sage, cream | Original botanical lines and rain-like brushwork; acrylic and controlled texture | Entryway, bedroom, study |
| Retro Ritual | Retro Ritual 01 | Square | 100 x 100 cm | Cream, muted red, ink blue, soft green | Original tea vessel and floral still life; no characters or protected motifs | Dining room, living room |

The reference size defines the first gallery's room scale. Existing YiiArt made-to-order size ladders may later provide other purchasable sizes when the composition supports them.

## Six-Image Gallery Standard

Each product folder contains exactly these approved roles in this display order:

1. `01-front`: centered clean front view, complete artwork, even light, no room background, frame, signature, text, logo, or watermark.
2. `02-detail`: a credible close detail derived from a real region of `01-front`, preserving the exact color placement, brush direction, and texture structure.
3. `03-side`: approximately 35-degree side view showing plausible canvas depth, painted edge, and physically achievable texture.
4. `04-living-room`: modern living-room placement using the reference size and a believable wall, furniture, and viewing scale.
5. `05-bedroom` or `05-dining-room`: a second room selected from the product's intended room use while preserving the same artwork and scale discipline.
6. `06-size-reference`: a clean room-scale view using a sofa, bed, desk, or dining table as a recognizable size reference, with accurate size labeling added only when the label can be verified.

The pilot second-room roles are fixed: Quiet Geometry uses a bedroom, Gilded Shore uses a dining room, Ink Garden uses a bedroom, and Retro Ritual uses a dining room. The size-reference image does not rely on generated typography; the verified dimensions remain product data and alt text.

## Cross-Image Consistency Rules

- `01-front` is the immutable master for the other five images.
- The artwork's silhouette, proportions, focal elements, palette, texture locations, and orientation must remain stable across every image.
- A detail image must correspond to an identifiable area of the master; it cannot invent a new pattern.
- A side view may add perspective and lighting but cannot change the painting.
- Room scenes may change viewing distance, ambient light, and optional presentation finish, but cannot recolor, crop, mirror, stretch, or redesign the artwork.
- Room placement uses the listed reference dimensions. Furniture and wall scale must not exaggerate the artwork's size.
- Generated text, signatures, watermarks, logos, malformed furniture, duplicate objects, and visual artifacts fail review.
- Texture thickness must be reproducible with the studio's stated acrylic, texture paste, and optional gold-foil methods.

## Local Asset Structure

Keep generated source assets outside the Git repository to avoid repository bloat. Use:

```text
C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\
  product-manifest.json
  quiet-geometry-01\
    01-front.png
    02-detail.png
    03-side.png
    04-living-room.png
    05-bedroom.png
    06-size-reference.png
  gilded-shore-01\
  ink-garden-01\
  retro-ritual-01\
```

Use the highest-quality generated source as the local master. The existing media importer creates optimized WebP derivatives for storefront delivery while preserving full-resolution sources outside the public bucket.

`product-manifest.json` is the explicit source of product identity for this new-product batch. It records the proposed title, slug, series, reference dimensions, orientation, material capabilities, six expected filenames, internal provenance, operator approval, and later Sanity document ID. The workflow never guesses a new product match from pixels or a folder name.

## Generation Flow

1. Generate and approve `01-front` for one pilot.
2. Use the approved front image as the image reference for all five derived views.
3. Generate the detail and side views before the room scenes to verify identity consistency early.
4. Generate room scenes with the reference physical size, intended room, and neutral interior styling.
5. Generate or compose the size-reference view last so it uses the approved product scale.
6. Repeat for the remaining three pilots.

Do not generate all 24 files independently from text prompts. Every derived view must reference its product's approved master image.

## Review and Failure Handling

Each image receives one of three internal decisions: `approved`, `regenerate`, or `hold`.

- `approved`: artwork identity, proportions, materials, and scale pass review.
- `regenerate`: the image has a correct role but fails identity, anatomy, geometry, lighting, scale, text, or artifact checks.
- `hold`: the underlying master direction or physical reproducibility needs an operator decision.

Regenerating one role must not overwrite approved files. Rejected files stay outside the upload folder or use a clearly non-importable review filename.

If a master changes, all five derived images become invalid and must be regenerated from the newly approved master.

## R2 and Sanity Publication Flow

The first four pilots remain local until the owner approves all 24 images.

The current legacy media audit expects an original physical photograph and the roles `original`, `front`, `detail`, `living_room`, `angle`, and `bedroom`. Implementation must add a separate `made_to_order_generated` audit profile for this batch. The new profile requires `front`, `detail`, `side`, `living_room`, `bedroom` or `dining_room`, and `size_reference`. The legacy profile and all previous folder decisions remain unchanged.

After approval:

1. Validate `product-manifest.json`, duplicate slugs, reference dimensions, filenames, and six-role completeness.
2. Run the media audit with the `made_to_order_generated` profile against the approved local source folders.
3. Review media identity, roles, rights, alt text, reproducibility, and room proportions.
4. Produce a product-and-media dry run showing every proposed Sanity field and R2 key.
5. Create unpublished Sanity product drafts only after the dry run is explicitly approved. Store the returned immutable document IDs in the applied result; never infer or overwrite an existing product.
6. Upload optimized derivatives to the `yiiart-media` R2 bucket through the reviewed importer.
7. Append media records to the new Sanity documents without overwriting or deleting existing media.
8. Enable publication and direct checkout only after titles, slugs, sizes, prices, production model, rights status, shipping profile, and checkout eligibility are reviewed.
9. Validate gallery order and responsive rendering in a preview deployment.
10. Publish to production only after desktop and mobile approval.

The R2 custom media domain remains `https://art-media.yiiart.com`. Existing routes and product URLs do not change without separate approval.

## Product Page Presentation

Each pilot product page should communicate the operational model without mentioning the generation tool:

- `Hand-painted to order` or `Made to Order` near the purchase area.
- Materials and reference dimensions that the studio can actually fulfill.
- Custom size and color entry through the existing inquiry path.
- A production-stage explanation that the customer receives real completion photos and video before shipment.
- A clear approval-before-shipment step.
- Shipping, damage, and returns language drawn from YiiArt's editable policy content.

Do not add invented customer reviews, customer photos, sales counts, discount claims, artist biographies, certificates, delivery guarantees, or refund guarantees.

## Validation Checklist

Before local approval:

- Four product folders exist and each contains the six required roles.
- Every derived image visibly matches its approved master.
- Reference dimensions and orientation match the room scenes.
- No third-party marks, characters, text artifacts, or copied competitor compositions appear.
- The studio confirms that each master can be hand-painted with available materials.

Before website publication:

- The explicit product manifest passes schema, duplicate-slug, role, and file validation.
- The `made_to_order_generated` media audit and product-and-media dry run pass for the approved batch.
- R2 URLs return the optimized assets.
- Sanity media order matches the six-image standard.
- Product title, slug, size options, price, production model, and checkout eligibility are reviewed.
- Product gallery works on desktop and mobile without stretching, blank media, overflow, or layout shift.
- Cart behavior is regression-tested without submitting a payment.
- No existing product, media, review, order, customer, checkout, or payment data is deleted or overwritten.

## Acceptance Criteria

1. Four original pilots exist in the approved series, format, palette, and reference size.
2. Each pilot has one master and five consistent derived images in the approved order.
3. Every image is physically reproducible, rights-safe, free of visual artifacts, and correctly scaled.
4. All 24 pilot files are reviewed locally before any publication action.
5. The existing audit and dry-run pipeline gates R2 and Sanity changes.
6. Storefront copy uses the made-to-order and pre-shipment approval model without falsely describing generated media as real finished-work photography.
7. Checkout, payment, customer data, existing product data, and existing URLs remain unchanged.
8. The approved pilot establishes a repeatable template for expanding to 24 products and 144 gallery images.
