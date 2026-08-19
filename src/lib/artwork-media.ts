export type ProductMediaType = "image" | "video"

export type ProductMediaRole =
  | "front"
  | "original"
  | "detail"
  | "living_room"
  | "angle"
  | "bedroom"
  | "dining_room"
  | "process"
  | "scale"
  | "other"

export type ProductMediaItem = {
  id: string
  type: ProductMediaType
  role: ProductMediaRole
  url: string
  posterUrl?: string
  alt: string
  width?: number
  height?: number
}

type ProductMediaInput = {
  _key?: string
  mediaType?: string
  role?: string
  url?: string
  posterUrl?: string
  alt?: string
  width?: number | string | null
  height?: number | string | null
  sortOrder?: number | string | null
  contentType?: string
  approvedForStorefront?: boolean
}

const roleOrder: Record<ProductMediaRole, number> = {
  front: 10,
  original: 20,
  detail: 30,
  process: 40,
  living_room: 50,
  angle: 60,
  bedroom: 70,
  dining_room: 75,
  scale: 80,
  other: 90,
}

export const productMediaRoleLabels: Record<ProductMediaRole, string> = {
  front: "Front view",
  original: "Original artwork photo",
  detail: "Texture detail",
  living_room: "Living room view",
  angle: "Angle view",
  bedroom: "Bedroom view",
  dining_room: "Dining room view",
  process: "Studio video",
  scale: "Scale reference",
  other: "Additional view",
}

export function getApprovedProductMedia(artwork: { productMedia?: unknown } | null | undefined) {
  const inputs = Array.isArray(artwork?.productMedia) ? artwork.productMedia : []

  return inputs
    .flatMap((value, index): Array<ProductMediaItem & { sortOrder: number }> => {
      if (!value || typeof value !== "object") return []
      const media = value as ProductMediaInput
      if (media.approvedForStorefront !== true) return []

      const url = cleanMediaUrl(media.url)
      if (!url) return []

      const type = normalizeMediaType(media.mediaType, media.contentType)
      const role = normalizeMediaRole(media.role, type)
      const explicitOrder = positiveNumber(media.sortOrder)

      return [{
        id: cleanString(media._key) || `${role}-${index + 1}`,
        type,
        role,
        url,
        posterUrl: cleanMediaUrl(media.posterUrl) || undefined,
        alt: cleanString(media.alt) || productMediaRoleLabels[role],
        width: positiveNumber(media.width) || undefined,
        height: positiveNumber(media.height) || undefined,
        sortOrder: explicitOrder || roleOrder[role] + index / 100,
      }]
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...media }) => media)
}

export function buildProductGalleryMedia(
  artwork: { productMedia?: unknown } | null | undefined,
  fallbackImages: string[],
  fallbackAlt: string,
) {
  const structuredMedia = getApprovedProductMedia(artwork)
  const legacyImages = fallbackImages.slice(0, 10).map((url, index): ProductMediaItem => ({
    id: `legacy-image-${index + 1}`,
    type: "image",
    role: index === 0 ? "front" : index === 1 ? "original" : "detail",
    url,
    alt: index === 0 ? fallbackAlt : `${fallbackAlt}, view ${index + 1}`,
  }))

  if (structuredMedia.length === 0) return legacyImages

  const hasStructuredImage = structuredMedia.some((item) => item.type === "image")
  if (hasStructuredImage) return structuredMedia.slice(0, 10)

  const videos = structuredMedia.filter((item) => item.type === "video")
  if (legacyImages.length === 0) return videos.slice(0, 10)

  return [legacyImages[0], ...videos, ...legacyImages.slice(1)].slice(0, 10)
}

export function getApprovedProductImageUrls(artwork: { productMedia?: unknown } | null | undefined) {
  return getApprovedProductMedia(artwork)
    .filter((media) => media.type === "image")
    .map((media) => media.url)
}

function normalizeMediaType(value?: string, contentType?: string): ProductMediaType {
  return value === "video" || String(contentType || "").toLowerCase().startsWith("video/")
    ? "video"
    : "image"
}

function normalizeMediaRole(value: unknown, type: ProductMediaType): ProductMediaRole {
  if (typeof value === "string" && value in roleOrder) return value as ProductMediaRole
  return type === "video" ? "process" : "other"
}

function cleanMediaUrl(value: unknown) {
  const url = cleanString(value)
  return url.startsWith("https://") || url.startsWith("/") ? url : ""
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function positiveNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}
