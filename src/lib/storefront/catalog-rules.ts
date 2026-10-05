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
  roomTypes?: string[] | null
}

export const ROOM_COLLECTION_MINIMUM_PRODUCTS = 4

export function matchesMarketingCollection(artwork: CollectionArtworkLike, collection: MarketingCollection) {
  if (collection.seriesSlug && artwork.seriesSlug !== collection.seriesSlug) return false
  if (collection.categories?.length && !collection.categories.includes(normalizeCategory(artwork.category))) return false
  if (collection.roomTypes?.length) {
    const roomTypes = (artwork.roomTypes ?? []).map((room) => room.trim().toLowerCase())
    if (!collection.roomTypes.some((room) => roomTypes.includes(room.trim().toLowerCase()))) return false
  }
  if (collection.slug === "large-canvas-art") {
    const dimensions = readPhysicalDimensions(artwork.widthCm, artwork.heightCm)
      || parsePhysicalDimensions(artwork.dimensions)
    if (!dimensions) return false

    const size = inferArtworkSize(`${dimensions.widthCm} x ${dimensions.heightCm} cm`)
    if (size !== "Large" && size !== "Oversized") return false
  }
  return Boolean(collection.seriesSlug || collection.categories?.length || collection.roomTypes?.length || collection.slug === "large-canvas-art")
}

export function visibleCollectionSlugs(counts: ReadonlyMap<string, number>, minimum: number) {
  return Array.from(counts, ([slug, count]) => ({ slug, count }))
    .filter(({ count }) => count >= minimum)
    .map(({ slug }) => slug)
}

export function shouldIndexMarketingCollection(collection: MarketingCollection, matchingPublicCount: number) {
  return collection.group !== "room" || matchingPublicCount >= ROOM_COLLECTION_MINIMUM_PRODUCTS
}
