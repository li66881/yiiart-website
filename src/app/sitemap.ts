import type { MetadataRoute } from 'next'
import { marketingCollections } from '@/lib/collections'
import { client } from '@/lib/sanity'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yiiart.com').replace(/\/$/, '')

const routes = [
  { path: '', priority: 1 },
  { path: '/artworks', priority: 0.9 },
  { path: '/links', priority: 0.8 },
  { path: '/reviews', priority: 0.8 },
  { path: '/art-in-real-homes', priority: 0.8 },
  { path: '/custom-painting', priority: 0.8 },
  { path: '/size-guide', priority: 0.7 },
  { path: '/artists', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
  { path: '/faq', priority: 0.5 },
  { path: '/shipping', priority: 0.5 },
  { path: '/returns', priority: 0.5 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
]

const categories = ['Abstract', 'Landscape', 'Portrait', 'Texture', 'Wabi-sabi', 'Minimalist']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.path === '' ? ('weekly' as const) : ('monthly' as const),
    priority: route.priority,
  }))

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/artworks?category=${encodeURIComponent(category)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const collectionRoutes = marketingCollections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  try {
    const [artworks, artists] = await Promise.all([
      client.fetch(`*[_type == "artwork" && defined(slug.current)]{slug}`),
      client.fetch(`*[_type == "artist" && defined(slug.current)]{slug}`),
    ])

    const artworkRoutes = artworks.map((artwork: any) => ({
      url: `${baseUrl}/artwork/${artwork.slug.current}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const artistRoutes = artists.map((artist: any) => ({
      url: `${baseUrl}/artist/${artist.slug.current}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...artworkRoutes, ...artistRoutes]
  } catch {
    return [...staticRoutes, ...categoryRoutes, ...collectionRoutes]
  }
}
