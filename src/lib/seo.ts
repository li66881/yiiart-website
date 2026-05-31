import type { Metadata } from "next"

export const siteName = "YiiArt"

export const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")

export const defaultSeoDescription =
  "Discover original, hand-painted artworks by independent Chinese artists. One-of-a-kind oil, acrylic, and mixed-media paintings shipped worldwide with signed certificates."

export const defaultOgImage =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ||
  "/og-image"

type SeoMetadataInput = {
  title: string
  description?: string
  path: string
  image?: string
  imageAlt?: string
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
  robots,
}: SeoMetadataInput): Metadata {
  const url = absoluteUrl(path)

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [
        {
          url: image,
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
      images: [image],
    },
    robots,
  }
}
