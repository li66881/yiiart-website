export type SitemapSlugRecord = { slug?: { current?: string } | null; _updatedAt?: string | null }
export type SitemapArtistRecord = { slug?: { current?: string } | null; _updatedAt?: string | null }

function parseLastModified(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function mapArtworkSitemapRoutes(artworks: SitemapSlugRecord[], origin: string) {
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

export function filterSitemapArtists(artists: SitemapArtistRecord[], publicArtistSlugs: string[]) {
  const publicSlugs = new Set(publicArtistSlugs)
  return artists.filter((artist) => {
    const slug = artist.slug?.current?.trim()
    return Boolean(slug && publicSlugs.has(slug))
  })
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
