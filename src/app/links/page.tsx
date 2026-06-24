import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import SocialLinks from "@/components/SocialLinks"
import { PriceText } from "@/components/PriceText"
import { client } from "@/lib/sanity"
import { formatArtworkDimensions, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildSeoMetadata({
  title: "YiiArt Social Links",
  description:
    "Quick links to original hand-painted artworks, collector collections, shipping details, and YiiArt contact information.",
  path: "/links",
})

async function getShareableArtworks() {
  try {
    return await client.fetch(`*[_type == "artwork"] | order(featured desc, _createdAt desc)[0...6]{
      _id,
      title,
      slug,
      price,
      dimensions,
      widthCm,
      heightCm,
      cloudflareImages,
      images
    }`)
  } catch {
    return []
  }
}

export default async function LinksPage() {
  const artworks = await getShareableArtworks()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">YiiArt</p>
            <h1 className="max-w-3xl text-4xl font-light leading-tight md:text-5xl">
              Original hand-painted art for calm, modern spaces.
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/artworks" className="bg-black px-5 py-3 text-sm text-white">
                Browse available artworks
              </Link>
              <Link href="/collections/abstract-art-for-living-room" className="border px-5 py-3 text-sm">
                Living room abstracts
              </Link>
              <Link href="/contact" className="border px-5 py-3 text-sm">
                Ask about a piece
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-8">
          <div className="container mx-auto grid gap-4 px-4 text-sm text-gray-600 md:grid-cols-4">
            <p>Signed certificate included</p>
            <p>Worldwide tracked delivery</p>
            <p>30-day return window</p>
            <p>Artist-first direct support</p>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-light">Shareable collector picks</h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  A quick edit for Instagram bios, Pinterest pins, and collector conversations.
                </p>
              </div>
              <Link href="/artworks" className="text-sm underline underline-offset-4">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {artworks.length > 0 ? artworks.map((artwork: any) => {
                const title = pickEnglish(artwork.title, "Original artwork")
                const image = getArtworkImageUrl(artwork, { width: 700 })

                return (
                  <Link key={artwork._id} href={`/artwork/${artwork.slug.current}`} className="group">
                    <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          Artwork
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{formatArtworkDimensions(artwork)}</p>
                    <p className="mt-1 font-semibold"><PriceText amountCny={artwork.price} /></p>
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
            <Link href="/collections/textured-wall-art" className="text-sm underline underline-offset-4">
              Textured wall art
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
