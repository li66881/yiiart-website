import type { MetadataRoute } from 'next'
import { marketingCollections } from '@/lib/collections'
import { client } from '@/lib/sanity'
import { PUBLIC_ARTWORK_GROQ_FILTER } from '@/lib/artwork-publication'
import { siteUrl } from '@/lib/seo'
import { filterSitemapArtists, mapArtistSitemapRoutes, mapArtworkSitemapRoutes, mapCategorySitemapRoutes, mapCollectionSitemapRoutes, type SitemapCollectionArtwork } from '@/lib/sitemap'
import { getApprovedReviews, getRealHomeReviews } from '@/lib/reviews'
import { filterReviewSitemapRoutes } from '@/lib/real-homes-seo'

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
  const [publicReviews, galleryReviews] = await Promise.all([
    getApprovedReviews({ limit: 1 }).catch(() => []),
    getRealHomeReviews().catch(() => []),
  ])
  const staticRoutes = filterReviewSitemapRoutes(routes, publicReviews.length, galleryReviews.length)
    .map((route) => ({
      url: `${baseUrl}${route.path}`,
      changeFrequency: route.path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: route.priority,
    }))

  const categoryRoutes = mapCategorySitemapRoutes(baseUrl)

  const nonRoomCollectionRoutes = mapCollectionSitemapRoutes(
    marketingCollections.filter((collection) => collection.group !== 'room'),
    null,
    baseUrl,
  )

  try {
    const [artworks, artists, collectionInventory] = await Promise.all([
      client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}]{slug, "artistRefId": artist._ref, "artist": artist->{name}}`),
      client.fetch(`*[_type == "artist" && defined(slug.current)]{_id, slug, name}`),
      client.fetch<SitemapCollectionArtwork[]>(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}]{category, roomTypes, dimensions, widthCm, heightCm, seriesSlug}`).catch(() => null),
    ])

    const artworkRoutes = mapArtworkSitemapRoutes(artworks, baseUrl)
    const eligibleArtists = filterSitemapArtists(artists, artworks)
    const artistRoutes = mapArtistSitemapRoutes(eligibleArtists, baseUrl)
    const collectionRoutes = mapCollectionSitemapRoutes(marketingCollections, collectionInventory, baseUrl)

    return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...artworkRoutes, ...artistRoutes]
  } catch {
    return [...staticRoutes, ...categoryRoutes, ...nonRoomCollectionRoutes]
  }
}
