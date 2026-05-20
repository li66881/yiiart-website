import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yiiart.com'

const routes = [
  { path: '', priority: 1 },
  { path: '/artworks', priority: 0.9 },
  { path: '/artists', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
  { path: '/faq', priority: 0.5 },
  { path: '/shipping', priority: 0.5 },
  { path: '/returns', priority: 0.5 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.path === '' ? 'weekly' : 'monthly',
    priority: route.priority,
  }))
}
