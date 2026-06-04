import Link from "next/link"
import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AddToCartButton from "@/components/AddToCartButton"
import SocialShare from "@/components/SocialShare"
import ArtworkViewTracker from "@/components/ArtworkViewTracker"
import ArtworkReviewSection from "@/components/ArtworkReviewSection"
import ReviewStars from "@/components/ReviewStars"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import TranslatedText, { TranslatedOption, TranslatedOptionList, TranslatedTemplate } from "@/components/TranslatedText"
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
  const artistName = pickEnglish(artwork.artist?.name, "YiiArt")
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
            <h1 className="mb-4 text-2xl"><TranslatedText k="product.notFound" /></h1>
            <Link href="/artworks" className="text-gray-500 hover:text-black">
              <TranslatedText k="product.backToArtworks" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const title = pickEnglish(artwork.title, "Untitled artwork")
  const artistName = pickEnglish(artwork.artist?.name, "YiiArt")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)
  const dimensions = formatDimensions(artwork.dimensions)
  const description = pickEnglish(artwork.description)
  const roomTypes = normalizeList(artwork.roomTypes)
  const colorFamilies = normalizeList(artwork.colorFamilies)
  const orientation = artwork.orientation || inferOrientation(artwork.dimensions)
  const surfaceFinish = artwork.surfaceFinish || ""
  const framingNotes = artwork.framingNotes || ""
  const shippingProfile = artwork.shippingProfile || ""
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
            <Link href="/" className="hover:text-black"><TranslatedText k="common.home" /></Link>
            <span>/</span>
            <Link href="/artworks" className="hover:text-black"><TranslatedText k="common.artworks" /></Link>
            {category && (
              <>
                <span>/</span>
                <Link href={`/artworks?category=${category}`} className="hover:text-black">
                  <TranslatedOption value={category} />
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-black">{title}</span>
          </nav>

          <Link href="/artworks" className="mb-8 inline-block text-gray-500 hover:text-black">
            &larr; <TranslatedText k="product.backToArtworks" />
          </Link>

          <div className="mt-4 grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              {imageUrl ? (
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img src={imageUrl} alt={title} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center text-gray-400">
                  <TranslatedText k="product.imageComingSoon" />
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
                <TranslatedOptionList values={[category, medium]} separator=" / " />
              </p>
              <h1 className="mb-2 text-4xl font-light">{title}</h1>
              <p className="mb-6 text-xl text-gray-500"><TranslatedText k="artwork.by" /> {artistName}</p>
              <p className="mb-2 text-3xl font-semibold"><PriceText amountCny={priceCny} /></p>
              <p className="mb-6 text-xs text-gray-500"><PriceDisclosure /></p>
              <div className="mb-6 text-sm text-gray-600">
                {reviewStats.count > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <ReviewStars rating={reviewStats.overall} size="sm" />
                    <span>
                      {reviewStats.overall.toFixed(1)} / 5 - {reviewStats.count}{" "}
                      <TranslatedText k={reviewStats.count === 1 ? "product.verifiedReview" : "product.verifiedReviews"} />
                    </span>
                  </div>
                ) : (
                  <span><TranslatedText k="product.noReviews" /></span>
                )}
              </div>

              <div className="mb-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                {dimensions && <Detail label={<TranslatedText k="artwork.size" />} value={dimensions} />}
                {medium && <Detail label={<TranslatedText k="artwork.medium" />} value={<TranslatedOption value={medium} />} />}
                {category && <Detail label={<TranslatedText k="product.detail.style" />} value={<TranslatedOption value={category} />} />}
                {orientation && <Detail label={<TranslatedText k="product.detail.orientation" />} value={<TranslatedOption value={orientation} />} />}
                {roomTypes.length > 0 && <Detail label={<TranslatedText k="product.detail.bestRooms" />} value={<TranslatedOptionList values={roomTypes} />} />}
                {colorFamilies.length > 0 && <Detail label={<TranslatedText k="product.detail.palette" />} value={<TranslatedOptionList values={colorFamilies} />} />}
                {surfaceFinish && <Detail label={<TranslatedText k="product.detail.surface" />} value={surfaceFinish} />}
                <Detail label={<TranslatedText k="product.detail.authenticity" />} value={<TranslatedText k="product.detail.authenticityValue" />} />
                <Detail label={<TranslatedText k="product.detail.certificate" />} value={<TranslatedText k="product.detail.certificateValue" />} />
                <Detail
                  label={<TranslatedText k="product.detail.dispatch" />}
                  value={shippingProfile || <TranslatedText k="product.detail.dispatchFallback" />}
                />
              </div>

              <div className="space-y-6 border-t pt-8">
                <section>
                  <h2 className="mb-3 text-lg font-medium"><TranslatedText k="product.aboutTitle" /></h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {description || <TranslatedTemplate k="product.aboutFallback" values={{ title }} />}
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-medium"><TranslatedText k="product.sizingTitle" /></h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      {dimensions
                        ? <TranslatedTemplate k="product.sizeLine" values={{ dimensions }} />
                        : <TranslatedText k="product.confirmSize" />}
                    </li>
                    <li>
                      {roomTypes.length > 0
                        ? <TranslatedTemplate k="product.recommendedSpaces" values={{ rooms: roomTypes.join(", ") }} />
                        : <TranslatedText k="product.defaultRooms" />}
                    </li>
                    <li>
                      {framingNotes || <TranslatedText k="product.defaultFramingAdvice" />}
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
                  <TranslatedText k="product.askWhatsApp" />
                </a>
                <SocialShare title={title} image={imageUrl} />
              </div>
            </div>
          </div>

          <section className="mt-16 grid gap-6 border-t pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">
                <TranslatedText k="product.supportEyebrow" />
              </p>
              <h2 className="text-3xl font-light"><TranslatedText k="product.confirmTitle" /></h2>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                <TranslatedText k="product.confirmText" />
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {productAdviceItems.map((item, index) => (
                <InfoBlock
                  key={item.title}
                  title={<TranslatedText k={`product.advice.${index}.title`} fallback={item.title} />}
                  text={<TranslatedText k={`product.advice.${index}.text`} fallback={item.text} />}
                />
              ))}
            </div>
          </section>

          <ArtworkReviewSection reviews={reviews} stats={reviewStats} />

          <section className="mt-16 grid gap-6 border-t pt-12 md:grid-cols-3">
            {productConfidenceItems.map((item, index) => (
              <InfoBlock
                key={item.title}
                title={<TranslatedText k={`product.confidence.${index}.title`} fallback={item.title} />}
                text={<TranslatedText k={`product.confidence.${index}.text`} fallback={item.text} />}
              />
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

function Detail({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="border p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function InfoBlock({ title, text }: { title: ReactNode; text: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      <p className="text-sm leading-6 text-gray-600">{text}</p>
    </div>
  )
}
