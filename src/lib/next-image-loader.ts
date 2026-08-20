type ImageLoaderParams = {
  src: string
  width: number
  quality?: number
}

/**
 * Serve storefront images from Sanity CDN / origin URLs instead of Vercel
 * `/_next/image`. Chrome requests that endpoint with Accept: image/avif,webp
 * and Vercel currently returns 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
 * for those optimized variants (thumbnails at w=128 fail in the browser).
 */
export function buildImageLoaderUrl({ src, width, quality }: ImageLoaderParams) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    return src
  }

  if (src.includes("cdn.sanity.io")) {
    try {
      const url = new URL(src)
      url.searchParams.set("auto", "format")
      url.searchParams.set("fit", "max")
      url.searchParams.set("w", String(width))
      url.searchParams.set("q", String(quality ?? 75))
      return url.toString()
    } catch {
      return src
    }
  }

  return src
}

export default function nextImageLoader(params: ImageLoaderParams) {
  return buildImageLoaderUrl(params)
}
