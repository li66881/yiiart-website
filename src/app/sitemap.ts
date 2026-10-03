import type { MetadataRoute } from 'next'
import { marketingCollections } from '@/lib/collections'
import { client } from '@/lib/sanity'
import { PUBLIC_ARTWORK_GROQ_FILTER } from '@/lib/artwork-publication'
import { siteUrl } from '@/lib/seo'
import { filterSitemapArtists, mapArtistSitemapRoutes, mapArtworkSitemapRoutes, mapCategorySitemapRoutes } from '@/lib/sitemap'

const baseUrl = siteUrl

const routes = [
  { path: '', priority: 1 },
  { path: '/artworks', priority: 0.9 },
  { path: '/links', priority: 0.8 },
  { path: '/trade', priority: 0.8 },
  { path: '/reviews', priority: 0.8 },
  { path: '/art-in-real-homes', priority: 0.8 },
  { path: '/custom-painting', priority: 0.8 },
  { path: '/guides', priority: 0.7 },
  { path: '/guides/home-wall-art-pairing-guide', priority: 0.7 },
  { path: '/size-guide', priority: 0.7 },
  { path: '/artists', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
  { path: '/faq', priority: 0.5 },
  { path: '/shipping-returns', priority: 0.6 },
  { path: '/shipping', priority: 0.5 },
  { path: '/returns', priority: 0.5 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.path === '' ? ('weekly' as const) : ('monthly' as const),
    priority: route.priority,
  }))

  const categoryRoutes = mapCategorySitemapRoutes(baseUrl)

  const collectionRoutes = marketingCollections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  try {
    const [artworks, artists] = await Promise.all([
      client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}]{slug, _updatedAt, "artistRefId": artist._ref, "artist": artist->{name}}`),
      client.fetch(`*[_type == "artist" && defined(slug.current)]{_id, slug, _updatedAt, name}`),
    ])

    const artworkRoutes = mapArtworkSitemapRoutes(artworks, baseUrl)
    const eligibleArtists = filterSitemapArtists(artists, artworks)
    const artistRoutes = mapArtistSitemapRoutes(eligibleArtists, baseUrl)

    return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...artworkRoutes, ...artistRoutes]
  } catch {
    return [...staticRoutes, ...categoryRoutes, ...collectionRoutes]
  }
}
