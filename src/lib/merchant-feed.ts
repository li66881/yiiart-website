import { getArtworkImageUrl } from "@/lib/artwork-images"
import { pickEnglish } from "@/lib/artwork-display"
import { isArtworkCheckoutAvailable } from "@/lib/checkout-availability"
import { convertCnyToStoreAmount } from "@/lib/pricing"
import { siteUrl } from "@/lib/seo"

type FeedArtwork = {
  _id: string
  slug?: { current?: string }
  title?: { en?: string; zh?: string }
  shortDescription?: { en?: string; zh?: string }
  description?: { en?: string; zh?: string }
  price?: number
  productionModel?: string
  allowCheckout?: boolean
  availability?: string
  reservedUntil?: string
  images?: unknown[]
  cloudflareImages?: unknown[]
  productMedia?: unknown[]
}

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

export function buildMerchantFeed(artworks: FeedArtwork[]) {
  const items = artworks.flatMap((artwork) => {
    const slug = artwork.slug?.current
    const title = pickEnglish(artwork.title)
    const image = getArtworkImageUrl(artwork)
    const price = convertCnyToStoreAmount(Number(artwork.price), "USD")
    if (artwork.productionModel !== "original" || !slug || !title || !image || !Number.isFinite(price) || price <= 0) return []
    const description = pickEnglish(artwork.shortDescription || artwork.description, `${title}, original hand-painted artwork.`)
    const available = isArtworkCheckoutAvailable(artwork)
    return [`<item><g:id>${xml(artwork._id)}</g:id><title>${xml(title)}</title><description>${xml(description)}</description><link>${xml(`${siteUrl}/artwork/${slug}`)}</link><g:image_link>${xml(image)}</g:image_link><g:availability>${available ? "in_stock" : "out_of_stock"}</g:availability><g:price>${price.toFixed(2)} USD</g:price><g:condition>new</g:condition><g:identifier_exists>no</g:identifier_exists><g:shipping><g:country>US</g:country><g:price>0.00 USD</g:price></g:shipping></item>`]
  })
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>YiiArt Original Paintings</title><link>${xml(siteUrl)}</link><description>Original hand-painted artwork available from YiiArt.</description>${items.join("")}</channel></rss>`
}
