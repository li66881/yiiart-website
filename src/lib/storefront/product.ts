import {
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "../artwork-display"

export type StorefrontCollectionType = "new_collection" | "artist_collection"
export type StorefrontProductionModel = "hand_painted_to_order" | "original"
export type StorefrontRightsStatus = "approved" | "needs_review" | "blocked"
export type StorefrontMigrationStatus =
  | "ready"
  | "needs_copy"
  | "needs_images"
  | "needs_rights_review"
  | "archive"

export type StorefrontImage = {
  src: string
  alt: string
  width: number
  height: number
  kind: "artwork" | "room" | "detail" | "edge" | "scale"
}

export type StorefrontSize = {
  id: string
  label: string
  widthCm?: number
  heightCm?: number
  priceCny: number
}

export type StorefrontFinish = {
  id: string
  label: string
  priceDeltaCny: number
}

export type StorefrontProduct = {
  id: string
  slug: string
  title: string
  sku: string
  artistName: string
  collectionType: StorefrontCollectionType
  productionModel: StorefrontProductionModel
  rightsStatus: StorefrontRightsStatus
  migrationStatus: StorefrontMigrationStatus
  shortDescription: string
  artworkStory: string
  materials: string
  styleTags: string[]
  roomTags: string[]
  colorTags: string[]
  orientation: "portrait" | "landscape" | "square"
  sizes: StorefrontSize[]
  finishes: StorefrontFinish[]
  creationWindow: string
  images: StorefrontImage[]
}

/** MesonArt-adjacent made-to-order size ladder (H × W, inches + cm). */
const DEFAULT_MTO_SIZE_LADDER = [
  { heightIn: 20, widthIn: 24 },
  { heightIn: 24, widthIn: 32 },
  { heightIn: 24, widthIn: 36 },
  { heightIn: 30, widthIn: 40 },
  { heightIn: 32, widthIn: 48 },
  { heightIn: 36, widthIn: 48 },
  { heightIn: 36, widthIn: 54 },
  { heightIn: 40, widthIn: 54 },
  { heightIn: 40, widthIn: 60 },
  { heightIn: 48, widthIn: 64 },
  { heightIn: 48, widthIn: 72 },
  { heightIn: 54, widthIn: 72 },
  { heightIn: 60, widthIn: 80 },
] as const

type LocalizedText = string | { en?: string; zh?: string } | null

type StorefrontArtworkInput = {
  _id?: string
  title?: LocalizedText
  slug?: { current?: string }
  artist?: { name?: LocalizedText }
  price?: number | string | null
  dimensions?: string | null
  widthCm?: number | string | null
  heightCm?: number | string | null
  collectionType?: string | null
  productionModel?: string | null
  rightsStatus?: string | null
  migrationStatus?: string | null
  shortDescription?: LocalizedText
  description?: LocalizedText
  artworkStory?: LocalizedText
  materials?: LocalizedText
  medium?: string | null
  category?: string | null
  sku?: string | null
  styleTags?: unknown
  roomTypes?: unknown
  colorFamilies?: unknown
  orientation?: string | null
  creationWindow?: LocalizedText
  standardSizes?: unknown
  frameOptions?: unknown
}

type ProductImageInput = Partial<StorefrontImage> & Pick<StorefrontImage, "src">

export function buildStorefrontProduct(
  artwork: StorefrontArtworkInput,
  imageInputs: ProductImageInput[],
): StorefrontProduct {
  const productionModel = normalizeProductionModel(artwork.productionModel)
  const dimensions = formatArtworkDimensions(artwork)
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)

  const slug = cleanString(artwork.slug?.current) || cleanString(artwork._id) || slugify(title)
  const sku = cleanString(artwork.sku).toUpperCase() || slug.toUpperCase()

  return {
    id: cleanString(artwork._id) || slug,
    slug,
    title,
    sku,
    artistName: pickEnglish(artwork.artist?.name, "YiiArt Studio"),
    collectionType: normalizeCollectionType(artwork.collectionType),
    productionModel,
    rightsStatus: normalizeRightsStatus(artwork.rightsStatus),
    migrationStatus: normalizeMigrationStatus(artwork.migrationStatus),
    shortDescription: pickEnglish(
      artwork.shortDescription || artwork.description,
      productionModel === "hand_painted_to_order"
        ? "Individually hand-painted to order, with natural variations in brushwork and color."
        : "A physical, hand-painted artwork from the YiiArt artist collection.",
    ),
    artworkStory: pickEnglish(artwork.artworkStory || artwork.description, ""),
    materials: pickEnglish(artwork.materials, medium),
    styleTags: uniqueStrings([...readStringList(artwork.styleTags), category]),
    roomTags: uniqueStrings(readStringList(artwork.roomTypes)),
    colorTags: uniqueStrings(readStringList(artwork.colorFamilies)),
    orientation: normalizeOrientation(artwork.orientation, artwork.widthCm, artwork.heightCm, dimensions),
    sizes: buildSizes(artwork, productionModel, dimensions),
    finishes: buildFinishes(artwork.frameOptions, productionModel),
    creationWindow: pickEnglish(
      artwork.creationWindow,
      productionModel === "hand_painted_to_order"
        ? "Production timing is confirmed before checkout."
        : "Availability and dispatch timing are confirmed before checkout.",
    ),
    images: preferPrimaryProductImages(
      imageInputs
        .filter((image) => Boolean(cleanString(image.src)))
        .map((image, index) => ({
          src: cleanString(image.src),
          alt: cleanString(image.alt) || `${title}${index === 0 ? "" : ` view ${index + 1}`}`,
          width: positiveNumber(image.width) || 1400,
          height: positiveNumber(image.height) || 1750,
          kind: normalizeImageKind(image.kind, index),
        })),
    ),
  }
}

function buildSizes(
  artwork: StorefrontArtworkInput,
  _productionModel: StorefrontProductionModel,
  dimensions: string,
) {
  const fromCms = (Array.isArray(artwork.standardSizes) ? artwork.standardSizes : []).flatMap(
    (value, index): StorefrontSize[] => {
      if (!value || typeof value !== "object") return []
      const size = value as Record<string, unknown>
      const priceCny = positiveNumber(size.priceCny)
      if (!priceCny) return []

      const widthCm = positiveNumber(size.widthCm)
      const heightCm = positiveNumber(size.heightCm)
      const label = formatDualUnitLabel(widthCm, heightCm)
        || cleanString(size.label)
        || `Size ${index + 1}`

      return [{
        id: cleanString(size._key) || slugify(label),
        label,
        widthCm: widthCm || undefined,
        heightCm: heightCm || undefined,
        priceCny,
      }]
    },
  )

  if (fromCms.length >= 4) return fromCms

  const seed = fromCms.length > 0
    ? fromCms
    : (() => {
      const priceCny = positiveNumber(artwork.price)
      if (!priceCny) return [] as StorefrontSize[]
      const widthCm = positiveNumber(artwork.widthCm) || readDimension(dimensions, 0) || undefined
      const heightCm = positiveNumber(artwork.heightCm) || readDimension(dimensions, 1) || undefined
      return [{
        id: "original",
        label:
          formatDualUnitLabel(widthCm, heightCm)
          || cleanString(artwork.dimensions)
          || dimensions
          || "Original size",
        widthCm,
        heightCm,
        priceCny,
      }]
    })()

  return expandMadeToOrderSizes(seed, artwork)
}

function expandMadeToOrderSizes(
  existing: StorefrontSize[],
  artwork: StorefrontArtworkInput,
): StorefrontSize[] {
  const base = existing[0]
  const basePrice =
    base?.priceCny
    || positiveNumber(artwork.price)
    || 1800
  const baseArea =
    (base?.widthCm || 80) * (base?.heightCm || 100)

  const ladder = DEFAULT_MTO_SIZE_LADDER.map((entry) => {
    const widthCm = Math.round(entry.widthIn * 2.54)
    const heightCm = Math.round(entry.heightIn * 2.54)
    const area = widthCm * heightCm
    const priceCny = Math.max(200, Math.round((basePrice * (area / baseArea)) / 50) * 50)
    const label = formatDualUnitLabel(widthCm, heightCm) || `${heightCm} x ${widthCm} cm`
    return {
      id: `${entry.heightIn}x${entry.widthIn}`,
      label,
      widthCm,
      heightCm,
      priceCny,
    }
  })

  if (existing.length === 0) return ladder

  const seen = new Set(existing.map((size) => size.id))
  const merged = [...existing]
  for (const size of ladder) {
    if (seen.has(size.id)) continue
    seen.add(size.id)
    merged.push(size)
  }
  return merged
}

function formatDualUnitLabel(widthCm?: number | null, heightCm?: number | null) {
  if (!widthCm || !heightCm) return ""
  const widthIn = Math.round((widthCm / 2.54) * 10) / 10
  const heightIn = Math.round((heightCm / 2.54) * 10) / 10
  const fmtIn = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1))
  return `${fmtIn(heightIn)}"H x ${fmtIn(widthIn)}"W / ${Math.round(heightCm)}H x ${Math.round(widthCm)}W CM`
}

/** Prefer white-bg product shots; if none, fall back to room/scene images. */
function preferPrimaryProductImages(images: StorefrontImage[]) {
  if (images.length < 2) return images
  const whiteBg = images.filter((image) => image.kind === "artwork" || image.kind === "edge")
  const room = images.filter((image) => image.kind === "room")
  const rest = images.filter(
    (image) => image.kind !== "artwork" && image.kind !== "edge" && image.kind !== "room",
  )
  if (whiteBg.length > 0) return [...whiteBg, ...room, ...rest]
  if (room.length > 0) return [...room, ...rest]
  return images
}

function buildFinishes(value: unknown, _productionModel: StorefrontProductionModel) {
  const finishes = (Array.isArray(value) ? value : []).flatMap((item, index): StorefrontFinish[] => {
    if (!item || typeof item !== "object") return []
    const finish = item as Record<string, unknown>
    const priceDeltaCny = finiteNumber(finish.priceDeltaCny)
    if (priceDeltaCny === null || priceDeltaCny < 0) return []
    const label = cleanString(finish.label) || `Finish ${index + 1}`

    return [{
      id: cleanString(finish._key) || slugify(label),
      label,
      priceDeltaCny,
    }]
  })

  const defaults = [
    { id: "rolled", label: "Rolled Canvas", priceDeltaCny: 0 },
    { id: "frameless", label: "Frameless", priceDeltaCny: 0 },
    { id: "black-frame", label: "Stretch+Black Frame", priceDeltaCny: 0 },
    { id: "silver-frame", label: "Stretch+Silver Frame", priceDeltaCny: 0 },
    { id: "white-frame", label: "Stretch+White Frame", priceDeltaCny: 0 },
    { id: "wood-frame", label: "Stretch+Wood Frame", priceDeltaCny: 0 },
    { id: "gold-frame", label: "Stretch + Gold Frame", priceDeltaCny: 0 },
  ]

  if (finishes.length === 0) return defaults

  const seen = new Set(finishes.map((finish) => finish.id))
  return [
    ...finishes,
    ...defaults.filter((finish) => !seen.has(finish.id)),
  ]
}

function normalizeCollectionType(value?: string | null): StorefrontCollectionType {
  return value === "new_collection" ? "new_collection" : "artist_collection"
}

function normalizeProductionModel(value?: string | null): StorefrontProductionModel {
  return value === "hand_painted_to_order" ? "hand_painted_to_order" : "original"
}

function normalizeRightsStatus(value?: string | null): StorefrontRightsStatus {
  if (value === "approved" || value === "blocked") return value
  return "needs_review"
}

function normalizeMigrationStatus(value?: string | null): StorefrontMigrationStatus {
  if (
    value === "ready"
    || value === "needs_copy"
    || value === "needs_images"
    || value === "archive"
  ) return value
  return "needs_rights_review"
}

function normalizeOrientation(
  value: string | null | undefined,
  rawWidth: number | string | null | undefined,
  rawHeight: number | string | null | undefined,
  dimensions: string,
): StorefrontProduct["orientation"] {
  const normalized = cleanString(value).toLowerCase()
  if (normalized === "landscape" || normalized === "horizontal") return "landscape"
  if (normalized === "square") return "square"
  if (normalized === "portrait" || normalized === "vertical") return "portrait"

  const width = positiveNumber(rawWidth) || readDimension(dimensions, 0)
  const height = positiveNumber(rawHeight) || readDimension(dimensions, 1)
  if (!width || !height) return "portrait"
  if (Math.abs(width - height) <= Math.max(width, height) * 0.08) return "square"
  return width > height ? "landscape" : "portrait"
}

function normalizeImageKind(value: unknown, index: number): StorefrontImage["kind"] {
  if (
    value === "artwork"
    || value === "room"
    || value === "detail"
    || value === "edge"
    || value === "scale"
  ) {
    return value
  }
  return index === 0 ? "artwork" : "detail"
}

function readStringList(value: unknown) {
  return Array.isArray(value) ? value.map(cleanString).filter(Boolean) : []
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map(cleanString).filter(Boolean)))
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
}

function positiveNumber(value: unknown) {
  const number = finiteNumber(value)
  return number !== null && number > 0 ? number : null
}

function finiteNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

function readDimension(value: string, index: number) {
  const number = value.match(/\d+(?:\.\d+)?/g)?.map(Number)[index]
  return typeof number === "number" && Number.isFinite(number) && number > 0 ? number : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "artwork"
}
