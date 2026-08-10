import type { MarketingCollection } from "@/lib/collections"
import { normalizeCategory } from "@/lib/artwork-display"
import { inferArtworkSize } from "@/lib/artwork-discovery"
import { parsePhysicalDimensions, readPhysicalDimensions } from "@/lib/physical-dimensions"

type CollectionArtworkLike = {
  category?: string | null
  dimensions?: string | null
  widthCm?: number | string | null
  heightCm?: number | string | null
  seriesSlug?: string | null
}

export function matchesMarketingCollection(artwork: CollectionArtworkLike, collection: MarketingCollection) {
  if (collection.seriesSlug) return artwork.seriesSlug === collection.seriesSlug
  if (collection.categories?.length) return collection.categories.includes(normalizeCategory(artwork.category))
  if (collection.slug === "large-canvas-art") {
    const dimensions = readPhysicalDimensions(artwork.widthCm, artwork.heightCm)
      || parsePhysicalDimensions(artwork.dimensions)
    if (!dimensions) return false

    const size = inferArtworkSize(`${dimensions.widthCm} x ${dimensions.heightCm} cm`)
    return size === "Large" || size === "Oversized"
  }
  return false
}

export function visibleCollectionSlugs(counts: ReadonlyMap<string, number>, minimum: number) {
  return Array.from(counts, ([slug, count]) => ({ slug, count }))
    .filter(({ count }) => count >= minimum)
    .map(({ slug }) => slug)
}
