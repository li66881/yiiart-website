import { urlFor } from "@/lib/sanity"
import { buildGalleryItems, type GalleryRole } from "@/features/artwork-detail/model"

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
  const sanityImageUrls = getSanityImageUrls(artwork?.images, options)

  if ((options.width || options.height) && sanityImageUrls.length > 0) {
    return sanityImageUrls
  }

  const cloudflareImages = getCloudflareImages(artwork)

  if (cloudflareImages.length > 0) {
    return cloudflareImages.map((image) => image.url!).filter(Boolean)
  }

  return sanityImageUrls
}

export function hasArtworkImage(artwork: any) {
  return Boolean(getArtworkImageUrl(artwork))
}

export function getArtworkGalleryItems(
  artwork: any,
  options: ImageUrlOptions = {},
  title = "Artwork",
) {
  const explicit = Array.isArray(artwork?.galleryAssets)
    ? artwork.galleryAssets.map((asset: any) => ({
        url: resolveGalleryAssetUrl(asset, options),
        role: asset?.role as GalleryRole | undefined,
        alt: asset?.alt,
      }))
    : []

  return buildGalleryItems({
    title,
    explicit,
    fallbackUrls: getArtworkImageUrls(artwork, options),
  })
}

function resolveGalleryAssetUrl(asset: any, options: ImageUrlOptions) {
  if (typeof asset?.url === "string" && asset.url.trim()) return asset.url.trim()
  if (!asset?.image) return ""
  let builder = urlFor(asset.image)
  if (options.width) builder = builder.width(options.width)
  if (options.height) builder = builder.height(options.height)
  return builder.url()
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
