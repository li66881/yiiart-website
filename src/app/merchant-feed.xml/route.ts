import { client } from "@/lib/sanity"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { buildMerchantFeed } from "@/lib/merchant-feed"

export const revalidate = 600

export async function GET() {
  try {
    const artworks = await client.fetch(`*[_type == "artwork" && defined(slug.current) && ${PUBLIC_ARTWORK_GROQ_FILTER}]{_id, slug, title, shortDescription, description, price, productionModel, allowCheckout, availability, reservedUntil, images, cloudflareImages, productMedia}`)
    return new Response(buildMerchantFeed(artworks), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=600" } })
  } catch (error) {
    console.error("Merchant feed error:", error)
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
