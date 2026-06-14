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
  const featuredArtworks = artworks.slice(0, 8)

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />

      <HeroSection
        imageUrl={heroImage}
        imageAlt={heroArtwork ? pickEnglish(heroArtwork.title, "Original YiiArt artwork") : undefined}
      />

      <TrustSection />

      <section className="border-b border-stone-200 py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">
                <TranslatedText k="home.shopContext" />
              </p>
              <h2 className="max-w-3xl text-4xl font-light leading-tight md:text-5xl">
                <TranslatedText k="home.findRightArtwork" />
              </h2>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-base leading-8 text-stone-600">
                <TranslatedText k="home.collectionIntro" />
              </p>
              <Link href="/artworks" className="mt-5 inline-flex border border-stone-950 px-5 py-3 text-sm transition hover:bg-black hover:text-white">
                <TranslatedText k="home.browseAllWorks" />
              </Link>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">
                <TranslatedText k="home.collectorWorkflow" />
              </p>
              <h2 className="text-4xl font-light leading-tight">
                <TranslatedText k="home.practicalPath" />
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {collectorJourney.map((item, index) => (
                <div key={item.title} className="border-t border-stone-300 pt-5">
                  <p className="text-sm text-stone-400">0{index + 1}</p>
                  <h3 className="mt-5 font-medium text-stone-950">
                    <TranslatedText k={`home.journey.${index}.title`} fallback={item.title} />
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    <TranslatedText k={`home.journey.${index}.text`} fallback={item.text} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-light">
                <TranslatedText k="home.featuredArtworks" />
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                <TranslatedText k="home.featuredArtworksDesc" />
              </p>
            </div>
            <Link href="/artworks" className="text-sm underline underline-offset-4">
              <TranslatedText k="artwork.viewAll" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {featuredArtworks.length > 0 ? featuredArtworks.map((artwork: any) => (
              <ArtworkCard key={artwork._id} artwork={artwork} />
            )) : (
              <p className="col-span-full border-y border-stone-200 py-20 text-center text-stone-500">
                <TranslatedText k="home.noArtworks" />
              </p>
            )}
          </div>

          {artworks.length > 0 && (
            <p className="mt-8 text-center text-xs text-stone-500">
              <PriceDisclosure />
            </p>
          )}
        </div>
      </section>

      <section className="bg-stone-950 text-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_0.65fr] md:items-center lg:px-10">
          <div>
            <p className="mb-3 text-sm uppercase text-white/60">
              <TranslatedText k="home.beforeBuy" />
            </p>
            <h2 className="max-w-2xl text-4xl font-light leading-tight md:text-5xl">
              <TranslatedText k="home.needAdvice" />
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              <TranslatedText k="home.adviceDesc" />
            </p>
          </div>
          <div className="grid gap-3">
            <Link href="/contact" className="bg-white px-6 py-4 text-center text-sm font-medium text-black transition hover:bg-stone-100">
              <TranslatedText k="home.requestRoomAdvice" />
            </Link>
            <Link href="/collections/large-canvas-art" className="border border-white/35 px-6 py-4 text-center text-sm font-medium transition hover:bg-white hover:text-black">
              <TranslatedText k="home.compareLargeWorks" />
            </Link>
          </div>
        </div>
      </section>

      <FeaturedReviews reviews={reviews} />

      <section className="border-t border-stone-200 bg-[#f3efe6] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-light">
                <TranslatedText k="home.ourArtists" />
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                <TranslatedText k="home.ourArtistsDesc" />
              </p>
            </div>
            <Link href="/artists" className="text-sm underline underline-offset-4">
              <TranslatedText k="nav.artists" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {artists.length > 0 ? artists.map((artist: any) => (
              <Link key={artist._id} href={`/artist/${artist.slug?.current || artist._id}`} className="group block bg-white p-4 transition hover:bg-stone-950 hover:text-white">
                <div className="aspect-[4/5] overflow-hidden bg-stone-200">
                  {artist.image ? (
                    <img
                      src={urlFor(artist.image).width(420).height(520).url()}
                      alt={pickEnglish(artist.name, "Artist")}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-400">
                      <TranslatedText k="artwork.artist" />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-medium">{pickEnglish(artist.name, "Artist")}</h3>
                <p className="mt-1 text-sm text-stone-500 group-hover:text-white/70">{artist.location}</p>
              </Link>
            )) : (
              <p className="col-span-full border-y border-stone-300 py-20 text-center text-stone-500">
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

function ArtworkCard({ artwork }: { artwork: any }) {
  const href = `/artwork/${artwork.slug?.current || artwork._id}`
  const image = artwork.images?.[0] ? urlFor(artwork.images[0]).width(700).height(900).url() : undefined
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        {image && (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/72 px-4 py-3 text-sm text-white opacity-0 transition group-hover:opacity-100">
          <span>{formatDimensions(artwork.dimensions)}</span>
          <span>View artwork</span>
        </div>
      </div>
      <div className="pt-4">
        <p className="text-xs uppercase text-stone-500">
          <TranslatedOptionList values={[category, medium]} separator=" / " />
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium leading-snug">{title}</h3>
            <p className="mt-1 text-sm text-stone-500">{pickEnglish(artwork.artist?.name, "YiiArt")}</p>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold">
            <PriceText amountCny={artwork.price} />
          </p>
        </div>
      </div>
    </Link>
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
