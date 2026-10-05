import { matchesArtistIdentity } from "./artist-identity"
import { ARTWORK_CATEGORIES } from "./artwork-categories"
import type { MarketingCollection } from "./collections"
import { matchesMarketingCollection, shouldIndexMarketingCollection } from "./storefront/catalog-rules"

export type SitemapSlugRecord = { slug?: { current?: string } | null; _updatedAt?: string | null }
export type SitemapArtistRecord = {
  _id: string
  slug?: { current?: string } | null
  _updatedAt?: string | null
  name?: { en?: string | null; zh?: string | null } | null
}
export type SitemapArtworkRecord = SitemapSlugRecord & {
  artistRefId?: string | null
  artist?: { name?: { en?: string | null; zh?: string | null } | null } | null
}
export type SitemapCollectionArtwork = {
  category?: string | null
  roomTypes?: string[] | null
  dimensions?: string | null
  widthCm?: number | string | null
  heightCm?: number | string | null
  seriesSlug?: string | null
}

export function mapCollectionSitemapRoutes(
  collections: MarketingCollection[],
  inventory: SitemapCollectionArtwork[] | null,
  origin: string,
) {
  return collections.flatMap((collection) => {
    if (collection.group === "room") {
      if (!inventory) return []
      const count = inventory.filter((artwork) => matchesMarketingCollection(artwork, collection)).length
      if (!shouldIndexMarketingCollection(collection, count)) return []
    }
    return [{
      url: `${origin}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }]
  })
}

export function mapArtworkSitemapRoutes(artworks: SitemapArtworkRecord[], origin: string) {
  return artworks.flatMap((artwork) => {
    const slug = artwork.slug?.current?.trim()
    if (!slug) return []

    return [{
      url: `${origin}/artwork/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }]
  })
}

export function filterSitemapArtists(artists: SitemapArtistRecord[], artworks: SitemapArtworkRecord[]) {
  return artists.filter((artist) => {
    const slug = artist.slug?.current?.trim()
    return Boolean(slug && artworks.some((artwork) => matchesArtistIdentity(
      { id: artist._id, name: artist.name },
      { id: artwork.artistRefId, name: artwork.artist?.name },
    )))
  })
}

export function mapCategorySitemapRoutes(origin: string) {
  return ARTWORK_CATEGORIES.map((category) => ({
    url: `${origin}/artworks?category=${encodeURIComponent(category)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))
}

export function mapArtistSitemapRoutes(artists: SitemapArtistRecord[], origin: string) {
  return artists.flatMap((artist) => {
    const slug = artist.slug?.current?.trim()
    if (!slug) return []

    return [{
      url: `${origin}/artist/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }]
  })
}
