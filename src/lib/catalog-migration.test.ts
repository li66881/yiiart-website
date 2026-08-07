import assert from "node:assert/strict"
import test from "node:test"
import { parsePhysicalDimensions, planArtworkMigration } from "./catalog-migration"

const reviewedDecision = {
  artworkId: "art-1",
  expectedSlug: "green-rain-study",
  sizeProfile: "three-four" as const,
  rightsApproved: true,
  contentReady: true,
  enableRolledCheckout: true,
}

const reviewedSource = {
  _id: "art-1",
  slug: { current: "green-rain-study" },
  dimensions: "80 x 120 cm",
  shippingProfile: "Ships rolled",
}

test("parses physical centimeters without reading image dimensions", () => {
  assert.deepEqual(parsePhysicalDimensions("80 x 120 cm"), { widthCm: 80, heightCm: 120 })
  assert.deepEqual(parsePhysicalDimensions("80 X 120 CM"), { widthCm: 80, heightCm: 120 })
  assert.deepEqual(parsePhysicalDimensions("80 \u00d7 120 cm"), { widthCm: 80, heightCm: 120 })
  assert.equal(parsePhysicalDimensions("1865 x 2785 pixels"), null)
  assert.equal(parsePhysicalDimensions("80 x 120 px"), null)
  assert.equal(parsePhysicalDimensions("80 x 120"), null)
  assert.equal(parsePhysicalDimensions("0 x 120 cm"), null)
})

test("rejects negative physical dimensions instead of matching their absolute values", () => {
  const result = planArtworkMigration(
    { ...reviewedSource, dimensions: "-80 x 120 cm" },
    reviewedDecision,
  )

  assert.equal(parsePhysicalDimensions("-80 x 120 cm"), null)
  assert.equal(parsePhysicalDimensions("- 80 x 120 cm"), null)
  assert.deepEqual(result, { status: "skipped", artworkId: "art-1", reason: "missing_physical_dimensions" })
})

test("plans made-to-order rolled options with deterministic keys", () => {
  const result = planArtworkMigration(reviewedSource, reviewedDecision)

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.equal(result.patch.productionModel, "hand_painted_to_order")
  assert.equal(result.patch.collectionType, "new_collection")
  assert.equal(result.patch.rightsStatus, "approved")
  assert.equal(result.patch.migrationStatus, "ready")
  assert.equal(result.patch.allowCheckout, true)
  assert.equal(result.patch.orientation, "Portrait")
  assert.deepEqual(result.patch.frameOptions, [
    { _key: "rolled", _type: "frameOption", label: "Rolled canvas", priceDeltaCny: 0 },
  ])
  assert.ok(result.patch.standardSizes?.every((size) => Math.max(size.widthCm, size.heightCm) <= 210))
  assert.ok(result.patch.standardSizes?.every((size) => size._key === `rolled-${size.widthCm}x${size.heightCm}`))
})

test("keeps checkout disabled when commercial approval is absent", () => {
  const result = planArtworkMigration(reviewedSource, { ...reviewedDecision, enableRolledCheckout: false })
  assert.equal(result.status, "ready")
  if (result.status === "ready") assert.equal(result.patch.allowCheckout, false)
})

test("skips an ambiguous physical dimension and preserves source fields", () => {
  const source = { ...reviewedSource, _id: "art-3", slug: { current: "unknown" }, dimensions: "large" }
  const decision = { ...reviewedDecision, artworkId: "art-3", expectedSlug: "unknown", sizeProfile: "square" as const }

  const result = planArtworkMigration(source, decision)

  assert.deepEqual(result, { status: "skipped", artworkId: "art-3", reason: "missing_physical_dimensions" })
  assert.deepEqual(source, { ...reviewedSource, _id: "art-3", slug: { current: "unknown" }, dimensions: "large" })
})

test("skips missing or mismatched review decisions with explicit reasons", () => {
  assert.deepEqual(planArtworkMigration(reviewedSource, undefined), {
    status: "skipped",
    artworkId: "art-1",
    reason: "missing_review_decision",
  })
  assert.deepEqual(planArtworkMigration(reviewedSource, { ...reviewedDecision, artworkId: "other-art" }), {
    status: "skipped",
    artworkId: "art-1",
    reason: "artwork_id_mismatch",
  })
  assert.deepEqual(planArtworkMigration(reviewedSource, { ...reviewedDecision, expectedSlug: "wrong" }), {
    status: "skipped",
    artworkId: "art-1",
    reason: "slug_mismatch",
  })
})

test("skips runtime-incomplete or malformed review decisions", () => {
  const invalidDecisions = [
    { ...reviewedDecision, artworkId: undefined },
    { ...reviewedDecision, artworkId: 1 },
    { ...reviewedDecision, expectedSlug: undefined },
    { ...reviewedDecision, expectedSlug: 1 },
    { ...reviewedDecision, sizeProfile: undefined },
    { ...reviewedDecision, sizeProfile: "unreviewed" },
    { ...reviewedDecision, rightsApproved: undefined },
    { ...reviewedDecision, rightsApproved: "true" },
    { ...reviewedDecision, contentReady: undefined },
    { ...reviewedDecision, contentReady: "true" },
    { ...reviewedDecision, enableRolledCheckout: undefined },
    { ...reviewedDecision, enableRolledCheckout: "false" },
  ]

  for (const decision of invalidDecisions) {
    assert.deepEqual(planArtworkMigration(reviewedSource, decision as any), {
      status: "skipped",
      artworkId: "art-1",
      reason: "invalid_review_decision",
    })
  }
})

test("uses reviewed centimeter dimensions and derives orientation from them", () => {
  const result = planArtworkMigration(
    { ...reviewedSource, dimensions: "1865 x 2785 pixels", widthCm: 120, heightCm: 80, orientation: "Portrait" },
    reviewedDecision,
  )

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.equal("widthCm" in result.patch, false)
  assert.equal("heightCm" in result.patch, false)
  assert.equal(result.patch.orientation, "Landscape")
  assert.deepEqual(result.patch.standardSizes?.[0], {
    _key: "rolled-60x45",
    _type: "standardSize",
    label: "60 x 45 cm",
    widthCm: 60,
    heightCm: 45,
    priceCny: 1300,
  })
})

test("gates publication fields independently and preserves unreviewed source tags", () => {
  const source = {
    ...reviewedSource,
    category: "Existing category",
    roomTypes: ["Living room"],
    colorFamilies: ["Green"],
    styleTags: ["Existing style"],
  }
  const decision = {
    ...reviewedDecision,
    category: "Textured Art",
    roomTypes: [],
    colorFamilies: [],
    styleTags: [],
    seriesSlug: "ink-garden",
    seriesRank: 2,
  }

  const reviewed = planArtworkMigration(source, decision)
  const rightsBlocked = planArtworkMigration(source, { ...decision, rightsApproved: false })
  const contentBlocked = planArtworkMigration(source, { ...decision, contentReady: false })

  assert.equal(reviewed.status, "ready")
  if (reviewed.status === "ready") {
    assert.equal(reviewed.patch.category, "Texture")
    assert.equal("roomTypes" in reviewed.patch, false)
    assert.equal("colorFamilies" in reviewed.patch, false)
    assert.equal("styleTags" in reviewed.patch, false)
    assert.equal(reviewed.patch.seriesSlug, "ink-garden")
    assert.equal(reviewed.patch.seriesRank, 2)
  }
  assert.equal(rightsBlocked.status, "ready")
  if (rightsBlocked.status === "ready") assert.equal(rightsBlocked.patch.collectionType, undefined)
  assert.equal(contentBlocked.status, "ready")
  if (contentBlocked.status === "ready") assert.equal(contentBlocked.patch.migrationStatus, undefined)
})

test("merges reviewed tags without erasing existing non-empty tags", () => {
  const result = planArtworkMigration(
    { ...reviewedSource, styleTags: ["Existing style"] },
    { ...reviewedDecision, styleTags: ["New style"] },
  )

  assert.equal(result.status, "ready")
  if (result.status === "ready") assert.deepEqual(result.patch.styleTags, ["Existing style", "New style"])
})

test("returns an idempotent patch without unchanged values", () => {
  const source = {
    ...reviewedSource,
    widthCm: 80,
    heightCm: 120,
    orientation: "Portrait",
    productionModel: "hand_painted_to_order",
    collectionType: "new_collection",
    rightsStatus: "approved",
    migrationStatus: "ready",
    allowCheckout: true,
    sizeProfile: "three-four" as const,
    standardSizes: [
      { _key: "rolled-45x60", _type: "standardSize" as const, label: "45 x 60 cm", widthCm: 45, heightCm: 60, priceCny: 1300 },
      { _key: "rolled-60x80", _type: "standardSize" as const, label: "60 x 80 cm", widthCm: 60, heightCm: 80, priceCny: 2300 },
      { _key: "rolled-75x100", _type: "standardSize" as const, label: "75 x 100 cm", widthCm: 75, heightCm: 100, priceCny: 3600 },
      { _key: "rolled-90x120", _type: "standardSize" as const, label: "90 x 120 cm", widthCm: 90, heightCm: 120, priceCny: 5180 },
      { _key: "rolled-105x140", _type: "standardSize" as const, label: "105 x 140 cm", widthCm: 105, heightCm: 140, priceCny: 7060 },
      { _key: "rolled-120x160", _type: "standardSize" as const, label: "120 x 160 cm", widthCm: 120, heightCm: 160, priceCny: 9220 },
      { _key: "rolled-135x180", _type: "standardSize" as const, label: "135 x 180 cm", widthCm: 135, heightCm: 180, priceCny: 11660 },
      { _key: "rolled-150x200", _type: "standardSize" as const, label: "150 x 200 cm", widthCm: 150, heightCm: 200, priceCny: 14400 },
    ],
    frameOptions: [{ _key: "rolled" as const, _type: "frameOption" as const, label: "Rolled canvas" as const, priceDeltaCny: 0 as const }],
    seriesSlug: "ink-garden",
    seriesRank: 2,
  }

  const decision = { ...reviewedDecision, seriesSlug: "ink-garden", seriesRank: 2 }
  const first = planArtworkMigration(source, decision)
  const second = planArtworkMigration(source, decision)

  assert.deepEqual(first, second)
  assert.equal(first.status, "ready")
  if (first.status === "ready") {
    assert.equal("productionModel" in first.patch, false)
    assert.equal("collectionType" in first.patch, false)
    assert.equal("rightsStatus" in first.patch, false)
    assert.equal("migrationStatus" in first.patch, false)
    assert.equal("allowCheckout" in first.patch, false)
    assert.equal("widthCm" in first.patch, false)
    assert.equal("heightCm" in first.patch, false)
    assert.equal("orientation" in first.patch, false)
    assert.equal("sizeProfile" in first.patch, false)
    assert.equal("standardSizes" in first.patch, false)
    assert.equal("frameOptions" in first.patch, false)
    assert.equal("seriesSlug" in first.patch, false)
    assert.equal("seriesRank" in first.patch, false)
  }
})
