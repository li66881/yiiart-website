import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AddToCartButton from "@/components/AddToCartButton"
import SocialShare from "@/components/SocialShare"
import ArtworkViewTracker from "@/components/ArtworkViewTracker"
import ArtworkReviewSection from "@/components/ArtworkReviewSection"
import ReviewStars from "@/components/ReviewStars"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { client, urlFor } from "@/lib/sanity"
import {
  buildArtworkSeoTitle,
  formatDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "@/lib/artwork-display"
import {
  convertCnyToStoreAmount,
  getStoreCurrency,
} from "@/lib/pricing"
import { buildSeoMetadata } from "@/lib/seo"
import { getArtworkReviews, getReviewStats } from "@/lib/reviews"
import { getWhatsAppUrl } from "@/lib/site"
import { productAdviceItems, productConfidenceItems } from "@/lib/storefront-content"

export const revalidate = 600

async function getArtwork(slug: string) {
  try {
    return await client.fetch(
      `*[_type == "artwork" && slug.current == $slug][0]{
        _id,
        title,
        slug,
        artist->{_id, name, slug, bio, location},
        price,
        dimensions,
        medium,
        category,
        roomTypes,
        colorFamilies,
        orientation,
        surfaceFinish,
        framingNotes,
        shippingProfile,
        seoKeywords,
        socialCaption,
        images,
        description
      }`,
      { slug }
    )
  } catch (error) {
    console.error("Artwork fetch error:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artwork = await getArtwork(slug)

  if (!artwork) {
    return buildSeoMetadata({
      title: "Artwork Not Found",
      description: "This YiiArt artwork could not be found.",
      path: `/artwork/${slug}`,
      robots: { index: false, follow: true },
    })
  }

  const title = pickEnglish(artwork.title, "Original artwork")
  const artistName = pickEnglish(artwork.artist?.name, "YiiArt artist")
  const description =
    pickEnglish(artwork.description) ||
    `${title} is an original hand-painted artwork by ${artistName}, available from YiiArt with worldwide delivery and a signed certificate.`
  const imageUrl = artwork.images?.[0] ? urlFor(artwork.images[0]).width(1200).height(630).url() : undefined

  return buildSeoMetadata({
    title: buildArtworkSeoTitle(artwork),
    description,
    path: `/artwork/${slug}`,
    image: imageUrl,
    imageAlt: `${title} by ${artistName}`,
  })
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artwork = await getArtwork(slug)

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="mb-4 text-2xl">Artwork not found</h1>
            <Link href="/artworks" className="text-gray-500 hover:text-black">
              Back to artworks
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const title = pickEnglish(artwork.title, "Untitled artwork")
  const artistName = pickEnglish(artwork.artist?.name, "YiiArt artist")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)
  const dimensions = formatDimensions(artwork.dimensions)
  const description = pickEnglish(artwork.description)
  const roomTypes = normalizeList(artwork.roomTypes)
  const colorFamilies = normalizeList(artwork.colorFamilies)
  const orientation = artwork.orientation || inferOrientation(artwork.dimensions)
  const surfaceFinish = artwork.surfaceFinish || ""
  const framingNotes = artwork.framingNotes || ""
  const shippingProfile = artwork.shippingProfile || "Confirm safest format before dispatch"
  const imageUrl = artwork.images?.[0] ? urlFor(artwork.images[0]).width(1400).url() : ""
  const priceCny = Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const reviews = await getArtworkReviews(artwork._id)
  const reviewStats = getReviewStats(reviews)
  const whatsappUrl = getWhatsAppUrl(
    `Hello YiiArt, I am interested in ${title}. Can you advise on size, framing, and shipping?`
  )
  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: buildArtworkSeoTitle(artwork),
    image: (artwork.images || [])
      .filter((img: any) => img?.asset?._ref || img?._type === "image")
      .slice(0, 10)
      .map((img: any) => urlFor(img).width(1400).url()),
    description: description || `${title} is an original hand-painted artwork by ${artistName}.`,
    brand: {
      "@type": "Brand",
      name: "YiiArt",
    },
    category: category || "Original artwork",
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/artwork/${slug}`,
      priceCurrency: currency,
      price: offerPrice.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: ["US", "CA", "GB", "DE", "FR", "AU"],
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 5,
            maxValue: 7,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 7,
            maxValue: 14,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["US", "CA", "GB", "DE", "FR", "AU"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
    },
  }

  if (reviewStats.count > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewStats.overall.toFixed(1),
      reviewCount: reviewStats.count,
    }
    productJsonLd.review = reviews.map((review) => ({
      "@type": "Review",
      name: review.reviewTitle,
      reviewBody: review.reviewText,
      datePublished: review.approvedAt || review.submittedAt,
      author: {
        "@type": "Person",
        name: review.customerName || "Verified Collector",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.overallRating,
        bestRating: 5,
        worstRating: 1,
      },
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ArtworkViewTracker
        id={artwork._id}
        title={title}
        price={priceCny}
        currency={currency}
        value={offerPrice}
        category={category}
      />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 py-12">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/artworks" className="hover:text-black">Artworks</Link>
            {category && (
              <>
                <span>/</span>
                <Link href={`/artworks?category=${category}`} className="hover:text-black">{category}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-black">{title}</span>
          </nav>

          <Link href="/artworks" className="mb-8 inline-block text-gray-500 hover:text-black">
            &larr; Back to artworks
          </Link>

          <div className="mt-4 grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              {imageUrl ? (
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img src={imageUrl} alt={title} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center text-gray-400">
                  Image coming soon
                </div>
              )}

              {artwork.images?.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {artwork.images.slice(1).map((img: any, i: number) => (
                    <div key={i} className="aspect-square bg-gray-100">
                      <img src={urlFor(img).width(240).height(240).url()} alt={`${title} detail ${i + 2}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm uppercase tracking-wider text-gray-500">
                {[category, medium].filter(Boolean).join(" / ")}
              </p>
              <h1 className="mb-2 text-4xl font-light">{title}</h1>
              <p className="mb-6 text-xl text-gray-500">by {artistName}</p>
              <p className="mb-2 text-3xl font-semibold"><PriceText amountCny={priceCny} /></p>
              <p className="mb-6 text-xs text-gray-500"><PriceDisclosure /></p>
              <div className="mb-6 text-sm text-gray-600">
                {reviewStats.count > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <ReviewStars rating={reviewStats.overall} size="sm" />
                    <span>
                      {reviewStats.overall.toFixed(1)} / 5 - {reviewStats.count} verified {reviewStats.count === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                ) : (
                  <span>No reviews yet - Be the first collector to review this artwork</span>
                )}
              </div>

              <div className="mb-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                {dimensions && <Detail label="Size" value={dimensions} />}
                {medium && <Detail label="Medium" value={medium} />}
                {category && <Detail label="Style" value={category} />}
                {orientation && <Detail label="Orientation" value={orientation} />}
                {roomTypes.length > 0 && <Detail label="Best rooms" value={roomTypes.join(", ")} />}
                {colorFamilies.length > 0 && <Detail label="Palette" value={colorFamilies.join(", ")} />}
                {surfaceFinish && <Detail label="Surface" value={surfaceFinish} />}
                <Detail label="Authenticity" value="Original, one-of-a-kind" />
                <Detail label="Certificate" value="Signed certificate included" />
                <Detail label="Dispatch" value={shippingProfile} />
              </div>

              <div className="space-y-6 border-t pt-8">
                <section>
                  <h2 className="mb-3 text-lg font-medium">About this artwork</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {description || `${title} is selected for modern interiors and private collections. It is hand-painted, carefully documented, and prepared for secure international delivery.`}
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-medium">Sizing and placement</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>{dimensions ? `Artwork size: ${dimensions}.` : "Confirm exact artwork size before purchase."}</li>
                    <li>
                      {roomTypes.length > 0
                        ? `Recommended spaces: ${roomTypes.join(", ")}.`
                        : "Best for living rooms, bedrooms, hallways, offices, and quiet statement walls."}
                    </li>
                    <li>
                      {framingNotes || "Send a wall photo on WhatsApp if you need frame, scale, or placement advice before checkout."}
                    </li>
                  </ul>
                </section>
              </div>

              <div className="mt-8 space-y-4">
                <AddToCartButton
                  item={{
                    id: artwork._id,
                    title,
                    titleZh: artwork.title?.zh,
                    artist: artistName,
                    artistId: artwork.artist?._id,
                    price: priceCny,
                    image: imageUrl,
                    size: dimensions,
                  }}
                />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-black py-4 text-center transition hover:bg-black hover:text-white"
                >
                  Ask on WhatsApp before purchase
                </a>
                <SocialShare title={title} image={imageUrl} />
              </div>
            </div>
          </div>

          <section className="mt-16 grid gap-6 border-t pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">Collector support</p>
              <h2 className="text-3xl font-light">What to confirm before checkout</h2>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Original art is a physical object, so the buying decision should include scale, surface, room light,
                framing, and shipping format. These details can be confirmed before payment.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {productAdviceItems.map((item) => (
                <InfoBlock key={item.title} title={item.title} text={item.text} />
              ))}
            </div>
          </section>

          <ArtworkReviewSection reviews={reviews} stats={reviewStats} />

          <section className="mt-16 grid gap-6 border-t pt-12 md:grid-cols-3">
            {productConfidenceItems.map((item) => (
              <InfoBlock key={item.title} title={item.title} text={item.text} />
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function normalizeList(value?: string[] | null) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function inferOrientation(dimensions?: string | null) {
  if (!dimensions) return ""
  const numbers = dimensions.match(/\d+(?:\.\d+)?/g)?.map(Number)
  if (!numbers || numbers.length < 2) return ""

  const [width, height] = numbers
  if (Math.abs(width - height) < 1) return "Square"
  return width > height ? "Landscape" : "Portrait"
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      <p className="text-sm leading-6 text-gray-600">{text}</p>
    </div>
  )
}
