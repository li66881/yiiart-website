import type { ProductMediaItem } from "@/lib/artwork-media"

export type GalleryViewMode = "photo" | "white_bg" | "room" | "detail"

export type GallerySlide = ProductMediaItem & {
  viewMode: GalleryViewMode
  scene?: "living" | "bedroom"
  sourceUrl?: string
}

const ROOM_ROLES = new Set(["living_room", "bedroom"])
const WHITE_ROLES = new Set(["front", "original"])

/**
 * Ensure every PDP has a MesonArt-like multi-image rail:
 * white-bg presentation, room scene, and detail crop.
 * Uses real CMS images when present; synthesizes the rest from the best artwork photo.
 */
export function buildGallerySlides(media: ProductMediaItem[], fallbackAlt: string): GallerySlide[] {
  const images = media.filter((item) => item.type === "image")
  const videos = media.filter((item) => item.type === "video")
  const primary =
    images.find((item) => WHITE_ROLES.has(item.role))
    || images[0]

  if (!primary) {
    return media.map((item) => ({ ...item, viewMode: "photo" as const }))
  }

  const slides: GallerySlide[] = []
  const usedUrls = new Set<string>()

  const pushPhoto = (item: ProductMediaItem, viewMode: GalleryViewMode = "photo") => {
    if (usedUrls.has(item.url) && viewMode === "photo") return
    if (viewMode === "photo") usedUrls.add(item.url)
    slides.push({ ...item, viewMode })
  }

  // 1) White-bg product presentation (always first when we can derive it)
  const whitePhoto = images.find((item) => WHITE_ROLES.has(item.role))
  if (whitePhoto) {
    pushPhoto({
      ...whitePhoto,
      id: `${whitePhoto.id}-white`,
      role: "front",
      alt: whitePhoto.alt || `${fallbackAlt} on white`,
    }, "white_bg")
  } else {
    slides.push({
      ...primary,
      id: `${primary.id}-white`,
      role: "front",
      alt: `${fallbackAlt} on white`,
      viewMode: "white_bg",
      sourceUrl: primary.url,
    })
  }

  // 2) Existing room photos (real CMS)
  for (const item of images.filter((entry) => ROOM_ROLES.has(entry.role))) {
    pushPhoto(item, "photo")
  }

  // 3) Synthetic living-room scene if no room photo
  if (!images.some((item) => ROOM_ROLES.has(item.role))) {
    slides.push({
      ...primary,
      id: `${primary.id}-room-living`,
      role: "living_room",
      alt: `${fallbackAlt} in a living room`,
      viewMode: "room",
      scene: "living",
      sourceUrl: primary.url,
    })
  }

  // 4) Detail close-up
  const detailPhoto = images.find((item) => item.role === "detail" || item.role === "angle")
  if (detailPhoto && detailPhoto.url !== primary.url) {
    pushPhoto(detailPhoto, "photo")
  } else {
    slides.push({
      ...primary,
      id: `${primary.id}-detail`,
      role: "detail",
      alt: `${fallbackAlt} texture detail`,
      viewMode: "detail",
      sourceUrl: primary.url,
    })
  }

  // 5) Bedroom alternate scene when we only have one real room (or none)
  if (!images.some((item) => item.role === "bedroom")) {
    slides.push({
      ...primary,
      id: `${primary.id}-room-bedroom`,
      role: "bedroom",
      alt: `${fallbackAlt} in a bedroom`,
      viewMode: "room",
      scene: "bedroom",
      sourceUrl: primary.url,
    })
  }

  // 6) Remaining unique photos
  for (const item of images) {
    if (WHITE_ROLES.has(item.role) || ROOM_ROLES.has(item.role)) continue
    if (item.role === "detail" || item.role === "angle") continue
    pushPhoto(item, "photo")
  }

  for (const video of videos) {
    slides.push({ ...video, viewMode: "photo" })
  }

  return slides.slice(0, 10)
}
