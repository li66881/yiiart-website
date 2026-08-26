import { getArtworkImageUrls } from "../artwork-images"
import {
  buildProductGalleryMedia,
  getApprovedProductMedia,
  getHeroSceneStill,
} from "../artwork-media"

export function resolveVisualImage(images: string[], fallback?: string) {
  return images.find((value) => value.trim().length > 0) || fallback || null
}

export function handPaintedDisclosure(productionModel: string) {
  if (productionModel !== "hand_painted_to_order") return null

  return "Listing images illustrate the intended composition, palette, and room scale. Each canvas is hand-painted to order, so brushwork and small details will naturally vary."
}

type EditorialArtwork = {
  collectionType?: string | null
  featured?: boolean | null
  _createdAt?: string | null
  productMedia?: unknown
}

export function artworkHasVideo(artwork: { productMedia?: unknown } | null | undefined) {
  return getApprovedProductMedia(artwork).some((item) => item.type === "video")
}

export function getArtworkVideo(artwork: { productMedia?: unknown } | null | undefined) {
  return getApprovedProductMedia(artwork).find((item) => item.type === "video") || null
}

export function buildEditorialHomeEdit<T extends EditorialArtwork>(artworks: T[]) {
  const byHomeRank = (a: T, b: T) => (
    Number(b.featured === true) - Number(a.featured === true)
    || dateValue(b._createdAt) - dateValue(a._createdAt)
  )
  const artistCollection = artworks
    .filter((artwork) => artwork.collectionType === "artist_collection")
    .slice()
    .sort(byHomeRank)
  const catalog = artworks
    .filter((artwork) => artwork.collectionType !== "artist_collection")
    .slice()
  const featured = catalog.sort(byHomeRank)
  const newArrivals = artworks
    .filter((artwork) => artwork.collectionType === "new_collection")
    .slice()
    .sort(byHomeRank)

  return {
    featured: featured.slice(0, 16),
    newArrivals: newArrivals.slice(0, 24),
    artistCollection: artistCollection.slice(0, 8),
  }
}

export function shouldAutoplayCarousel({
  slideCount,
  userPaused,
  hoverPaused,
  prefersReducedMotion,
}: {
  slideCount: number
  userPaused: boolean
  hoverPaused: boolean
  prefersReducedMotion: boolean
}) {
  return slideCount > 1 && !userPaused && !hoverPaused && !prefersReducedMotion
}

export function shouldPlayInlineVideo({
  isIntersecting,
  intersectionRatio,
  prefersReducedMotion,
}: {
  isIntersecting: boolean
  intersectionRatio: number
  prefersReducedMotion: boolean
}) {
  if (prefersReducedMotion) return false
  return isIntersecting && intersectionRatio >= 0.2
}

export function editorialHomeSequence() {
  return ["discover", "place", "process", "customize", "trust"] as const
}

export function pickHomepageHeroArtworks<T extends { _id?: string, productMedia?: unknown }>(artworks: T[], limit = 3) {
  const withScene = artworks.filter((artwork) => {
    const still = pickArtworkSceneStill(artwork)
    const firstImage = getArtworkImageUrls(artwork)[0]
    return Boolean(still?.url && still.url !== firstImage)
  })
  return uniqueArtworksById([...withScene, ...artworks]).slice(0, limit)
}

export function pickArtworkSceneStill(artwork: { productMedia?: unknown } | null | undefined) {
  const fallbackImages = getArtworkImageUrls(artwork)
  return getHeroSceneStill(buildProductGalleryMedia(artwork, fallbackImages, ""))
}

export function pickHomepageStudioVideo<T extends { productMedia?: unknown }>(artworks: T[]) {
  return artworks.find((artwork) => artworkHasVideo(artwork)) || null
}

function uniqueArtworksById<T extends { _id?: string }>(artworks: T[]) {
  return Array.from(new Map(artworks.filter(Boolean).map((artwork, index) => [artwork._id || String(index), artwork])).values())
}

function dateValue(value?: string | null) {
  return value ? new Date(value).getTime() || 0 : 0
}
