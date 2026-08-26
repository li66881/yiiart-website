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

export const roomSceneRoles = new Set<ProductMediaRole>([
  "living_room",
  "bedroom",
  "dining_room",
  "scale",
])

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
        width: positiveNumber(media.width) || dimensionsFromUrl(url)?.width,
        height: positiveNumber(media.height) || dimensionsFromUrl(url)?.height,
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
    width: dimensionsFromUrl(url)?.width,
    height: dimensionsFromUrl(url)?.height,
  }))

  if (structuredMedia.length === 0) return orderProductGalleryMedia(legacyImages)

  const knownUrls = new Set(structuredMedia.map((item) => mediaUrlKey(item.url)))
  const extraLegacy = legacyImages.filter((item) => !knownUrls.has(mediaUrlKey(item.url)))
  return orderProductGalleryMedia([...structuredMedia, ...extraLegacy]).slice(0, 10)
}

export function getApprovedProductImageUrls(artwork: { productMedia?: unknown } | null | undefined) {
  return orderProductGalleryMedia(getApprovedProductMedia(artwork))
    .filter((media) => media.type === "image")
    .map((media) => media.url)
}

export function isRoomSceneMedia(item: ProductMediaItem) {
  if (item.type !== "image") return false
  if (roomSceneRoles.has(item.role)) return true
  return looksLikeSceneCopy(`${item.url} ${item.alt}`)
}

export function getHeroSceneStill(media: ProductMediaItem[]) {
  const images = media.filter((item) => item.type === "image")
  return images.find((item) => isRoomSceneMedia(item))
    || images.find((item) => item.role !== "front" && inferAspect(item) === "landscape")
    || images[1]
    || images[0]
    || null
}

export function orderProductGalleryMedia(items: ProductMediaItem[]) {
  const images = items.filter((item) => item.type === "image")
  const videos = items.filter((item) => item.type === "video")
  if (images.length === 0) return videos.slice(0, 10)

  const lead = images.find((item) => item.role === "front") || images[0]
  const remaining = images.filter((item) => mediaUrlKey(item.url) !== mediaUrlKey(lead.url))
  const namedScenes = remaining.filter((item) => isRoomSceneMedia(item))
  const namedSceneUrls = new Set(namedScenes.map((item) => mediaUrlKey(item.url)))
  const landscapeScenes = remaining
    .filter((item) => !namedSceneUrls.has(mediaUrlKey(item.url)) && inferAspect(item) === "landscape")
    .slice()
    .reverse()
  const landscapeUrls = new Set(landscapeScenes.map((item) => mediaUrlKey(item.url)))
  const otherImages = remaining.filter((item) => {
    const key = mediaUrlKey(item.url)
    return !namedSceneUrls.has(key) && !landscapeUrls.has(key)
  })
  const scenes = [...namedScenes, ...landscapeScenes]
  const usedUrls = new Set([mediaUrlKey(lead.url), ...scenes.map((item) => mediaUrlKey(item.url))])

  const posterScenes: ProductMediaItem[] = []
  for (const video of videos) {
    if (scenes.length + posterScenes.length >= 2) break
    if (scenes.length > 0) break
    const posterUrl = video.posterUrl
    if (!posterUrl || usedUrls.has(mediaUrlKey(posterUrl))) continue
    const poster: ProductMediaItem = {
      id: `${video.id}-poster`,
      type: "image",
      role: "living_room",
      url: posterUrl,
      alt: video.alt || "Room view",
      width: dimensionsFromUrl(posterUrl)?.width,
      height: dimensionsFromUrl(posterUrl)?.height,
    }
    if (inferAspect(poster) === "portrait" && scenes.length > 0) continue
    posterScenes.push(poster)
    usedUrls.add(mediaUrlKey(posterUrl))
  }

  return uniqueMedia([lead, ...scenes, ...posterScenes, ...otherImages, ...videos]).slice(0, 10)
}

function uniqueMedia(items: ProductMediaItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.type}:${mediaUrlKey(item.url)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mediaUrlKey(url: string) {
  return url.split("?")[0]
}

function looksLikeSceneCopy(value: string) {
  return /room|scene|hang|interior|living|bedroom|dining|lifestyle|on-the-wall|wall-mock/i.test(value)
}

function inferAspect(item: Pick<ProductMediaItem, "url" | "width" | "height">) {
  const width = item.width || dimensionsFromUrl(item.url)?.width || 0
  const height = item.height || dimensionsFromUrl(item.url)?.height || 0
  if (!width || !height) return "unknown"
  if (width / height >= 1.12) return "landscape"
  if (height / width >= 1.12) return "portrait"
  return "square"
}

function dimensionsFromUrl(url: string) {
  const match = url.match(/-(\d+)x(\d+)(?:\.\w+)?(?:\?|$)/)
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!width || !height) return null
  return { width, height }
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
