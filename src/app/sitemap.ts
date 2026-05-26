import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yiiart.com'

const staticRoutes = [
  { path: '', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/artworks', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/artists', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/shipping', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/returns', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
  { path: '/artworks?category=Abstract', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/artworks?category=Landscape', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/artworks?category=Minimalist', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/artworks?category=Texture', priority: 0.7, changeFrequency: 'weekly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Fetch dynamic artwork routes
  let artworkEntries: MetadataRoute.Sitemap = []
  let artistEntries: MetadataRoute.Sitemap = []
  try {
    const artworks: { slug: { current: string } }[] = await client.fetch(
      `*[_type == "artwork"]{ "slug": slug }`
    )
    artworkEntries = artworks.map((artwork) => ({
      url: `${baseUrl}/artwork/${artwork.slug.current}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const artists: { slug: { current: string } }[] = await client.fetch(
      `*[_type == "artist"]{ "slug": slug }`
    )
    artistEntries = artists.map((artist) => ({
      url: `${baseUrl}/artist/${artist.slug.current}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // Ignore Sanity fetch errors at build time
  }

  return [...staticEntries, ...artworkEntries, ...artistEntries]
}
