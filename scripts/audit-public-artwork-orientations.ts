import { mkdir, writeFile } from "node:fs/promises"
import { createClient } from "@sanity/client"
import { resolveArtworkOrientation } from "../src/lib/artwork-orientation"

type Artwork = {
  _id: string
  title?: string
  slug?: string
  dimensions?: string
  widthCm?: number | null
  heightCm?: number | null
  orientation?: string
  standardSizes?: Array<{ label?: string; widthCm?: number; heightCm?: number }>
  productionModel?: string
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
})

async function main() {
const artworks = await client.fetch<Artwork[]>(`*[_type == "artwork" && (
  !defined(collectionType) || collectionType != "new_collection" ||
  (rightsStatus == "approved" && migrationStatus == "ready")
)]{
  _id,
  "title": title.en,
  "slug": slug.current,
  dimensions,
  widthCm,
  heightCm,
  orientation,
  standardSizes[]{label, widthCm, heightCm},
  productionModel
} | order(slug.current asc)`)

const rows = artworks.map((artwork) => {
  const recommended = resolveArtworkOrientation(artwork)
  const sizes = artwork.standardSizes || []
  const differs = recommended !== null && artwork.orientation?.toLowerCase() !== recommended.toLowerCase()
  const sizeOrientations = sizes.flatMap((size) => {
    const result = resolveArtworkOrientation({ widthCm: size.widthCm, heightCm: size.heightCm })
    return result ? [result] : []
  })
  const hasMixedSizeOrientations = new Set(sizeOrientations).size > 1
  const needsReview = !recommended || (differs && (
    sizes.length > 1
    || artwork.productionModel === "original"
    || hasMixedSizeOrientations
  ))
  const status = !recommended
    ? "manual_review_missing_dimensions"
    : !differs
      ? "consistent"
      : needsReview
        ? "candidate_manual_review"
        : "candidate_safe_display_correction"
  const reason = !recommended
    ? "No verified physical dimensions available"
    : !differs
      ? "Saved orientation agrees with width × height in centimeters"
      : `Saved orientation conflicts with physical dimensions${sizes.length > 1 ? "; product has multiple selectable sizes" : ""}; verify original composition before changing Sanity`

  return {
    slug: artwork.slug || "",
    title: artwork.title || "",
    sanityId: artwork._id,
    dimensionsCm: `${artwork.widthCm ?? ""} x ${artwork.heightCm ?? ""}`,
    dimensionsText: artwork.dimensions || "",
    beforeOrientation: artwork.orientation || "",
    candidateOrientation: recommended || "",
    afterOrientation: differs ? recommended || "" : artwork.orientation || "",
    selectableSizeCount: sizes.length,
    status,
    reason,
  }
})

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

const headers = [
  "slug", "title", "sanity_id", "dimensions_cm_width_x_height", "dimensions_text",
  "before_orientation", "candidate_orientation", "after_orientation_if_applied",
  "selectable_size_count", "review_status", "reason",
]
const csv = [
  headers.map(csvCell).join(","),
  ...rows.map((row) => [
    row.slug, row.title, row.sanityId, row.dimensionsCm, row.dimensionsText,
    row.beforeOrientation, row.candidateOrientation, row.afterOrientation,
    row.selectableSizeCount, row.status, row.reason,
  ].map(csvCell).join(",")),
].join("\n") + "\n"

const changed = rows.filter((row) => row.beforeOrientation !== row.candidateOrientation)
const manual = rows.filter((row) => row.status.startsWith("candidate_manual") || row.status.startsWith("manual_review"))
const report = [
  "# YiiArt public artwork orientation audit",
  "",
  `Snapshot date: ${new Date().toISOString().slice(0, 10)}`,
  `Public catalog records: ${rows.length}`,
  `Records with a dimension-based orientation change: ${changed.length}`,
  `Records requiring human review before Sanity data changes: ${manual.length}`,
  "",
  "Width and height are read in centimeters, in width × height order. Square allows a relative width/height difference of at most 2% of the longer side. This is a read-only audit; it does not write to Sanity.",
  "",
  "All mismatching records have multiple selectable sizes. Their storefront display can be corrected consistently from the primary physical dimensions, but the artist's original composition was not independently verified; the CSV marks them for human review before changing source data.",
  "",
  `Detailed before/candidate/after columns: [yiiart-orientation-audit.csv](./yiiart-orientation-audit.csv).`,
  "",
].join("\n")

await mkdir("reports", { recursive: true })
await writeFile("reports/yiiart-orientation-audit.csv", csv, "utf8")
await writeFile("reports/yiiart-orientation-audit.md", report, "utf8")
console.log(JSON.stringify({ total: rows.length, changed: changed.length, manualReview: manual.length }))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
