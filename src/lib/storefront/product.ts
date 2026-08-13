import {
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "../artwork-display"
import {
  buildNormalizedFinishOptions,
  type NormalizedFinishOption,
} from "./finish-options"

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

export type StorefrontFinish = NormalizedFinishOption

export type StorefrontProduct = {
  id: string
  slug: string
  title: string
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

  return {
    id: cleanString(artwork._id) || cleanString(artwork.slug?.current) || slugify(title),
    slug: cleanString(artwork.slug?.current) || cleanString(artwork._id) || slugify(title),
    title,
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
    finishes: buildNormalizedFinishOptions(artwork.frameOptions, productionModel),
    creationWindow: pickEnglish(
      artwork.creationWindow,
      productionModel === "hand_painted_to_order"
        ? "Production timing is confirmed before checkout."
        : "Availability and dispatch timing are confirmed before checkout.",
    ),
    images: imageInputs
      .filter((image) => Boolean(cleanString(image.src)))
      .map((image, index) => ({
        src: cleanString(image.src),
        alt: cleanString(image.alt) || `${title}${index === 0 ? "" : ` view ${index + 1}`}`,
        width: positiveNumber(image.width) || 1400,
        height: positiveNumber(image.height) || 1750,
        kind: normalizeImageKind(image.kind, index),
      })),
  }
}

function buildSizes(
  artwork: StorefrontArtworkInput,
  productionModel: StorefrontProductionModel,
  dimensions: string,
) {
  if (productionModel === "hand_painted_to_order") {
    const sizes = Array.isArray(artwork.standardSizes) ? artwork.standardSizes : []
    return sizes.flatMap((value, index): StorefrontSize[] => {
      if (!value || typeof value !== "object") return []
      const size = value as Record<string, unknown>
      const priceCny = positiveNumber(size.priceCny)
      if (!priceCny) return []

      const widthCm = positiveNumber(size.widthCm)
      const heightCm = positiveNumber(size.heightCm)
      const label = cleanString(size.label)
        || (widthCm && heightCm ? `${widthCm} x ${heightCm} cm` : `Size ${index + 1}`)

      return [{
        id: cleanString(size._key) || slugify(label),
        label,
        widthCm: widthCm || undefined,
        heightCm: heightCm || undefined,
        priceCny,
      }]
    })
  }

  const priceCny = positiveNumber(artwork.price)
  if (!priceCny) return []

  return [{
    id: "original",
    label: cleanString(artwork.dimensions) || dimensions || "Original size",
    widthCm: positiveNumber(artwork.widthCm) || undefined,
    heightCm: positiveNumber(artwork.heightCm) || undefined,
    priceCny,
  }]
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
  if (value === "room" || value === "detail" || value === "edge" || value === "scale") return value
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
