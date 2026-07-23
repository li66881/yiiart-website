export function resolveVisualImage(images: string[], fallback?: string) {
  return images.find((value) => value.trim().length > 0) || fallback || null
}

export function handPaintedDisclosure(productionModel: string) {
  if (productionModel !== "hand_painted_to_order") return null

  return "Listing images illustrate the intended composition, palette, and room scale. Each canvas is hand-painted to order, so brushwork and small details will naturally vary."
}

type EditorialArtwork = { collectionType?: string | null }

export function buildEditorialHomeEdit<T extends EditorialArtwork>(artworks: T[]) {
  const artistCollection = artworks.filter((artwork) => artwork.collectionType === "artist_collection")
  const featured = artworks.filter((artwork) => artwork.collectionType !== "artist_collection")

  return {
    featured: featured.slice(0, 6),
    artistCollection: artistCollection.slice(0, 3),
  }
}
