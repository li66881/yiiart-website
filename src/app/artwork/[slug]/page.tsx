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
  productPackagingItems,
  productProcessItems,
} from "@/lib/storefront-content"

export const revalidate = 600

const trustItems = [
  { title: "Secure payment", text: "Checkout and invoice options are handled through configured payment providers or YiiArt support." },
  { title: "Worldwide shipping", text: "International delivery is prepared according to artwork size, surface, and destination." },
  { title: "Carefully packaged", text: "Rolled, stretched, or flat packaging is selected for the safest practical handling." },
  { title: "Damage protection", text: "Keep all packaging and send photos promptly if carrier damage is found on arrival." },
  { title: "Handmade artwork", text: "YiiArt focuses on physical hand-painted works rather than mass-produced poster prints." },
]

const artworkPageFaqs = [
  {
    question: "Will the painting look exactly like the photo?",
    answer: "Photos are prepared to show the artwork clearly, but screen color, daylight, and room lighting can change how color and texture appear. Ask for extra daylight photos or a short video before purchase if palette accuracy is important.",
  },
  {
    question: "Can I request a custom size?",
    answer: "Yes. Send your wall size, room photo, preferred orientation, and color direction. YiiArt can confirm whether a custom canvas is possible before production starts.",
  },
  {
    question: "Is the painting handmade?",
    answer: "Yes. YiiArt product pages are intended for original hand-painted artwork unless a listing clearly says otherwise.",
  },
  {
    question: "What if it arrives damaged?",
    answer: "Keep the artwork, box, inner packaging, and shipping label. Contact YiiArt promptly with clear photos so the damage support process can be reviewed.",
  },
]

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

async function getRelatedArtworks(artworkId: string, category?: string | null, medium?: string | null) {
  try {
    return await client.fetch(
      `*[_type == "artwork" && _id != $artworkId && (
        (defined($category) && category == $category) ||
        (defined($medium) && medium == $medium)
      )] | order(featured desc, _createdAt desc)[0...4]{
        _id,
        title,
        slug,
        artist->{name},
        price,
        dimensions,
        medium,
        category,
        cloudflareImages,
        images
      }`,
      { artworkId, category: category || null, medium: medium || null }
    )
  } catch {
    return []
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
  const artworkImageAlt = buildArtworkImageAlt({
    title,
    artistName,
    category,
    medium,
    dimensions,
    roomTypes,
  })
  const priceCny = Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const directCheckoutAvailable = priceCny > 0 && isArtworkDirectCheckoutAvailable(artwork)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const reviews = await getArtworkReviews(artwork._id)
  const reviewStats = getReviewStats(reviews)
  const relatedArtworks = await getRelatedArtworks(artwork._id, artwork.category, artwork.medium)
  const whatsappUrl = getWhatsAppUrl(
    `Hello YiiArt, I am interested in ${title}. Can you advise on size, framing, and shipping?`
  )
  const customRequestUrl = getWhatsAppUrl(
    `Hello YiiArt, I need a custom size or color palette based on ${title}. Can I share my wall size and room photo?`
  )
  const invoiceUrl = getWhatsAppUrl(
    `Hello YiiArt, I would like to confirm availability and request an invoice for ${title}.`
  )
  const cartItem = {
    id: artwork._id,
    title,
    titleZh: artwork.title?.zh,
    artist: artistName,
    artistId: artwork.artist?._id,
    price: priceCny,
    image: imageUrl,
    size: dimensions,
  }
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

      <main className="flex-1 pb-28 pt-24 lg:pb-16">
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
                  <img src={imageUrl} alt={artworkImageAlt} className="h-full w-full object-contain" />
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
                      <img
                        src={thumbnailUrl}
                        alt={`${artworkImageAlt}, detail view ${i + 2}`}
                        className="h-full w-full object-cover"
                      />
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
              <div className="mb-6 space-y-3">
                <PurchaseOption label="Selected size" value={dimensions || "Confirm exact size before purchase"} />
                {framingNotes && <PurchaseOption label="Frame option" value={framingNotes} />}
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
                  <AddToCartButton item={cartItem} />
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
                  href={customRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-black py-4 text-center transition hover:bg-black hover:text-white"
                >
                  Request Custom Size / Color
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-stone-300 py-3 text-center text-sm transition hover:border-black"
                >
                  Ask on WhatsApp before purchase
                </a>
                <SocialShare title={title} image={imageUrl} />
              </div>
            </div>
          </div>

          <section className="mt-16 grid gap-8 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Artwork Details</p>
              <h2 className="text-3xl font-light">Know the artwork before it enters your room</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Product rows are shown when the current listing has enough information. For missing production details,
                YiiArt confirms the safest format before dispatch or custom production.
              </p>
            </div>
            <ArtworkDetails
              medium={medium}
              surfaceFinish={surfaceFinish}
              framingNotes={framingNotes}
              shippingProfile={shippingProfile}
            />
          </section>

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Size & Room Guide</p>
              <h2 className="text-3xl font-light">Check the scale before you choose</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Use this as a practical starting point for sofas, beds, entryways, and feature walls. For exact advice,
                send your wall width and a room photo on WhatsApp before purchase.
              </p>
              <Link href="/size-guide" className="mt-5 inline-flex text-sm underline underline-offset-4">
                Read full size guide
              </Link>
            </div>
            <ScaleGuidance dimensions={artwork.dimensions} roomTypes={roomTypes} title={title} />
          </section>

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Customization</p>
              <h2 className="text-3xl font-light">Need a custom size, color palette, or matching artwork for your room?</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Send your wall width, ceiling height, room photo, and preferred palette. YiiArt can help confirm whether
                this artwork fits as listed or whether a custom painting is a better path.
              </p>
              <a
                href={customRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Request Custom Painting
              </a>
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

          <section className="mt-16 border-t border-stone-200 pt-12">
            <div className="mb-8">
              <p className="mb-3 text-sm uppercase text-stone-500">Trust Block</p>
              <h2 className="text-3xl font-light">A safer way to buy handmade artwork online</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              {trustItems.map((item) => (
                <InfoBlock key={item.title} title={item.title} text={item.text} />
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

          <section className="mt-16 grid gap-6 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Shipping & Returns Summary</p>
              <h2 className="text-3xl font-light">Short version before checkout</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Most ready-made works are prepared with protective packaging and international delivery support.
                Eligible ready-made artworks can request returns within the stated policy window; custom work may have
                separate terms confirmed before production.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <Link href="/shipping-returns" className="underline underline-offset-4">Read Shipping & Returns</Link>
                <Link href="/shipping" className="underline underline-offset-4">Read full Shipping page</Link>
                <Link href="/returns" className="underline underline-offset-4">Read full Returns page</Link>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <InfoBlock title="Processing time" text={shippingProfile || "Final checks and packaging are confirmed before dispatch."} />
              <InfoBlock title="Shipping time" text="Transit timing depends on destination, customs, carrier route, and the safest shipping format for the artwork." />
              <InfoBlock title="Returns and damage" text="Keep all packaging if the artwork arrives damaged, then contact YiiArt promptly with photos for review." />
            </div>
          </section>

          <section className="mt-16 grid gap-8 border-t border-stone-200 pt-12 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">FAQ</p>
              <h2 className="text-3xl font-light">Product questions collectors often ask</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                These answers are written for original handmade paintings, large wall art, custom canvas inquiries,
                and home interior placement decisions.
              </p>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {artworkPageFaqs.map((item) => (
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

          <section className="mt-16 border-t border-stone-200 pt-12">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-sm uppercase text-stone-500">Related Products</p>
                <h2 className="text-3xl font-light">Similar artworks to compare</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                  Compare works with a similar style or medium before deciding on size, palette, and room fit.
                </p>
              </div>
              <Link href="/artworks" className="text-sm underline underline-offset-4">View all artworks</Link>
            </div>
            {relatedArtworks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {relatedArtworks.map((related: any) => (
                  <RelatedArtworkCard key={related._id} artwork={related} />
                ))}
              </div>
            ) : (
              <p className="border-y border-stone-200 py-12 text-center text-stone-500">
                Related artworks will appear here when similar product data is available.
              </p>
            )}
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

      <MobileArtworkActionBar
        directCheckoutAvailable={directCheckoutAvailable}
        cartItem={cartItem}
        invoiceUrl={invoiceUrl}
        whatsappUrl={whatsappUrl}
      />
      <Footer />
    </div>
  )
}

function MobileArtworkActionBar({
  directCheckoutAvailable,
  cartItem,
  invoiceUrl,
  whatsappUrl,
}: {
  directCheckoutAvailable: boolean
  cartItem: {
    id: string
    title: string
    titleZh?: string
    artist: string
    artistId?: string
    price: number
    image: string
    size?: string
  }
  invoiceUrl: string
  whatsappUrl: string
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-2 gap-3">
        {directCheckoutAvailable ? (
          <AddToCartButton item={cartItem} />
        ) : (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black px-3 py-4 text-center text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Request invoice
          </a>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-black px-3 py-4 text-center text-sm font-medium transition hover:bg-black hover:text-white"
        >
          Ask on WhatsApp
        </a>
      </div>
    </div>
  )
}

function PurchaseOption({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-stone-200 bg-[#fbfaf6] p-4">
      <p className="text-xs uppercase text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6">{value}</p>
    </div>
  )
}

function ArtworkDetails({
  medium,
  surfaceFinish,
  framingNotes,
  shippingProfile,
}: {
  medium?: string
  surfaceFinish?: string
  framingNotes?: string
  shippingProfile?: string
}) {
  const rows = [
    medium ? { label: "Material", value: inferMaterial(medium) } : null,
    medium ? { label: "Medium", value: medium } : null,
    medium && /canvas/i.test(medium) ? { label: "Canvas type", value: "Artist canvas" } : null,
    { label: "Handmade note", value: "Original hand-painted artwork, not a mass-produced print." },
    framingNotes ? { label: "Frame option", value: framingNotes } : null,
    { label: "Processing time", value: shippingProfile || "Final checks, documentation, and packing are confirmed before dispatch." },
    { label: "Shipping time", value: "Transit timing depends on destination, customs, carrier route, and the safest shipping format for the artwork." },
    surfaceFinish ? { label: "Surface", value: surfaceFinish } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <Detail key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  )
}

function RelatedArtworkCard({ artwork }: { artwork: any }) {
  const href = `/artwork/${artwork.slug?.current || artwork._id}`
  const image = getArtworkImageUrl(artwork, { width: 700, height: 900 })
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        {image ? (
          <img
            src={image}
            alt={`${title}, related handmade artwork`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-stone-200 bg-white text-stone-400">
            Artwork image coming soon
          </div>
        )}
      </div>
      <div className="pt-4">
        <p className="text-xs uppercase text-stone-500">{[category, medium].filter(Boolean).join(" / ")}</p>
        <h3 className="mt-2 font-medium leading-snug">{title}</h3>
        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-stone-500">{formatDimensions(artwork.dimensions)}</span>
          <span className="font-semibold"><PriceText amountCny={artwork.price} /></span>
        </div>
      </div>
    </Link>
  )
}

function inferMaterial(medium: string) {
  if (/canvas/i.test(medium)) return "Canvas"
  if (/panel/i.test(medium)) return "Panel"
  return medium
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

function buildArtworkImageAlt({
  title,
  artistName,
  category,
  medium,
  dimensions,
  roomTypes,
}: {
  title: string
  artistName: string
  category?: string
  medium?: string
  dimensions?: string
  roomTypes: string[]
}) {
  const artType = [category, medium].filter(Boolean).join(" ")
  const scale = dimensions ? `${dimensions} canvas art` : "canvas art"
  const roomFit = roomTypes.length > 0 ? ` for ${roomTypes.slice(0, 2).join(" and ")}` : " for home interiors"

  return [`${title} by ${artistName}`, artType, scale + roomFit]
    .filter(Boolean)
    .join(", ")
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

function ScaleGuidance({
  dimensions,
  roomTypes,
  title,
}: {
  dimensions?: string | null
  roomTypes: string[]
  title: string
}) {
  const parsed = parseDimensionsCm(dimensions)
  const scale = getScaleProfile(parsed)
  const rooms = roomTypes.length > 0 ? roomTypes.join(", ") : scale.rooms

  return (
    <div className="border border-stone-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-[0.7fr_1fr] md:items-end">
        <div>
          <p className="text-xs uppercase text-stone-500">Artwork scale</p>
          <h3 className="mt-2 text-2xl font-light">{scale.label}</h3>
          <p className="mt-2 text-sm text-stone-500">
            {parsed ? `${Math.round(parsed.width)} x ${Math.round(parsed.height)} cm` : "Confirm exact dimensions"}
          </p>
        </div>
        <div className="space-y-2">
          <ScaleBar label="Accent" active={scale.rank >= 1} />
          <ScaleBar label="Room anchor" active={scale.rank >= 2} />
          <ScaleBar label="Feature wall" active={scale.rank >= 3} />
          <ScaleBar label="Oversized statement" active={scale.rank >= 4} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {scale.placements.map((placement) => (
          <div key={placement.title} className="border-t border-stone-200 pt-4">
            <h4 className="font-medium">{placement.title}</h4>
            <p className="mt-2 text-sm leading-6 text-stone-600">{placement.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 border-t border-stone-200 pt-4 text-sm leading-6 text-stone-600">
        {title} is best reviewed against your actual wall, furniture width, ceiling height, and viewing distance.
        Recommended spaces: {rooms}.
      </p>
    </div>
  )
}

function ScaleBar({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3 text-xs text-stone-500">
      <span className={`h-2 flex-1 ${active ? "bg-stone-950" : "bg-stone-200"}`} />
      <span className="w-32">{label}</span>
    </div>
  )
}

function parseDimensionsCm(dimensions?: string | null) {
  if (!dimensions) return null
  const numbers = dimensions.match(/\d+(?:\.\d+)?/g)?.map(Number)
  if (!numbers || numbers.length < 2) return null

  let [width, height] = numbers
  if (/mm/i.test(dimensions) || Math.max(width, height) > 300) {
    width = width / 10
    height = height / 10
  }

  return { width, height }
}

function getScaleProfile(dimensions: { width: number; height: number } | null) {
  const longest = dimensions ? Math.max(dimensions.width, dimensions.height) : 90
  const rank = longest >= 150 ? 4 : longest >= 110 ? 3 : longest >= 70 ? 2 : 1
  const label = rank === 4 ? "Oversized statement" : rank === 3 ? "Large wall art" : rank === 2 ? "Medium room anchor" : "Small accent"

  if (rank >= 4) {
    return {
      rank,
      label,
      rooms: "feature walls, open living rooms, offices, and hospitality spaces",
      placements: [
        { title: "Sofa wall", text: "Use when the sofa wall has generous breathing room on both sides." },
        { title: "Bed wall", text: "Works best above wide headboards or in rooms with strong ceiling height." },
        { title: "Shipping", text: "Confirm rolled, stretched, or freight handling before purchase." },
      ],
    }
  }

  if (rank === 3) {
    return {
      rank,
      label,
      rooms: "living rooms, bedrooms, dining rooms, and feature walls",
      placements: [
        { title: "Sofa wall", text: "A strong option when the artwork is roughly two-thirds of the sofa width." },
        { title: "Bed wall", text: "Can anchor a queen or king headboard when centered with room around lamps." },
        { title: "Entryway", text: "Best for wider entries or open hallways with viewing distance." },
      ],
    }
  }

  if (rank === 2) {
    return {
      rank,
      label,
      rooms: "bedrooms, entries, offices, reading corners, and smaller living rooms",
      placements: [
        { title: "Sofa wall", text: "Use above compact sofas or pair with another work for wider furniture." },
        { title: "Bed wall", text: "Good for smaller beds, guest rooms, or layered bedroom styling." },
        { title: "Entryway", text: "Fits spaces where viewers stand closer to the artwork." },
      ],
    }
  }

  return {
    rank,
    label,
    rooms: "small walls, shelves, corners, entries, and grouped arrangements",
    placements: [
      { title: "Sofa wall", text: "Usually better as part of a pair or gallery grouping above larger furniture." },
      { title: "Bed wall", text: "Works for narrow beds, side walls, or intimate corners." },
      { title: "Entryway", text: "A practical accent for compact walls and close viewing." },
    ],
  }
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
