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
import { client } from "@/lib/sanity"
import {
  buildArtworkSeoTitle,
  formatDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls } from "@/lib/artwork-images"
import {
  convertCnyToStoreAmount,
  getStoreCurrency,
} from "@/lib/pricing"
import { buildSeoMetadata } from "@/lib/seo"
import { getArtworkReviews, getReviewStats } from "@/lib/reviews"
import { getWhatsAppUrl } from "@/lib/site"
import {
  productAdviceItems,
  productConfidenceItems,
  productFaqItems,
  productPackagingItems,
  productProcessItems,
} from "@/lib/storefront-content"

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
        availability,
        allowCheckout,
        reservedUntil,
        cloudflareImages,
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
  const imageUrl = getArtworkImageUrl(artwork, { width: 1200, height: 630 })

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
  const galleryImages = getArtworkImageUrls(artwork, { width: 1400 })
  const thumbnailImages = getArtworkImageUrls(artwork, { width: 240, height: 240 })
  const imageUrl = galleryImages[0] || ""
  const priceCny = Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const directCheckoutAvailable = priceCny > 0 && isArtworkDirectCheckoutAvailable(artwork)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const reviews = await getArtworkReviews(artwork._id)
  const reviewStats = getReviewStats(reviews)
  const whatsappUrl = getWhatsAppUrl(
    `Hello YiiArt, I am interested in ${title}. Can you advise on size, framing, and shipping?`
  )
  const invoiceUrl = getWhatsAppUrl(
    `Hello YiiArt, I would like to confirm availability and request an invoice for ${title}.`
  )
  const offer: Record<string, any> = {
    "@type": "Offer",
    url: `${baseUrl}/artwork/${slug}`,
    priceCurrency: currency,
    availability: getSchemaAvailability(artwork, directCheckoutAvailable),
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
  }

  if (priceCny > 0) {
    offer.price = offerPrice.toFixed(2)
  }

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: buildArtworkSeoTitle(artwork),
    image: galleryImages.slice(0, 10),
    description: description || `${title} is an original hand-painted artwork by ${artistName}.`,
    brand: {
      "@type": "Brand",
      name: "YiiArt",
    },
    category: category || "Original artwork",
    offers: offer,
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
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
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

      <main className="flex-1 pb-16 pt-24">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-stone-500" aria-label="Breadcrumb">
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

          <Link href="/artworks" className="mb-8 inline-block text-stone-500 hover:text-black">
            &larr; <TranslatedText k="product.backToArtworks" />
          </Link>

          <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.75fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              {imageUrl ? (
                <div className="aspect-[4/5] overflow-hidden border border-stone-200 bg-white">
                  <img src={imageUrl} alt={title} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center border border-stone-200 bg-white text-stone-400">
                  <TranslatedText k="product.imageComingSoon" />
                </div>
              )}

              {thumbnailImages.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {thumbnailImages.slice(1).map((thumbnailUrl, i) => (
                    <div key={thumbnailUrl} className="aspect-square overflow-hidden border border-stone-200 bg-white">
                      <img src={thumbnailUrl} alt={`${title} detail ${i + 2}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-stone-200 bg-white p-6 md:p-8">
              <p className="mb-2 text-sm uppercase text-stone-500">
                <TranslatedOptionList values={[category, medium]} separator=" / " />
              </p>
              <h1 className="mb-3 text-4xl font-light leading-tight md:text-5xl">{title}</h1>
              <p className="mb-6 text-lg text-stone-500"><TranslatedText k="artwork.by" /> {artistName}</p>
              <div className="mb-6 border-y border-stone-200 py-5">
                <p className="text-3xl font-semibold"><PriceText amountCny={priceCny} /></p>
                <p className="mt-2 text-xs leading-5 text-stone-500"><PriceDisclosure /></p>
              </div>
              <div className="mb-6 grid gap-2 text-sm text-stone-700">
                <p className="border border-stone-200 bg-[#fbfaf6] px-4 py-3">Handmade original painting, not a mass-produced print.</p>
                <p className="border border-stone-200 bg-[#fbfaf6] px-4 py-3">Ask for extra daylight photos or a room-size check before purchase.</p>
                <p className="border border-stone-200 bg-[#fbfaf6] px-4 py-3">Free worldwide shipping and a 30-day return window for eligible ready-made works.</p>
              </div>
              <div className="mb-6 text-sm text-stone-600">
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

              <div className="mb-8 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
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

              <div className="space-y-6 border-t border-stone-200 pt-8">
                <section>
                  <h2 className="mb-3 text-lg font-medium"><TranslatedText k="product.aboutTitle" /></h2>
                  <p className="whitespace-pre-line leading-7 text-stone-600">
                    {description || <TranslatedTemplate k="product.aboutFallback" values={{ title }} />}
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-medium"><TranslatedText k="product.sizingTitle" /></h2>
                  <ul className="space-y-2 text-stone-600">
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
                {directCheckoutAvailable ? (
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
                ) : (
                  <div className="border border-stone-200 bg-[#fbfaf6] p-5">
                    <p className="font-medium">Confirm availability before checkout</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {priceCny > 0
                        ? "This artwork needs final availability confirmation before direct checkout."
                        : "This artwork is available by request. YiiArt will confirm price, shipping, and payment details before issuing an invoice."}
                    </p>
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block w-full bg-black py-4 text-center text-white transition hover:bg-stone-800"
                    >
                      Request invoice
                    </a>
                  </div>
                )}
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

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">
                <TranslatedText k="product.supportEyebrow" />
              </p>
              <h2 className="text-3xl font-light"><TranslatedText k="product.confirmTitle" /></h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
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

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Handmade modern painting</p>
              <h2 className="text-3xl font-light">What YiiArt checks before this artwork ships</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Buying original canvas art online should feel clear before payment. These checks help you confirm
                surface, color, scale, and delivery format before the work reaches your home.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {productProcessItems.map((item) => (
                <InfoBlock key={item.title} title={item.title} text={item.text} />
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Packaging and delivery</p>
              <h2 className="text-3xl font-light">Prepared for canvas size, surface, and shipping safety</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Shipping format depends on the artwork size and safest handling method. Oversized canvas art may ship
                rolled, while smaller works can sometimes ship stretched or framed.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {productPackagingItems.map((item) => (
                <InfoBlock key={item.title} title={item.title} text={item.text} />
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-8 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Before you decide</p>
              <h2 className="text-3xl font-light">Product questions collectors often ask</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                These answers are written for original handmade paintings, large wall art, custom canvas inquiries,
                and home interior placement decisions.
              </p>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {productFaqItems.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {item.question}
                      <span className="text-stone-400 group-open:hidden">+</span>
                      <span className="hidden text-stone-400 group-open:inline">-</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <ArtworkReviewSection reviews={reviews} stats={reviewStats} />

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 md:grid-cols-4">
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

function isArtworkDirectCheckoutAvailable(artwork: {
  availability?: "available" | "reserved" | "sold" | string
  allowCheckout?: boolean
  reservedUntil?: string | null
}) {
  if (artwork.allowCheckout === false) return false
  if (artwork.availability === "sold") return false
  if (artwork.availability === "reserved") {
    if (!artwork.reservedUntil) return false
    return new Date(artwork.reservedUntil).getTime() < Date.now()
  }
  return true
}

function getSchemaAvailability(
  artwork: {
    availability?: "available" | "reserved" | "sold" | string
    allowCheckout?: boolean
    reservedUntil?: string | null
  },
  directCheckoutAvailable: boolean
) {
  if (artwork.availability === "sold") return "https://schema.org/SoldOut"
  if (directCheckoutAvailable) return "https://schema.org/InStock"
  if (artwork.availability === "reserved") return "https://schema.org/LimitedAvailability"
  return "https://schema.org/LimitedAvailability"
}

function Detail({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="border border-stone-200 bg-[#fbfaf6] p-4">
      <p className="text-xs uppercase text-stone-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function InfoBlock({ title, text }: { title: ReactNode; text: ReactNode }) {
  return (
    <div className="border-t border-stone-300 pt-5">
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      <p className="text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
