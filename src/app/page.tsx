import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroSection from "@/components/HeroSection"
import FeaturedReviews from "@/components/FeaturedReviews"
import { client, urlFor } from "@/lib/sanity"
import { getTranslations } from "@/lib/i18n"
import { formatDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { formatStorePrice, getPriceDisclosure } from "@/lib/pricing"
import { buildSeoMetadata } from "@/lib/seo"
import { getFeaturedReviews } from "@/lib/reviews"

export const dynamic = "force-dynamic"

async function getData() {
  try {
    const artworks = await client.fetch(`*[_type == "artwork"] | order(featured desc, _createdAt desc)[0...12]{
      ...,
      artist->{name}
    }`)
    const artists = await client.fetch(`*[_type == "artist"][0...6]`)
    const reviews = await getFeaturedReviews(6)
    return { artworks, artists, reviews }
  } catch {
    return { artworks: [], artists: [], reviews: [] }
  }
}

export async function generateMetadata() {
  try {
    const artwork = await client.fetch(`*[_type == "artwork" && defined(images[0])] | order(featured desc, _createdAt desc)[0]{
      title,
      images
    }`)
    const image = artwork?.images?.[0] ? urlFor(artwork.images[0]).width(1200).height(630).url() : undefined

    return buildSeoMetadata({
      title: "Original Chinese Art for Calm Modern Homes",
      description:
        "Shop original hand-painted paintings by independent Chinese artists, with worldwide delivery, signed certificates, and a 30-day return window.",
      path: "/",
      image,
      imageAlt: artwork ? pickEnglish(artwork.title, "Original YiiArt painting") : undefined,
    })
  } catch {
    return buildSeoMetadata({
      title: "Original Chinese Art for Calm Modern Homes",
      description:
        "Shop original hand-painted paintings by independent Chinese artists, with worldwide delivery, signed certificates, and a 30-day return window.",
      path: "/",
    })
  }
}

export default async function Home() {
  const { artworks, artists, reviews } = await getData()
  const t = await getTranslations("home")
  const heroArtwork = artworks.find((artwork: any) => artwork.images?.[0])
  const heroImage = heroArtwork?.images?.[0]
    ? urlFor(heroArtwork.images[0]).width(1800).height(1200).url()
    : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <HeroSection
        imageUrl={heroImage}
        imageAlt={heroArtwork ? pickEnglish(heroArtwork.title, "Original YiiArt artwork") : undefined}
      />

      <section className="bg-gray-50 py-14">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
          <TrustBadge value="100%" title="100% Original" text="Signed certificate" />
          <TrustBadge value="Free" title="Free Shipping" text="Worldwide delivery" />
          <TrustBadge value="30" title="30-Day Trial" text="Full refund" />
          <TrustBadge value="80%" title="Support Artists" text="Paid to creators" />
        </div>
      </section>

      <FeaturedReviews reviews={reviews} />

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-light">{t["home.featuredArtworks"]}</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Original hand-painted works with clear sizing, international pricing, and collectible documentation.
              </p>
            </div>
            <Link href="/artworks" className="text-sm underline underline-offset-4">
              {t["artwork.viewAll"]}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artworks.length > 0 ? artworks.map((artwork: any) => (
              <Link key={artwork._id} href={`/artwork/${artwork.slug?.current || artwork._id}`}>
                <div className="group cursor-pointer">
                  <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                    {artwork.images?.[0] && (
                      <img
                        src={urlFor(artwork.images[0]).width(600).url()}
                        alt={pickEnglish(artwork.title, "Artwork")}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    {[normalizeCategory(artwork.category), normalizeMedium(artwork.medium)].filter(Boolean).join(" / ")}
                  </p>
                  <h3 className="mt-1 font-medium">{pickEnglish(artwork.title, "Untitled artwork")}</h3>
                  <p className="text-sm text-gray-500">{pickEnglish(artwork.artist?.name, "YiiArt artist")}</p>
                  <p className="mt-1 font-semibold">{formatStorePrice(artwork.price)}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDimensions(artwork.dimensions)}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-full py-20 text-center text-gray-500">{t["home.noArtworks"]}</p>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">{getPriceDisclosure()}</p>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-3 text-3xl font-light">{t["home.ourArtists"]}</h2>
          <p className="mb-8 max-w-2xl text-sm text-gray-500">
            Meet the artists behind each work, with biographies and available pieces kept together for collectors.
          </p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {artists.length > 0 ? artists.map((artist: any) => (
              <Link key={artist._id} href={`/artist/${artist.slug?.current || artist._id}`}>
                <div className="group cursor-pointer text-center">
                  <div className="mb-3 aspect-square overflow-hidden rounded-full bg-gray-200">
                    {artist.image ? (
                      <img
                        src={urlFor(artist.image).width(300).height(300).url()}
                        alt={pickEnglish(artist.name, "Artist")}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">Artist</div>
                    )}
                  </div>
                  <h3 className="font-medium">{pickEnglish(artist.name, "Artist")}</h3>
                  <p className="text-sm text-gray-500">{artist.location}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-full py-20 text-center text-gray-500">{t["home.noArtists"]}</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function TrustBadge({ value, title, text }: { value: string; title: string; text: string }) {
  return (
    <div>
      <div className="mb-2 text-3xl font-light">{value}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}
