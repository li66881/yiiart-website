import { matchesArtistIdentity } from "./artist-identity"
import { ARTWORK_CATEGORIES } from "./artwork-categories"

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

function parseLastModified(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function mapArtworkSitemapRoutes(artworks: SitemapArtworkRecord[], origin: string) {
  return artworks.flatMap((artwork) => {
    const slug = artwork.slug?.current?.trim()
    if (!slug) return []

    return [{
      url: `${origin}/artwork/${slug}`,
      lastModified: parseLastModified(artwork._updatedAt),
      changeFrequency: 'weekly' as const,
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
      lastModified: parseLastModified(artist._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }]
  })
}
