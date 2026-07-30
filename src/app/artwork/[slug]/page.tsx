import Link from "next/link"
import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductGallery from "@/components/storefront/ProductGallery"
import ProductDisclosure from "@/components/storefront/ProductDisclosure"
import ProductPurchasePanel from "@/components/storefront/ProductPurchasePanel"
import ProductAccordion from "@/components/storefront/ProductAccordion"
import ProductRail from "@/components/storefront/ProductRail"
import ArtistSpotlight from "@/components/storefront/ArtistSpotlight"
import storefrontStyles from "@/components/storefront/storefront.module.css"
import SocialShare from "@/components/SocialShare"
import ArtworkViewTracker from "@/components/ArtworkViewTracker"
import ArtworkReviewSection from "@/components/ArtworkReviewSection"
import ReviewStars from "@/components/ReviewStars"
import TranslatedText, { TranslatedOption, TranslatedOptionList, TranslatedTemplate } from "@/components/TranslatedText"
import { client, urlFor } from "@/lib/sanity"
import {
  buildArtworkSeoTitle,
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls } from "@/lib/artwork-images"
import { buildProductGalleryMedia } from "@/lib/artwork-media"
import {
  convertCnyToStoreAmount,
  getStoreCurrency,
} from "@/lib/pricing"
import { buildStorefrontProduct } from "@/lib/storefront/product"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"
import { getArtworkReviews, getReviewStats } from "@/lib/reviews"
import { statsForReviews, withSampleReviewsFallback } from "@/lib/sample-reviews"
import { getWhatsAppUrl } from "@/lib/site"
import { productConfidenceItems } from "@/lib/storefront-content"

export const revalidate = 600

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
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && slug.current == $slug][0]{
        _id,
        title,
        slug,
        artist->{_id, name, slug, bio, location, image},
        collectionType,
        productionModel,
        rightsStatus,
        migrationStatus,
        price,
        dimensions,
        widthCm,
        heightCm,
        medium,
        category,
        roomTypes,
        colorFamilies,
        styleTags,
        orientation,
        standardSizes,
        frameOptions,
        creationWindow,
        surfaceFinish,
        framingNotes,
        shippingProfile,
        seoKeywords,
        socialCaption,
        availability,
        allowCheckout,
        reservedUntil,
        cloudflareImages,
        productMedia,
        images,
        description,
        shortDescription,
        artworkStory,
        materials
      }`,
      { slug }
    )
  } catch (error) {
    console.error("Artwork fetch error:", error)
    return null
  }
}

async function getArtistArtworks(artistId?: string | null, excludeId?: string) {
  if (!artistId) return []
  try {
    return await client.fetch(
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && artist._ref == $artistId && _id != $excludeId]
        | order(featured desc, _createdAt desc)[0...8]{
          _id,
          title,
          slug,
          sku,
          price,
          cloudflareImages,
          productMedia,
          images
        }`,
      { artistId, excludeId: excludeId || "" },
    )
  } catch {
    return []
  }
}

async function getRelatedArtworks(artworkId: string, category?: string | null, medium?: string | null) {
  try {
    return await client.fetch(
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && _id != $artworkId && (
        (defined($category) && category == $category) ||
        (defined($medium) && medium == $medium)
      )] | order(featured desc, _createdAt desc)[0...8]{
        _id,
        title,
        slug,
        sku,
        artist->{name},
        price,
        dimensions,
        widthCm,
        heightCm,
        medium,
        category,
        cloudflareImages,
        productMedia,
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
  const dimensions = formatArtworkDimensions(artwork)
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)
  const description =
    pickEnglish(artwork.description) ||
    buildArtworkMetaDescription({
      title,
      artistName,
      category,
      medium,
      dimensions,
    })
  const imageUrl = getArtworkImageUrl(artwork, { width: 1200, height: 630 })

  return buildSeoMetadata({
    title: buildArtworkSeoTitle(artwork),
    description,
    path: `/artwork/${slug}`,
    image: imageUrl,
    imageAlt: `${title} by ${artistName}, original handmade artwork`,
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
  const dimensions = formatArtworkDimensions(artwork)
  const description = pickEnglish(artwork.description)
  const roomTypes = normalizeList(artwork.roomTypes)
  const colorFamilies = normalizeList(artwork.colorFamilies)
  const orientation = artwork.orientation || inferOrientation(dimensions)
  const surfaceFinish = artwork.surfaceFinish || ""
  const framingNotes = artwork.framingNotes || ""
  const shippingProfile = artwork.shippingProfile || ""
  const galleryImages = getArtworkImageUrls(artwork, { width: 1400 })
  const imageUrl = galleryImages[0] || ""
  const artworkImageAlt = buildArtworkImageAlt({
    title,
    artistName,
    category,
    medium,
    dimensions,
    roomTypes,
  })
  const galleryMedia = buildProductGalleryMedia(artwork, galleryImages, artworkImageAlt)
  const storefrontProduct = buildStorefrontProduct(
    {
      ...artwork,
      sku: artwork.sku || slug,
    },
    galleryMedia
      .filter((item) => item.type === "image")
      .map((item, index) => ({
        src: item.url,
        alt: item.alt || (index === 0 ? artworkImageAlt : `${artworkImageAlt}, detail view ${index + 1}`),
        width: item.width || 1400,
        height: item.height || 1750,
        kind:
          item.role === "living_room" || item.role === "bedroom"
            ? ("room" as const)
            : item.role === "detail" || item.role === "angle"
              ? ("detail" as const)
              : item.role === "scale"
                ? ("scale" as const)
                : index === 0
                  ? ("artwork" as const)
                  : ("detail" as const),
      })),
  )
  const priceCny = storefrontProduct.sizes[0]?.priceCny || Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const directCheckoutAvailable = storefrontProduct.sizes.length > 0 && isArtworkDirectCheckoutAvailable(artwork)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const reviews = withSampleReviewsFallback(await getArtworkReviews(artwork._id))
  const reviewStats = reviews.some((review) => review._id.startsWith("sample-"))
    ? statsForReviews(reviews)
    : getReviewStats(reviews)
  const relatedArtworks = await getRelatedArtworks(artwork._id, artwork.category, artwork.medium)
  const artistArtworks = await getArtistArtworks(artwork.artist?._id, artwork._id)
  const artistImageUrl = artwork.artist?.image
    ? urlFor(artwork.artist.image).width(200).height(200).url()
    : null
  const artistBio = pickEnglish(artwork.artist?.bio, "")
  const whatsappUrl = getWhatsAppUrl(
    `Hello YiiArt, I am interested in ${title}. Can you advise on size, framing, and shipping?`
  )
  const invoiceUrl = getWhatsAppUrl(
    `Hello YiiArt, I would like to confirm availability and request an invoice for ${title}.`
  )
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const offer: Record<string, any> = {
    "@type": "Offer",
    url: `${baseUrl}/artwork/${slug}`,
    sku: artwork.sku || slug,
    priceCurrency: currency,
    priceValidUntil,
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
  } else if (offer.availability === "https://schema.org/InStock") {
    // An InStock offer without a price fails rich-result validation; downgrade it.
    offer.availability = "https://schema.org/LimitedAvailability"
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
    material: medium ? inferMaterial(medium) : undefined,
    size: dimensions || undefined,
    additionalProperty: [
      dimensions ? { "@type": "PropertyValue", name: "Dimensions", value: dimensions } : null,
      medium ? { "@type": "PropertyValue", name: "Medium", value: medium } : null,
      category ? { "@type": "PropertyValue", name: "Style", value: category } : null,
      orientation ? { "@type": "PropertyValue", name: "Orientation", value: orientation } : null,
      roomTypes.length > 0 ? { "@type": "PropertyValue", name: "Recommended rooms", value: roomTypes.join(", ") } : null,
      colorFamilies.length > 0 ? { "@type": "PropertyValue", name: "Color palette", value: colorFamilies.join(", ") } : null,
    ].filter(Boolean),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Artworks", path: "/artworks" },
            ...(category ? [{ name: category, path: `/artworks?category=${encodeURIComponent(category)}` }] : []),
            { name: title, path: `/artwork/${slug}` },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(artworkPageFaqs)) }}
      />
      <ArtworkViewTracker
        id={artwork._id}
        title={title}
        price={priceCny}
        currency={currency}
        value={offerPrice}
        category={category}
      />

      <main className="flex-1 bg-[#f7f5f0] pb-28 pt-[var(--ya-header-offset)] lg:pb-16 lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
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

          <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)] lg:gap-14">
            <div>
              <ProductGallery media={galleryMedia} alt={artworkImageAlt} />
            </div>

            <div className="space-y-6">
              <div className="lg:sticky lg:top-[calc(var(--ya-header-offset-lg)+0.75rem)] lg:z-10 lg:self-start">
              <ProductPurchasePanel
                product={storefrontProduct}
                directCheckoutAvailable={directCheckoutAvailable}
                invoiceUrl={invoiceUrl}
                whatsappUrl={whatsappUrl}
              />
              </div>

              <div className="border-t border-stone-200 pt-2">
                <div className="mb-3 text-sm text-stone-600">
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

                <ProductAccordion
                  defaultOpenId="about"
                  items={[
                    {
                      id: "about",
                      title: "About the Artwork",
                      content: (
                        <>
                          <p className="whitespace-pre-line">
                            {description || <TranslatedTemplate k="product.aboutFallback" values={{ title }} />}
                          </p>
                          <dl className={storefrontStyles.accordionFields}>
                            {category ? (
                              <div className={storefrontStyles.accordionField}>
                                <dt>Style</dt>
                                <dd><TranslatedOption value={category} /></dd>
                              </div>
                            ) : null}
                            {roomTypes.length > 0 ? (
                              <div className={storefrontStyles.accordionField}>
                                <dt>Subject / Rooms</dt>
                                <dd><TranslatedOptionList values={roomTypes} /></dd>
                              </div>
                            ) : null}
                            {medium ? (
                              <div className={storefrontStyles.accordionField}>
                                <dt>Mediums</dt>
                                <dd><TranslatedOption value={medium} /></dd>
                              </div>
                            ) : null}
                          </dl>
                        </>
                      ),
                    },
                    {
                      id: "details",
                      title: "Details and Customization",
                      content: (
                        <dl className={storefrontStyles.accordionFields}>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Availability</dt>
                            <dd>
                              {storefrontProduct.productionModel === "hand_painted_to_order"
                                ? "Made to order, 100% hand-painted by a studio artist"
                                : "Artist collection original"}
                            </dd>
                          </div>
                          {dimensions ? (
                            <div className={storefrontStyles.accordionField}>
                              <dt>Size</dt>
                              <dd>{dimensions}</dd>
                            </div>
                          ) : null}
                          {orientation ? (
                            <div className={storefrontStyles.accordionField}>
                              <dt>Orientation</dt>
                              <dd><TranslatedOption value={orientation} /></dd>
                            </div>
                          ) : null}
                          <div className={storefrontStyles.accordionField}>
                            <dt>Creation time</dt>
                            <dd>{storefrontProduct.creationWindow || "1-2 weeks"}</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Ready to hang</dt>
                            <dd>Yes, when stretched or framed options are selected</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Frame</dt>
                            <dd>{framingNotes || "Multiple frame finishes available"}</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Authenticity</dt>
                            <dd><TranslatedText k="product.detail.authenticityValue" /></dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Certificate</dt>
                            <dd><TranslatedText k="product.detail.certificateValue" /></dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Customization</dt>
                            <dd>Custom sizes and colour direction available on request</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Outdoor safe</dt>
                            <dd>No</dd>
                          </div>
                        </dl>
                      ),
                    },
                    {
                      id: "shipping",
                      title: "Shipping and Returns",
                      content: (
                        <dl className={storefrontStyles.accordionFields}>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Delivery cost</dt>
                            <dd>Shipping is included in price for most destinations*</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Delivery time</dt>
                            <dd>
                              {shippingProfile || "Typically 5-10 business days after dispatch"}
                            </dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Returns</dt>
                            <dd>30-day return policy for eligible works. See Shipping & Returns.</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Handling</dt>
                            <dd>
                              Rolled canvases ship in protective tubes. Stretched and framed works use reinforced cartons or crates by size.
                            </dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Carrier</dt>
                            <dd>DHL / UPS / FedEx depending on route</dd>
                          </div>
                          <div className={storefrontStyles.accordionField}>
                            <dt>Delivery area</dt>
                            <dd>Worldwide where carriers operate</dd>
                          </div>
                        </dl>
                      ),
                    },
                    {
                      id: "reviews",
                      title: "Reviews",
                      content: (
                        <>
                          {reviews[0] ? (
                            <blockquote className="border-l-2 border-stone-300 pl-4 italic text-stone-600">
                              &ldquo;{reviews[0].reviewText || reviews[0].reviewTitle}&rdquo;
                              <footer className="mt-2 not-italic text-sm text-stone-500">
                                — {reviews[0].customerName || "Collector"}
                              </footer>
                            </blockquote>
                          ) : (
                            <p>Collector reviews will appear here after purchase verification.</p>
                          )}
                          <p className="mt-3 text-sm">
                            <a href="#artwork-reviews" className="underline underline-offset-4">
                              Read all reviews
                            </a>
                          </p>
                        </>
                      ),
                    },
                  ]}
                />

                <div className="mt-6">
                  <SocialShare title={title} image={imageUrl} />
                </div>
                <ProductDisclosure productionModel={storefrontProduct.productionModel} />
              </div>
            </div>
          </div>

          <ProductRail
            title="Visually similar artworks"
            subtitle="Compare palette, texture, and scale before you decide."
            items={toProductCards(relatedArtworks.slice(0, 8))}
            viewAllHref="/artworks"
            viewAllLabel="View all artworks"
          />

          <ArtistSpotlight
            name={artistName}
            slug={artwork.artist?.slug?.current}
            bio={artistBio}
            location={artwork.artist?.location}
            imageUrl={artistImageUrl}
            artworks={toProductCards(artistArtworks)}
          />

          <ProductRail
            title="More to love"
            subtitle="Other hand-painted canvases collectors are browsing now."
            items={toProductCards(relatedArtworks.slice().reverse())}
            viewAllHref="/artworks?sort=newest"
            viewAllLabel="Browse more"
          />

          <div className={storefrontStyles.whyBlock} aria-label="Why YiiArt">
            {[
              {
                title: "Thoughtful reviews",
                text: "Clear guidance and careful packing on every order.",
              },
              {
                title: "Original hand-painted canvases",
                text: "Studio artists paint each piece to the size you choose.",
              },
              {
                title: "Satisfaction-minded shipping",
                text: "Ask questions before your canvas leaves the studio.",
              },
              {
                title: "Support working artists",
                text: "Fair studio collaboration on every made-to-order piece.",
              },
            ].map((item) => (
              <div key={item.title} className={storefrontStyles.whyItem}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className={storefrontStyles.advisoryBlock}>
            <strong>Complimentary art advisory</strong>
            <p className="m-0 text-sm leading-6 text-stone-600">
              Share a room photo and wall size. We will help confirm canvas scale, finish, and colour direction before production.
            </p>
            <Link href="/contact">Work with a curator</Link>
          </div>

          <section className="mt-10">
            <Link href="/art-in-real-homes" className="text-sm underline underline-offset-4">
              YiiArt in real homes - shop the look
            </Link>
          </section>

          <div id="artwork-reviews">
            <ArtworkReviewSection reviews={reviews} stats={reviewStats} />
          </div>

          <section className="mt-16 border-t border-stone-200 pt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-light">Questions before buying</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {artworkPageFaqs.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-stone-800">
                    {item.question}
                    <span className="text-stone-400 group-open:hidden">+</span>
                    <span className="hidden text-stone-400 group-open:inline">-</span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

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

function toProductCards(artworks: any[]) {
  return artworks.map((artwork) => {
    const images = getArtworkImageUrls(artwork, { width: 800 })
    return {
      id: artwork._id,
      href: `/artwork/${artwork.slug?.current || artwork._id}`,
      title: pickEnglish(artwork.title, "Untitled artwork"),
      priceCny: artwork.price,
      image: images[0] || null,
      hoverImage: images[1] || images[0] || null,
      sku: artwork.sku || artwork.slug?.current?.toUpperCase?.() || null,
    }
  })
}

function inferMaterial(medium: string) {
  if (/canvas/i.test(medium)) return "Canvas"
  if (/panel/i.test(medium)) return "Panel"
  return medium
}

function buildArtworkMetaDescription({
  title,
  artistName,
  category,
  medium,
  dimensions,
}: {
  title: string
  artistName: string
  category?: string
  medium?: string
  dimensions?: string
}) {
  const details = [category, medium, dimensions].filter(Boolean).join(", ")
  const prefix = details ? `${title} is an original ${details} artwork` : `${title} is an original handmade artwork`
  return `${prefix} by ${artistName}, selected for modern interiors with size guidance, worldwide shipping support, and custom canvas advice from YiiArt.`
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


function InfoBlock({ title, text }: { title: ReactNode; text: ReactNode }) {
  return (
    <div className="border-t border-stone-300 pt-5">
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      <p className="text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
