import {
  calculateRolledPriceCny,
  getCatalogSizes,
  partitionRolledSizesForCheckout,
  type SizeProfileId,
} from "./storefront/catalog-config"
import {
  isPhysicalDimensions,
  parsePhysicalDimensions,
  readPhysicalDimensions,
  type PhysicalDimensions,
} from "./physical-dimensions"

export { parsePhysicalDimensions } from "./physical-dimensions"

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
  shippingProfile: "Ships rolled"
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

type ComparableSourceArtwork = SourceArtwork & {
  sizeProfile?: SizeProfileId | null
  standardSizes?: PlannedArtworkPatch["standardSizes"] | null
  frameOptions?: PlannedArtworkPatch["frameOptions"] | null
  seriesSlug?: string | null
  seriesRank?: number | null
}

export type MigrationSkipReason =
  | "missing_review_decision"
  | "invalid_review_decision"
  | "artwork_id_mismatch"
  | "slug_mismatch"
  | "missing_physical_dimensions"

export type PlannedArtworkMigration =
  | { status: "ready"; artworkId: string; patch: Partial<PlannedArtworkPatch> }
  | { status: "skipped"; artworkId: string; reason: MigrationSkipReason }

function resolvePhysicalDimensions(source: SourceArtwork, decision: MigrationDecision): PhysicalDimensions | null {
  if (decision.physicalSize) return isPhysicalDimensions(decision.physicalSize) ? decision.physicalSize : null

  return readPhysicalDimensions(source.widthCm, source.heightCm)
    || parsePhysicalDimensions(source.dimensions)
}

function orientationFor({ widthCm, heightCm }: PhysicalDimensions): PlannedArtworkPatch["orientation"] {
  if (widthCm === heightCm) return "Square"
  return widthCm > heightCm ? "Landscape" : "Portrait"
}

function hasSameValues(values: readonly string[] | null | undefined, nextValues: readonly string[]) {
  return values?.length === nextValues.length && values.every((value, index) => value === nextValues[index])
}

function hasSameStandardSizes(
  values: ComparableSourceArtwork["standardSizes"],
  nextValues: PlannedArtworkPatch["standardSizes"],
) {
  return values?.length === nextValues.length && values.every((value, index) => {
    const next = nextValues[index]
    return value._key === next._key
      && value._type === next._type
      && value.label === next.label
      && value.widthCm === next.widthCm
      && value.heightCm === next.heightCm
      && value.priceCny === next.priceCny
  })
}

function hasSameFrameOptions(
  values: ComparableSourceArtwork["frameOptions"],
  nextValues: PlannedArtworkPatch["frameOptions"],
) {
  return values?.length === nextValues.length && values.every((value, index) => {
    const next = nextValues[index]
    return value._key === next._key
      && value._type === next._type
      && value.label === next.label
      && value.priceDeltaCny === next.priceDeltaCny
  })
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isMigrationDecision(value: unknown): value is MigrationDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const decision = value as Record<string, unknown>
  const sizeProfiles: SizeProfileId[] = ["square", "two-three", "three-four", "near-square", "panoramic"]
  return typeof decision.artworkId === "string"
    && typeof decision.expectedSlug === "string"
    && sizeProfiles.includes(decision.sizeProfile as SizeProfileId)
    && typeof decision.rightsApproved === "boolean"
    && typeof decision.contentReady === "boolean"
    && typeof decision.enableRolledCheckout === "boolean"
    && (decision.physicalSize === undefined || isPhysicalDimensions(decision.physicalSize as PhysicalDimensions))
    && (decision.category === undefined || typeof decision.category === "string")
    && (decision.roomTypes === undefined || isStringArray(decision.roomTypes))
    && (decision.colorFamilies === undefined || isStringArray(decision.colorFamilies))
    && (decision.styleTags === undefined || isStringArray(decision.styleTags))
    && (decision.seriesSlug === undefined || typeof decision.seriesSlug === "string")
    && (decision.seriesRank === undefined || (typeof decision.seriesRank === "number"
      && Number.isFinite(decision.seriesRank)))
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
  if (!isMigrationDecision(decision)) return { status: "skipped", artworkId: source._id, reason: "invalid_review_decision" }
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
    && directSizes.length > 0
  const comparableSource = source as ComparableSourceArtwork
  const patch: Partial<PlannedArtworkPatch> = {}

  if (source.productionModel !== "hand_painted_to_order") patch.productionModel = "hand_painted_to_order"
  if (source.allowCheckout !== mayCheckout) patch.allowCheckout = mayCheckout
  if (mayCheckout && source.shippingProfile !== "Ships rolled") patch.shippingProfile = "Ships rolled"
  if (source.widthCm !== dimensions.widthCm) patch.widthCm = dimensions.widthCm
  if (source.heightCm !== dimensions.heightCm) patch.heightCm = dimensions.heightCm
  if (source.orientation !== orientation) patch.orientation = orientation
  if (comparableSource.sizeProfile !== decision.sizeProfile) patch.sizeProfile = decision.sizeProfile
  const standardSizes: PlannedArtworkPatch["standardSizes"] = directSizes.map((size) => ({
    _key: `rolled-${size.widthCm}x${size.heightCm}`,
    _type: "standardSize",
    label: size.label,
    widthCm: size.widthCm,
    heightCm: size.heightCm,
    priceCny: calculateRolledPriceCny(size.widthCm, size.heightCm)!,
  }))
  if (!hasSameStandardSizes(comparableSource.standardSizes, standardSizes)) patch.standardSizes = standardSizes
  const frameOptions: PlannedArtworkPatch["frameOptions"] = [{
    _key: "rolled",
    _type: "frameOption",
    label: "Rolled canvas",
    priceDeltaCny: 0,
  }]
  if (!hasSameFrameOptions(comparableSource.frameOptions, frameOptions)) patch.frameOptions = frameOptions

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
  if (decision.seriesSlug !== undefined && comparableSource.seriesSlug !== decision.seriesSlug) patch.seriesSlug = decision.seriesSlug
  if (decision.seriesRank !== undefined && comparableSource.seriesRank !== decision.seriesRank) patch.seriesRank = decision.seriesRank

  return { status: "ready", artworkId: source._id, patch }
}
