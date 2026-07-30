export type ProductMediaType = "image" | "video"

export type ProductMediaRole =
  | "front"
  | "original"
  | "detail"
  | "living_room"
  | "angle"
  | "bedroom"
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
  detail: 40,
  process: 50,
  living_room: 60,
  angle: 70,
  bedroom: 80,
  scale: 90,
  other: 100,
}

const WHITE_BG_ROLES: ProductMediaRole[] = ["front", "original"]
const ROOM_ROLES: ProductMediaRole[] = ["living_room", "bedroom"]

export const productMediaRoleLabels: Record<ProductMediaRole, string> = {
  front: "Front view",
  original: "Original artwork photo",
  detail: "Texture detail",
  living_room: "Living room view",
  angle: "Angle view",
  bedroom: "Bedroom view",
  process: "Studio video",
  scale: "Scale reference",
  other: "Additional view",
}

export function getApprovedProductMedia(artwork: { productMedia?: unknown } | null | undefined) {
  const inputs = Array.isArray(artwork?.productMedia) ? artwork.productMedia : []

  const media = inputs
    .flatMap((value, index): Array<ProductMediaItem & { sortOrder: number }> => {
      if (!value || typeof value !== "object") return []
      const item = value as ProductMediaInput
      if (item.approvedForStorefront !== true) return []

      const url = cleanMediaUrl(item.url)
      if (!url) return []

      const type = normalizeMediaType(item.mediaType, item.contentType)
      const role = normalizeMediaRole(item.role, type)
      const explicitOrder = positiveNumber(item.sortOrder)

      return [{
        id: cleanString(item._key) || `${role}-${index + 1}`,
        type,
        role,
        url,
        posterUrl: cleanMediaUrl(item.posterUrl) || undefined,
        alt: cleanString(item.alt) || productMediaRoleLabels[role],
        width: positiveNumber(item.width) || undefined,
        height: positiveNumber(item.height) || undefined,
        sortOrder: explicitOrder || roleOrder[role] + index / 100,
      }]
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...item }) => item)

  return preferWhiteBackgroundThenRoom(media)
}

export function buildProductGalleryMedia(
  artwork: { productMedia?: unknown } | null | undefined,
  fallbackImages: string[],
  fallbackAlt: string,
) {
  const structuredMedia = getApprovedProductMedia(artwork)
  if (structuredMedia.length > 0) return structuredMedia.slice(0, 10)

  return preferWhiteBackgroundThenRoom(
    fallbackImages.slice(0, 10).map((url, index): ProductMediaItem => ({
      id: `legacy-image-${index + 1}`,
      type: "image",
      // Legacy: first image treated as white-bg front; later images stay detail unless only one exists.
      role: index === 0 ? "front" : "detail",
      url,
      alt: index === 0 ? fallbackAlt : `${fallbackAlt}, view ${index + 1}`,
    })),
  )
}

export function getApprovedProductImageUrls(artwork: { productMedia?: unknown } | null | undefined) {
  return getApprovedProductMedia(artwork)
    .filter((media) => media.type === "image")
    .map((media) => media.url)
}

/** White-bg (front/original) first; if none, room/scene first. */
export function preferWhiteBackgroundThenRoom(media: ProductMediaItem[]) {
  if (media.length < 2) return media

  const whiteBg = media.filter((item) => item.type === "image" && WHITE_BG_ROLES.includes(item.role))
  const room = media.filter((item) => item.type === "image" && ROOM_ROLES.includes(item.role))
  const rest = media.filter(
    (item) =>
      !(item.type === "image" && WHITE_BG_ROLES.includes(item.role))
      && !(item.type === "image" && ROOM_ROLES.includes(item.role)),
  )

  if (whiteBg.length > 0) return [...whiteBg, ...room, ...rest]
  if (room.length > 0) return [...room, ...rest]
  return media
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
