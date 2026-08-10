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
}

export function buildEditorialHomeEdit<T extends EditorialArtwork>(artworks: T[]) {
  const byNewest = (a: T, b: T) => dateValue(b._createdAt) - dateValue(a._createdAt)
  const artistCollection = artworks
    .filter((artwork) => artwork.collectionType === "artist_collection")
    .slice()
    .sort(byNewest)
  const catalog = artworks
    .filter((artwork) => artwork.collectionType !== "artist_collection")
    .slice()
  const featured = catalog.sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || byNewest(a, b))
  const newArrivals = artworks
    .filter((artwork) => artwork.collectionType === "new_collection")
    .slice()
    .sort(byNewest)

  return {
    featured: featured.slice(0, 6),
    newArrivals: newArrivals.slice(0, 8),
    artistCollection: artistCollection.slice(0, 3),
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

export function editorialHomeSequence() {
  return ["discover", "place", "process", "customize", "trust"] as const
}

function dateValue(value?: string | null) {
  return value ? new Date(value).getTime() || 0 : 0
}
