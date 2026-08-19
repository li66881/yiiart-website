import { getApprovedProductMedia } from "../artwork-media"

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
    Number(artworkHasVideo(b)) - Number(artworkHasVideo(a))
    || Number(b.featured === true) - Number(a.featured === true)
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

function dateValue(value?: string | null) {
  return value ? new Date(value).getTime() || 0 : 0
}
