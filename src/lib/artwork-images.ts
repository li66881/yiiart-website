import { urlFor } from "@/lib/sanity"

export type CloudflareImage = {
  _type?: string
  _key?: string
  key?: string
  url?: string
  alt?: string
  contentType?: string
}

type ImageUrlOptions = {
  width?: number
  height?: number
}

export function getArtworkImageUrl(artwork: any, options: ImageUrlOptions = {}) {
  return getArtworkImageUrls(artwork, options)[0]
}

export function getArtworkImageUrls(artwork: any, options: ImageUrlOptions = {}) {
  const cloudflareImages = getCloudflareImages(artwork)

  if (cloudflareImages.length > 0) {
    return cloudflareImages.map((image) => image.url!).filter(Boolean)
  }

  return getSanityImageUrls(artwork?.images, options)
}

export function hasArtworkImage(artwork: any) {
  return Boolean(getArtworkImageUrl(artwork))
}

function getCloudflareImages(artwork: any): CloudflareImage[] {
  if (!Array.isArray(artwork?.cloudflareImages)) return []

  return artwork.cloudflareImages.filter((image: CloudflareImage) => Boolean(image?.url))
}

function getSanityImageUrls(images: unknown, options: ImageUrlOptions) {
  if (!Array.isArray(images)) return []

  return images
    .map((image) => {
      if (!image) return ""
      let builder = urlFor(image)
      if (options.width) builder = builder.width(options.width)
      if (options.height) builder = builder.height(options.height)
      return builder.url()
    })
    .filter(Boolean)
}
