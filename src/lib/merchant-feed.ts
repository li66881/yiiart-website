import { createHash } from "node:crypto"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { pickEnglish } from "@/lib/artwork-display"
import { isArtworkCheckoutAvailable } from "@/lib/checkout-availability"
import { resolveCheckoutSelection, CheckoutValidationError } from "@/lib/checkout-selection"
import { convertCnyToStoreAmount } from "@/lib/pricing"
import { siteUrl } from "@/lib/seo"
import { buildStorefrontProduct } from "@/lib/storefront/product"
import { buildProductVariantUrl } from "@/lib/storefront/selection"

type FeedArtwork = {
  _id: string
  slug?: { current?: string }
  title?: { en?: string; zh?: string }
  shortDescription?: { en?: string; zh?: string }
  description?: { en?: string; zh?: string }
  price?: number
  dimensions?: string
  standardSizes?: Array<{ _key?: string; label?: string; priceCny?: number | null }>
  frameOptions?: Array<{ _key?: string; label?: string; priceDeltaCny?: number | null }>
  productionModel?: "original" | "hand_painted_to_order"
  allowCheckout?: boolean
  availability?: string
  reservedUntil?: string
  shippingProfile?: string
  images?: unknown[]
  cloudflareImages?: unknown[]
  productMedia?: unknown[]
}

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

function stableId(value: string) {
  return `yiiart-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`
}

export function buildMerchantFeed(artworks: FeedArtwork[]) {
  const items = artworks.flatMap((artwork) => {
    const slug = artwork.slug?.current
    const title = pickEnglish(artwork.title)
    const image = getArtworkImageUrl(artwork)
    if (!slug || !title || !image || !image.startsWith("https://")
      || !artwork.productionModel || !["original", "hand_painted_to_order"].includes(artwork.productionModel)) return []

    const description = pickEnglish(artwork.shortDescription || artwork.description, `${title}, hand-painted artwork.`)
    const available = isArtworkCheckoutAvailable(artwork)
    const baseUrl = `${siteUrl}/artwork/${encodeURIComponent(slug)}`
    const product = buildStorefrontProduct(artwork, [])
    const hasVariants = product.sizes.length * product.finishes.length > 1
    const groupId = stableId(artwork._id)

    return product.sizes.flatMap((size) => product.finishes.flatMap((finish) => {
      let priceCny: number
      try {
        priceCny = resolveCheckoutSelection(artwork, {
          id: artwork._id,
          quantity: 1,
          sizeId: size.id,
          finishId: finish.id,
        }).priceCny
      } catch (error) {
        if (error instanceof CheckoutValidationError) return []
        throw error
      }

      const price = convertCnyToStoreAmount(priceCny, "USD")
      if (!Number.isFinite(price) || price <= 0) return []
      const variantUrl = hasVariants ? buildProductVariantUrl(baseUrl, { sizeId: size.id, finishId: finish.id }) : baseUrl
      const variantId = hasVariants ? stableId(`${artwork._id}:${size.id}:${finish.id}`) : artwork._id
      const variantTitle = hasVariants ? `${title} - ${size.label} - ${finish.label}` : title
      const variantFields = hasVariants
        ? `<g:item_group_id>${xml(groupId)}</g:item_group_id><g:item_group_title>${xml(title)}</g:item_group_title><g:size>${xml(size.label)}</g:size><g:variant_option><g:name>Size</g:name><g:value>${xml(size.label)}</g:value></g:variant_option><g:variant_option><g:name>Presentation</g:name><g:value>${xml(finish.label)}</g:value></g:variant_option>`
        : ""

      return [`<item><g:id>${xml(variantId)}</g:id><title>${xml(variantTitle)}</title><description>${xml(description)}</description><link>${xml(variantUrl)}</link><g:image_link>${xml(image)}</g:image_link><g:availability>${available ? "in_stock" : "out_of_stock"}</g:availability><g:price>${price.toFixed(2)} USD</g:price><g:condition>new</g:condition><g:brand>YiiArt</g:brand><g:identifier_exists>no</g:identifier_exists><g:product_type>Home &amp; Garden &gt; Decor &gt; Artwork</g:product_type>${variantFields}<g:shipping><g:country>US</g:country><g:price>0.00 USD</g:price></g:shipping></item>`]
    }))
  })

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>YiiArt Hand-Painted Artworks</title><link>${xml(siteUrl)}</link><description>Hand-painted artworks available from YiiArt.</description>${items.join("")}</channel></rss>`
}
