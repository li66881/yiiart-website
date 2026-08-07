import {
  calculateRolledPriceCny,
  getCatalogSizes,
  partitionRolledSizesForCheckout,
  type SizeProfileId,
} from "./storefront/catalog-config"

export type SourceArtwork = {
  _id: string
  slug?: { current?: string }
  dimensions?: string | null
  widthCm?: number | null
  heightCm?: number | null
  orientation?: string | null
  category?: string | null
  roomTypes?: string[] | null
  colorFamilies?: string[] | null
  styleTags?: string[] | null
  collectionType?: string | null
  productionModel?: string | null
  rightsStatus?: string | null
  migrationStatus?: string | null
  allowCheckout?: boolean | null
  shippingProfile?: string | null
  productMedia?: unknown[] | null
}

export type MigrationDecision = {
  artworkId: string
  expectedSlug: string
  sizeProfile: SizeProfileId
  physicalSize?: { widthCm: number; heightCm: number }
  category?: string
  roomTypes?: string[]
  colorFamilies?: string[]
  styleTags?: string[]
  rightsApproved: boolean
  contentReady: boolean
  enableRolledCheckout: boolean
  seriesSlug?: string
  seriesRank?: number
}

export type PlannedArtworkPatch = {
  productionModel: "hand_painted_to_order"
  collectionType?: "new_collection"
  rightsStatus?: "approved"
  migrationStatus?: "ready"
  allowCheckout: boolean
  widthCm: number
  heightCm: number
  orientation: "Portrait" | "Landscape" | "Square"
  sizeProfile: SizeProfileId
  standardSizes: Array<{
    _key: string
    _type: "standardSize"
    label: string
    widthCm: number
    heightCm: number
    priceCny: number
  }>
  frameOptions: Array<{
    _key: "rolled"
    _type: "frameOption"
    label: "Rolled canvas"
    priceDeltaCny: 0
  }>
  category?: string
  roomTypes?: string[]
  colorFamilies?: string[]
  styleTags?: string[]
  seriesSlug?: string
  seriesRank?: number
}

export type MigrationSkipReason =
  | "missing_review_decision"
  | "artwork_id_mismatch"
  | "slug_mismatch"
  | "missing_physical_dimensions"

export type PlannedArtworkMigration =
  | { status: "ready"; artworkId: string; patch: Partial<PlannedArtworkPatch> }
  | { status: "skipped"; artworkId: string; reason: MigrationSkipReason }

type PhysicalDimensions = { widthCm: number; heightCm: number }

function isPhysicalDimensions(value: PhysicalDimensions | undefined | null): value is PhysicalDimensions {
  return Boolean(
    value
    && Number.isFinite(value.widthCm)
    && Number.isFinite(value.heightCm)
    && value.widthCm > 0
    && value.heightCm > 0,
  )
}

export function parsePhysicalDimensions(value: unknown): PhysicalDimensions | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  if (!normalized.includes("cm") || /\b(?:px|pixels?)\b/.test(normalized)) return null

  const match = normalized.match(/(\d+(?:\.\d+)?)\s*[x\u00d7\u8133]\s*(\d+(?:\.\d+)?)\s*cm\b/)
  if (!match) return null

  const dimensions = { widthCm: Number(match[1]), heightCm: Number(match[2]) }
  return isPhysicalDimensions(dimensions) ? dimensions : null
}

function resolvePhysicalDimensions(source: SourceArtwork, decision: MigrationDecision): PhysicalDimensions | null {
  if (decision.physicalSize) return isPhysicalDimensions(decision.physicalSize) ? decision.physicalSize : null

  const reviewedSourceDimensions = { widthCm: source.widthCm ?? Number.NaN, heightCm: source.heightCm ?? Number.NaN }
  return isPhysicalDimensions(reviewedSourceDimensions)
    ? reviewedSourceDimensions
    : parsePhysicalDimensions(source.dimensions)
}

function orientationFor({ widthCm, heightCm }: PhysicalDimensions): PlannedArtworkPatch["orientation"] {
  if (widthCm === heightCm) return "Square"
  return widthCm > heightCm ? "Landscape" : "Portrait"
}

function hasSameValues(values: readonly string[] | null | undefined, nextValues: readonly string[]) {
  return values?.length === nextValues.length && values.every((value, index) => value === nextValues[index])
}

function addReviewedTags(
  patch: Partial<PlannedArtworkPatch>,
  field: "roomTypes" | "colorFamilies" | "styleTags",
  current: string[] | null | undefined,
  reviewed: string[] | undefined,
) {
  if (!reviewed?.length) return

  const merged = [...(current ?? [])]
  for (const tag of reviewed) {
    if (!merged.includes(tag)) merged.push(tag)
  }
  if (!hasSameValues(current, merged)) patch[field] = merged
}

export function planArtworkMigration(
  source: SourceArtwork,
  decision: MigrationDecision | undefined,
): PlannedArtworkMigration {
  if (!decision) return { status: "skipped", artworkId: source._id, reason: "missing_review_decision" }
  if (decision.artworkId !== source._id) return { status: "skipped", artworkId: source._id, reason: "artwork_id_mismatch" }
  if (decision.expectedSlug !== source.slug?.current) return { status: "skipped", artworkId: source._id, reason: "slug_mismatch" }

  const dimensions = resolvePhysicalDimensions(source, decision)
  if (!dimensions) return { status: "skipped", artworkId: source._id, reason: "missing_physical_dimensions" }

  const orientation = orientationFor(dimensions)
  const directSizes = partitionRolledSizesForCheckout(
    getCatalogSizes(decision.sizeProfile, orientation.toLowerCase() as "portrait" | "landscape" | "square"),
  ).direct
  const mayPublish = decision.rightsApproved && decision.contentReady
  const mayCheckout = mayPublish
    && decision.enableRolledCheckout
    && source.shippingProfile === "Ships rolled"
    && directSizes.length > 0
  const patch: Partial<PlannedArtworkPatch> = {}

  if (source.productionModel !== "hand_painted_to_order") patch.productionModel = "hand_painted_to_order"
  if (source.allowCheckout !== mayCheckout) patch.allowCheckout = mayCheckout
  if (source.widthCm !== dimensions.widthCm) patch.widthCm = dimensions.widthCm
  if (source.heightCm !== dimensions.heightCm) patch.heightCm = dimensions.heightCm
  if (source.orientation !== orientation) patch.orientation = orientation
  patch.sizeProfile = decision.sizeProfile
  patch.standardSizes = directSizes.map((size) => ({
    _key: `rolled-${size.widthCm}x${size.heightCm}`,
    _type: "standardSize",
    label: size.label,
    widthCm: size.widthCm,
    heightCm: size.heightCm,
    priceCny: calculateRolledPriceCny(size.widthCm, size.heightCm)!,
  }))
  patch.frameOptions = [{
    _key: "rolled",
    _type: "frameOption",
    label: "Rolled canvas",
    priceDeltaCny: 0,
  }]

  if (mayPublish && source.collectionType !== "new_collection") patch.collectionType = "new_collection"
  if (decision.rightsApproved && source.rightsStatus !== "approved") patch.rightsStatus = "approved"
  if (decision.contentReady && source.migrationStatus !== "ready") patch.migrationStatus = "ready"
  if (decision.category) {
    const category = decision.category === "Textured Art" ? "Texture" : decision.category
    if (source.category !== category) patch.category = category
  }
  addReviewedTags(patch, "roomTypes", source.roomTypes, decision.roomTypes)
  addReviewedTags(patch, "colorFamilies", source.colorFamilies, decision.colorFamilies)
  addReviewedTags(patch, "styleTags", source.styleTags, decision.styleTags)
  if (decision.seriesSlug !== undefined) patch.seriesSlug = decision.seriesSlug
  if (decision.seriesRank !== undefined) patch.seriesRank = decision.seriesRank

  return { status: "ready", artworkId: source._id, patch }
}
