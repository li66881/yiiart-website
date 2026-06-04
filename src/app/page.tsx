import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroSection from "@/components/HeroSection"
import FeaturedReviews from "@/components/FeaturedReviews"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { StorefrontCollectionCard } from "@/components/StorefrontCollectionCopy"
import TranslatedText, { TranslatedOptionList } from "@/components/TranslatedText"
import TrustSection from "@/components/TrustSection"
import { client, urlFor } from "@/lib/sanity"
import { formatDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { buildSeoMetadata } from "@/lib/seo"
import { getFeaturedReviews } from "@/lib/reviews"
import { collectorJourney, storefrontCollectionTiles, type StorefrontCollectionTile } from "@/lib/storefront-content"

export const dynamic = "force-dynamic"

async function getData() {
  try {
    const artworks = await client.fetch(`*[_type == "artwork"] | order(featured desc, _createdAt desc)[0...18]{
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

      <TrustSection />

      <section className="border-b py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">
                <TranslatedText k="home.shopContext" />
              </p>
              <h2 className="text-3xl font-light md:text-4xl">
                <TranslatedText k="home.findRightArtwork" />
              </h2>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                <TranslatedText k="home.collectionIntro" />
              </p>
            </div>
            <Link href="/artworks" className="text-sm underline underline-offset-4">
              <TranslatedText k="home.browseAllWorks" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {storefrontCollectionTiles.map((collection) => (
              <StorefrontCollectionCard
                key={collection.href}
                collection={collection}
                image={collectionPreviewImage(collection, artworks)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">
              <TranslatedText k="home.collectorWorkflow" />
            </p>
            <h2 className="text-3xl font-light">
              <TranslatedText k="home.practicalPath" />
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {collectorJourney.map((item, index) => (
              <div key={item.title} className="border p-5">
                <p className="mb-8 text-sm text-gray-400">0{index + 1}</p>
                <h3 className="font-medium">
                  <TranslatedText k={`home.journey.${index}.title`} fallback={item.title} />
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  <TranslatedText k={`home.journey.${index}.text`} fallback={item.text} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-light"><TranslatedText k="home.featuredArtworks" /></h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                <TranslatedText k="home.featuredArtworksDesc" />
              </p>
            </div>
            <Link href="/artworks" className="text-sm underline underline-offset-4">
              <TranslatedText k="artwork.viewAll" />
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
                    <TranslatedOptionList
                      values={[normalizeCategory(artwork.category), normalizeMedium(artwork.medium)]}
                      separator=" / "
                    />
                  </p>
                  <h3 className="mt-1 font-medium">{pickEnglish(artwork.title, "Untitled artwork")}</h3>
                  <p className="text-sm text-gray-500">{pickEnglish(artwork.artist?.name, "YiiArt")}</p>
                  <p className="mt-1 font-semibold"><PriceText amountCny={artwork.price} /></p>
                  <p className="mt-1 text-xs text-gray-400">{formatDimensions(artwork.dimensions)}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-full py-20 text-center text-gray-500">
                <TranslatedText k="home.noArtworks" />
              </p>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-gray-500"><PriceDisclosure /></p>
        </div>
      </section>

      <section className="border-y bg-black py-16 text-white">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-[1fr_0.8fr] md:items-center">
          <div>
            <p className="mb-3 text-sm uppercase tracking-wider text-white/60">
              <TranslatedText k="home.beforeBuy" />
            </p>
            <h2 className="max-w-2xl text-3xl font-light md:text-4xl">
              <TranslatedText k="home.needAdvice" />
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
              <TranslatedText k="home.adviceDesc" />
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <Link href="/contact" className="bg-white px-5 py-4 text-center text-sm text-black">
              <TranslatedText k="home.requestRoomAdvice" />
            </Link>
            <Link href="/collections/large-canvas-art" className="border border-white/40 px-5 py-4 text-center text-sm">
              <TranslatedText k="home.compareLargeWorks" />
            </Link>
          </div>
        </div>
      </section>

      <FeaturedReviews reviews={reviews} />

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-3 text-3xl font-light"><TranslatedText k="home.ourArtists" /></h2>
          <p className="mb-8 max-w-2xl text-sm text-gray-500">
            <TranslatedText k="home.ourArtistsDesc" />
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
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <TranslatedText k="artwork.artist" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium">{pickEnglish(artist.name, "Artist")}</h3>
                  <p className="text-sm text-gray-500">{artist.location}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-full py-20 text-center text-gray-500">
                <TranslatedText k="home.noArtists" />
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function collectionPreviewImage(collection: StorefrontCollectionTile, artworks: any[]) {
  const matched = artworks.find((artwork) => {
    if (!artwork.images?.[0]) return false
    if (!collection.categories?.length) return true
    return collection.categories.includes(normalizeCategory(artwork.category))
  })

  const fallback = artworks.find((artwork) => artwork.images?.[0])
  const image = matched?.images?.[0] || fallback?.images?.[0]
  return image ? urlFor(image).width(900).height(540).url() : undefined
}
