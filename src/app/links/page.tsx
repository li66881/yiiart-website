import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import SocialLinks from "@/components/SocialLinks"
import { PriceText } from "@/components/PriceText"
import { client } from "@/lib/sanity"
import { formatArtworkDimensions, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import {
  FEATURED_SOCIAL_LINK_PICKS,
  featuredArtworkSlug,
  orderSocialLinkPicks,
  type FeaturedSocialArtwork,
} from "@/lib/social-links-picks"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { buildSeoMetadata } from "@/lib/seo"
import { campaignSearch } from "@/lib/social"

export const dynamic = "force-dynamic"

export const metadata = buildSeoMetadata({
  title: "YiiArt Social Links",
  description:
    "Find the artwork you saw, ask for size advice, or start a project enquiry. Hand-painted canvases from YiiArt.",
  path: "/links",
})

async function getFeaturedArtworks() {
  try {
    const slugs = FEATURED_SOCIAL_LINK_PICKS.map((pick) => pick.slug)
    const artworks = await client.fetch<FeaturedSocialArtwork[]>(
      `*[_type == "artwork" && slug.current in $slugs && ${PUBLIC_ARTWORK_GROQ_FILTER}]{
        _id,
        title,
        slug,
        price,
        dimensions,
        widthCm,
        heightCm,
        availability,
        allowCheckout,
        productionModel,
        reservedUntil,
        standardSizes,
        cloudflareImages,
        productMedia,
        images
      }`,
      { slugs },
    )
    return orderSocialLinkPicks(artworks).filter(({ artwork }) => artwork.availability !== "sold")
  } catch {
    return []
  }
}

export default async function LinksPage() {
  const featured = await getFeaturedArtworks()
  const bio = campaignSearch({ source: "link_in_bio", medium: "social", campaign: "bio" })
  const sizeAdviceHref = `/custom-painting?intent=size-advice${bio.replace("?", "&")}`
  const projectHref = `/custom-painting?intent=project${bio.replace("?", "&")}`

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">YiiArt</p>
            <h1 className="max-w-3xl text-4xl font-light leading-tight md:text-5xl">
              Hand-painted art for the room you live in.
            </h1>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <Link href={`#shop-the-art`} className="bg-black px-5 py-4 text-sm text-white">
                Shop the art you saw
              </Link>
              <Link href={sizeAdviceHref} className="border px-5 py-4 text-sm">
                Get size advice
              </Link>
              <Link href={projectHref} className="border px-5 py-4 text-sm">
                Project art enquiries
              </Link>
            </div>
            <Link href={`/trade${bio}`} className="mt-5 inline-flex text-sm underline underline-offset-4">
              See how YiiArt works with designers
            </Link>
            <p className="mt-6 max-w-2xl text-sm leading-6 text-stone-600">
              Need help choosing the right size? Send a room photo and your wall width for a size recommendation.
            </p>
          </div>
        </section>

        <section id="shop-the-art" className="py-14 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-light">Shop the art you saw</h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Recent pieces shared on Instagram, Pinterest, and YouTube, listed only while they remain available.
                </p>
              </div>
              <Link href={`/artworks${bio}`} className="text-sm underline underline-offset-4">
                Browse all artworks
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.length > 0 ? featured.map(({ pick, artwork }) => {
                const title = pickEnglish(artwork.title, "Hand-painted artwork")
                const image = getArtworkImageUrl(artwork, { width: 700 })
                const fromPrice = Array.isArray(artwork.standardSizes)
                  ? artwork.standardSizes
                    .map((size) => Number(size?.priceCny || size?.price))
                    .find((price) => price > 0)
                  : Number(artwork.price || 0)

                return (
                  <Link key={artwork._id} href={`/artwork/${featuredArtworkSlug(artwork)}${bio}`} className="group">
                    <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                      {image ? (
                        <Image
                          src={image}
                          alt={title}
                          fill
                          sizes="(min-width: 640px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          Artwork
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{pick.pairingNote}</p>
                    <p className="mt-1 text-sm text-gray-500">{formatArtworkDimensions(artwork)}</p>
                    <p className="mt-1 font-semibold">From <PriceText amountCny={fromPrice} /></p>
                  </Link>
                )
              }) : (
                <p className="text-gray-500">Featured artworks are being refreshed.</p>
              )}
            </div>
          </div>
        </section>

        <section className="border-t bg-gray-50 py-12">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
            <Link href="/shipping" className="text-sm underline underline-offset-4">
              Shipping and returns
            </Link>
            <Link href={sizeAdviceHref} className="text-sm underline underline-offset-4">
              Get size advice
            </Link>
            <div>
              <p className="mb-3 text-sm font-medium">Follow YiiArt</p>
              <SocialLinks />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
