import type { Metadata } from "next"

export const siteName = "YiiArt"

export const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")

export const defaultSeoDescription =
  "Discover hand-painted artworks by studio artists, with size, palette, production, and worldwide delivery guidance confirmed before ordering."

export const defaultOgImage =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ||
  "/og-image"

type SeoMetadataInput = {
  title: string
  description?: string
  path: string
  image?: string
  imageAlt?: string
  keywords?: string[]
  robots?: Metadata["robots"]
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function buildSeoMetadata({
  title,
  description = defaultSeoDescription,
  path,
  image = defaultOgImage,
  imageAlt = title,
  keywords,
  robots,
}: SeoMetadataInput): Metadata {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)
  const twitterSite = process.env.NEXT_PUBLIC_TWITTER_HANDLE

  return {
    title,
    description,
    keywords: keywords?.filter(Boolean),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      site: twitterSite || undefined,
    },
    robots,
  }
}

export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
