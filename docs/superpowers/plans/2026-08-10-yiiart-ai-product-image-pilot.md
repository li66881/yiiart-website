# YiiArt AI-Assisted Product Image Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and locally approve four original made-to-order painting products with six internally consistent e-commerce images per product, without uploading or publishing anything.

**Architecture:** Each product begins with one approved front-view master. The other five images are image-to-image derivatives that reference that exact master, never independent text-only generations. Source PNGs and the batch manifest live outside Git in the owner-approved Google Drive folder; the repository remains unchanged during image generation.

**Tech Stack:** OpenAI ImageGen, Codex `view_image`, PowerShell, JSON, existing YiiArt product-media conventions.

## Global Constraints

- Create four pilot products and exactly six approved PNG images per product.
- Use only original generated compositions; do not use competitor images or protected characters as references.
- Do not mention the generation process in public product copy, but retain internal provenance in the manifest.
- Present products publicly only as made-to-order designs with real completion photos and video sent for approval before shipment.
- Keep generated sources outside Git under `C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch`.
- Do not upload to Cloudflare R2, write to Sanity, create live products, or publish website changes in this plan.
- Do not modify checkout, payment, cart, order, customer, review, existing product, or URL behavior.
- A changed master invalidates all five derived images for that product.
- Do not commit generated binary images to Git.

---

### Task 1: Prepare the Local Batch Structure

**Files:**
- Create: `C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\product-manifest.json`
- Create directories: `quiet-geometry-01`, `gilded-shore-01`, `ink-garden-01`, `retro-ritual-01`

**Interfaces:**
- Consumes: Approved design spec at `docs/superpowers/specs/2026-08-10-yiiart-ai-product-image-pilot-design.md`.
- Produces: Four empty product folders and one valid manifest used by Tasks 2-6.

- [ ] **Step 1: Create the batch and product directories**

Run:

```powershell
$root = 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch'
New-Item -ItemType Directory -Force -Path $root
@('quiet-geometry-01','gilded-shore-01','ink-garden-01','retro-ritual-01') |
  ForEach-Object { New-Item -ItemType Directory -Force -Path (Join-Path $root $_) }
```

Expected: the root and all four product directories exist.

- [ ] **Step 2: Create the explicit product manifest**

Create this JSON with `apply_patch`:

```json
{
  "schemaVersion": 1,
  "batchId": "2026-first-batch",
  "mediaProfile": "made_to_order_generated",
  "publicDisclosure": "made_to_order",
  "preShipmentApprovalRequired": true,
  "products": [
    {
      "title": "Quiet Geometry 01",
      "slug": "quiet-geometry-01",
      "seriesSlug": "quiet-geometry",
      "widthCm": 100,
      "heightCm": 100,
      "orientation": "square",
      "materials": ["acrylic", "texture paste"],
      "secondRoom": "bedroom",
      "status": "pending_generation",
      "files": ["01-front.png", "02-detail.png", "03-side.png", "04-living-room.png", "05-bedroom.png", "06-size-reference.png"]
    },
    {
      "title": "Gilded Shore 01",
      "slug": "gilded-shore-01",
      "seriesSlug": "gilded-shore",
      "widthCm": 120,
      "heightCm": 80,
      "orientation": "landscape",
      "materials": ["acrylic", "texture paste", "optional gold foil"],
      "secondRoom": "dining_room",
      "status": "pending_generation",
      "files": ["01-front.png", "02-detail.png", "03-side.png", "04-living-room.png", "05-dining-room.png", "06-size-reference.png"]
    },
    {
      "title": "Ink Garden 01",
      "slug": "ink-garden-01",
      "seriesSlug": "ink-garden",
      "widthCm": 80,
      "heightCm": 120,
      "orientation": "portrait",
      "materials": ["acrylic", "texture paste"],
      "secondRoom": "bedroom",
      "status": "pending_generation",
      "files": ["01-front.png", "02-detail.png", "03-side.png", "04-living-room.png", "05-bedroom.png", "06-size-reference.png"]
    },
    {
      "title": "Retro Ritual 01",
      "slug": "retro-ritual-01",
      "seriesSlug": "retro-ritual",
      "widthCm": 100,
      "heightCm": 100,
      "orientation": "square",
      "materials": ["acrylic", "texture paste"],
      "secondRoom": "dining_room",
      "status": "pending_generation",
      "files": ["01-front.png", "02-detail.png", "03-side.png", "04-living-room.png", "05-dining-room.png", "06-size-reference.png"]
    }
  ]
}
```

- [ ] **Step 3: Validate the manifest and folder count**

Run:

```powershell
$root = 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch'
$manifest = Get-Content -Raw (Join-Path $root 'product-manifest.json') | ConvertFrom-Json
if ($manifest.products.Count -ne 4) { throw 'Expected exactly four products.' }
foreach ($product in $manifest.products) {
  if ($product.files.Count -ne 6) { throw "Expected six files for $($product.slug)." }
  if (-not (Test-Path (Join-Path $root $product.slug))) { throw "Missing folder $($product.slug)." }
}
```

Expected: exit code 0 with no error.

### Task 2: Generate Quiet Geometry 01

**Files:**
- Create: `C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\quiet-geometry-01\01-front.png`
- Create: the five remaining filenames listed for `quiet-geometry-01` in the manifest.
- Modify: `product-manifest.json`

**Interfaces:**
- Consumes: Quiet Geometry dimensions, materials, and filenames from the manifest.
- Produces: One approved master plus five master-referenced derivatives.

- [ ] **Step 1: Generate the front-view master**

Use ImageGen with no external reference image:

```text
Create an original square handmade modern abstract painting shown perfectly front-on, isolated against a clean warm-white studio background. The canvas design uses asymmetrical interlocking geometric fields in muted olive green and warm ivory, one restrained charcoal vertical counterpoint, generous calm negative space, and physically achievable shallow relief made with acrylic paint and texture paste. Sophisticated interior-art quality, balanced but not symmetrical, tactile without extreme sculptural depth. Show the complete 1:1 artwork with straight edges and even neutral lighting. No frame, room, people, furniture, text, signature, logo, watermark, famous artwork, recognizable artist style, or copied composition.
```

Save the resulting source as `01-front.png`.

- [ ] **Step 2: Inspect and approve the master**

Open `01-front.png` with `view_image` at original detail. Approve only when the composition is original, square, centered, reproducible with acrylic and texture paste, free of text and artifacts, and visually strong enough to anchor five derivatives. Regenerate the master until all checks pass.

- [ ] **Step 3: Generate the five derivatives from the approved master**

Use `01-front.png` as the referenced image for every call.

`02-detail.png`:

```text
Using the exact referenced painting, create a close macro detail of an identifiable intersection between the olive, ivory, and charcoal areas. Preserve the exact palette, edge geometry, brush direction, and shallow texture placement from the source. Show physically plausible acrylic and texture-paste relief under soft raking light. Do not invent new shapes, colors, text, or signatures.
```

`03-side.png`:

```text
Using the exact referenced painting, show the same complete square artwork from an approximately 35-degree side angle in a neutral white studio. Preserve the composition, colors, orientation, and texture locations. Show a believable 3.5 cm gallery-wrap canvas edge and physically achievable shallow relief. No frame, room furniture, text, logo, or redesign.
```

`04-living-room.png`:

```text
Place the exact referenced 100 x 100 cm square painting in a refined modern living room above a 220 cm wide neutral sofa. Preserve the artwork without cropping, recoloring, mirroring, stretching, or redesign. Use warm-white walls, natural oak, charcoal and muted green accents, realistic daylight, believable perspective, and accurate scale. No people, text, logo, duplicate painting, or decorative visual clutter.
```

`05-bedroom.png`:

```text
Place the exact referenced 100 x 100 cm square painting in a calm modern bedroom above a 180 cm wide bed. Preserve the artwork exactly. Use warm-white walls, restrained olive textiles, natural wood, soft daylight, believable perspective, and accurate physical scale. No people, text, logo, duplicate painting, recoloring, cropping, or mirrored composition.
```

`06-size-reference.png`:

```text
Create a clean scale-reference interior using the exact referenced 100 x 100 cm painting centered above a 220 cm wide sofa. Preserve the artwork exactly and make the relative dimensions visually accurate. Keep the room minimal and front-facing so viewers can understand scale. Do not generate measurement text, arrows, people, logos, duplicate paintings, or altered artwork.
```

- [ ] **Step 4: Review all six images together**

Inspect every image with `view_image`. Regenerate only the failed derivative unless `01-front.png` changes. Reject any derivative that changes the master composition, color placement, orientation, focal shapes, texture location, or reference scale.

- [ ] **Step 5: Record approval and hashes**

Set the product status to `approved_local` and add a SHA-256 hash for each file in the manifest only after all six pass.

Run:

```powershell
Get-ChildItem 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\quiet-geometry-01\*.png' |
  Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  Select-Object Path, Hash
```

Expected: six unique file paths and six non-empty hashes.

### Task 3: Generate Gilded Shore 01

**Files:**
- Create: the six manifest filenames under `gilded-shore-01`.
- Modify: `product-manifest.json`

**Interfaces:**
- Consumes: Gilded Shore dimensions, materials, and filenames from the manifest.
- Produces: One approved landscape master plus five master-referenced derivatives.

- [ ] **Step 1: Generate and approve the front-view master**

Use ImageGen with no external reference image:

```text
Create an original 3:2 landscape handmade abstract painting shown perfectly front-on, isolated against a clean warm-white studio background. Build a quiet abstract shoreline from layered warm ivory and taupe horizontal terrain, a thin gray-blue horizon, controlled plaster-like impasto, and one restrained irregular gold-foil passage that catches light without dominating. Calm contemporary wall art, refined organic asymmetry, generous breathing room, physically reproducible with acrylic, texture paste, and optional gold foil. Show the complete artwork with straight edges and even neutral lighting. No frame, room, text, signature, logo, watermark, famous artwork, recognizable artist style, or copied composition.
```

Save as `01-front.png`, inspect with `view_image`, and regenerate until it passes originality, 3:2 format, material feasibility, edge, and artifact checks.

- [ ] **Step 2: Generate the five derivatives from `01-front.png`**

Use the approved master as the referenced image for every call. Every prompt must require the exact source composition, horizon, gold placement, palette, texture locations, and 3:2 orientation to remain unchanged, with no new shapes or colors. Use these role-specific requirements:

```text
02-detail.png: macro detail of the taupe, gray-blue, and restrained gold transition; exact texture and color placement; soft raking light.
03-side.png: complete landscape artwork at a 35-degree angle; 3.5 cm gallery-wrap edge; neutral studio.
04-living-room.png: exact 120 x 80 cm artwork above a 240 cm sofa; quiet modern room; correct 3:2 scale.
05-dining-room.png: exact 120 x 80 cm artwork above a 180 cm sideboard beside a six-seat dining table; accurate scale.
06-size-reference.png: front-facing minimal room with the exact 120 x 80 cm artwork above a 240 cm sofa; no generated labels or arrows.
```

For every derivative, prohibit crop, mirror, stretch, recolor, redesign, text, people, logos, and duplicate paintings.

- [ ] **Step 3: Inspect, regenerate failures, and record hashes**

Use `view_image` on all six files. Set `approved_local` only after identity, gold placement, horizon, texture, perspective, and scale pass.

Run:

```powershell
Get-ChildItem 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\gilded-shore-01\*.png' |
  Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  Select-Object Path, Hash
```

Record all six SHA-256 hashes in the manifest.

Expected: six approved PNGs and six hashes.

### Task 4: Generate Ink Garden 01

**Files:**
- Create: the six manifest filenames under `ink-garden-01`.
- Modify: `product-manifest.json`

**Interfaces:**
- Consumes: Ink Garden dimensions, materials, and filenames from the manifest.
- Produces: One approved portrait master plus five master-referenced derivatives.

- [ ] **Step 1: Generate and approve the front-view master**

Use ImageGen with no external reference image:

```text
Create an original 2:3 portrait handmade modern abstract painting shown perfectly front-on, isolated against a clean warm-white studio background. On a soft cream ground, use flowing ink-green and sage botanical lines, rain-like vertical brush traces, layered translucent leaf suggestions, controlled negative space, and modest tactile acrylic texture. The composition feels calm, organic, contemporary, and suitable for an entryway or bedroom while remaining clearly original and physically reproducible with acrylic and texture paste. Show the complete artwork with straight edges and even neutral lighting. No frame, room, text, calligraphy, signature, logo, watermark, famous artwork, recognizable artist style, or copied composition.
```

Save as `01-front.png`, inspect with `view_image`, and regenerate until the portrait composition, palette, negative space, and material feasibility pass.

- [ ] **Step 2: Generate the five derivatives from `01-front.png`**

Use the approved master as the referenced image for every call:

```text
02-detail.png: macro detail of one identifiable meeting point between an ink-green botanical line, sage wash, cream ground, and rain trace; exact source placement.
03-side.png: complete portrait artwork at a 35-degree angle; 3.5 cm gallery-wrap edge; neutral studio.
04-living-room.png: exact 80 x 120 cm portrait artwork on a narrow wall beside a 220 cm sofa; believable scale and calm modern interior.
05-bedroom.png: exact 80 x 120 cm portrait artwork above a 90 cm wide bedside console, not stretched across the full bed; accurate scale.
06-size-reference.png: front-facing minimal interior with the exact 80 x 120 cm artwork above an 80 cm console; no generated labels or arrows.
```

For every derivative, prohibit crop, mirror, stretch, recolor, new leaves, new marks, text, people, logos, and duplicate paintings.

- [ ] **Step 3: Inspect, regenerate failures, and record hashes**

Use `view_image` on all six files. Set `approved_local` only after the botanical lines, rain marks, negative space, orientation, and room scale remain consistent. Record SHA-256 hashes.

Run:

```powershell
Get-ChildItem 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\ink-garden-01\*.png' |
  Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  Select-Object Path, Hash
```

Expected: six approved PNGs and six hashes.

### Task 5: Generate Retro Ritual 01

**Files:**
- Create: the six manifest filenames under `retro-ritual-01`.
- Modify: `product-manifest.json`

**Interfaces:**
- Consumes: Retro Ritual dimensions, materials, and filenames from the manifest.
- Produces: One approved square master plus five master-referenced derivatives.

- [ ] **Step 1: Generate and approve the front-view master**

Use ImageGen with no external reference image:

```text
Create an original square handmade modern still-life painting shown perfectly front-on, isolated against a clean warm-white studio background. Arrange an invented geometric tea vessel, one cup, and an abstract floral branch on a simplified table plane. Use cream, muted oxide red, deep ink blue, and soft eucalyptus green with bold but refined shapes, tactile acrylic brushwork, and restrained texture paste. Contemporary retro interior art, sophisticated rather than cartoonish, visually balanced and physically reproducible. Show the complete artwork with straight edges and even neutral lighting. No people, character, face, animal, brand, recognizable product design, text, signature, logo, watermark, famous artwork, recognizable artist style, or copied composition.
```

Save as `01-front.png`, inspect with `view_image`, and regenerate until the vessel, cup, branch, palette, originality, and physical feasibility pass.

- [ ] **Step 2: Generate the five derivatives from `01-front.png`**

Use the approved master as the referenced image for every call:

```text
02-detail.png: macro detail of an identifiable overlap between the invented tea vessel, oxide-red plane, and floral branch; exact source placement and brushwork.
03-side.png: complete square artwork at a 35-degree angle; 3.5 cm gallery-wrap edge; neutral studio.
04-living-room.png: exact 100 x 100 cm artwork above a 220 cm sofa in a refined modern-retro living room; accurate scale.
05-dining-room.png: exact 100 x 100 cm artwork above a 160 cm sideboard in a modern dining room; accurate scale.
06-size-reference.png: front-facing minimal room with the exact 100 x 100 cm artwork above a 160 cm sideboard; no generated labels or arrows.
```

For every derivative, prohibit altered vessel geometry, added objects, crop, mirror, stretch, recolor, text, characters, people, logos, and duplicate paintings.

- [ ] **Step 3: Inspect, regenerate failures, and record hashes**

Use `view_image` on all six files. Set `approved_local` only after object count, shape, palette, texture, and scale remain consistent. Record SHA-256 hashes.

Run:

```powershell
Get-ChildItem 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\retro-ritual-01\*.png' |
  Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  Select-Object Path, Hash
```

Expected: six approved PNGs and six hashes.

### Task 6: Validate and Present the Local Pilot Batch

**Files:**
- Modify: `C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\product-manifest.json`
- Create: `C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch\batch-review.md`

**Interfaces:**
- Consumes: Four approved product folders and their per-file hashes.
- Produces: A complete local batch ready for owner review, but not approved for upload.

- [ ] **Step 1: Validate every required file and exact image count**

Run:

```powershell
$root = 'C:\Users\Administrator\Desktop\谷歌云端硬盘\黄亮\YiiArt-AI新品\2026-first-batch'
$manifest = Get-Content -Raw (Join-Path $root 'product-manifest.json') | ConvertFrom-Json
$allFiles = @()
foreach ($product in $manifest.products) {
  foreach ($name in $product.files) {
    $path = Join-Path (Join-Path $root $product.slug) $name
    if (-not (Test-Path $path)) { throw "Missing required file: $path" }
    $allFiles += $path
  }
}
if ($allFiles.Count -ne 24) { throw "Expected 24 required files, found $($allFiles.Count)." }
$pngCount = (Get-ChildItem $root -Recurse -File -Filter '*.png').Count
if ($pngCount -ne 24) { throw "Expected exactly 24 PNG files, found $pngCount." }
```

Expected: exit code 0 with exactly 24 required PNGs.

- [ ] **Step 2: Perform the final visual consistency pass**

Open all 24 files with `view_image`, product by product. Compare each derivative against `01-front.png`. Mark a product `hold` if any identity, orientation, color placement, texture location, furniture geometry, scale, text, logo, or artifact issue remains.

- [ ] **Step 3: Write the local review summary**

Create `batch-review.md` with one row per product and these columns:

```markdown
| Product | Front | Detail | Side | Living room | Second room | Size reference | Reproducible | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

Use only `approved`, `regenerate`, or `hold` as media decisions. The batch decision remains `owner_review_required` even when all internal checks pass.

- [ ] **Step 4: Confirm that no publication action occurred**

Run:

```powershell
git status --short
```

Expected: no generated PNG or local manifest appears in Git status, and no R2/Sanity apply command has been run.

- [ ] **Step 5: Present the four local product folders for owner review**

Report the absolute root path, number of products, number of images, any regenerated roles, any holds, and the local review decision. Do not start the R2/Sanity publication plan until the owner approves the 24-image batch.
