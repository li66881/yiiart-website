import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductGallery from "@/components/storefront/ProductGallery"
import ProductDisclosure from "@/components/storefront/ProductDisclosure"
import ProductDetailNavigation from "@/components/storefront/ProductDetailNavigation"
import ProductPurchasePanel from "@/components/storefront/ProductPurchasePanel"
import HomeProductCard from "@/components/home/HomeProductCard"
import SocialShare from "@/components/SocialShare"
import ArtworkViewTracker from "@/components/ArtworkViewTracker"
import ArtworkReviewSection from "@/components/ArtworkReviewSection"
import TranslatedText, { TranslatedOption } from "@/components/TranslatedText"
import { client } from "@/lib/sanity"
import {
  buildArtworkSeoTitle,
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  parseArtworkDimensionsCm,
  pickEnglish,
} from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls } from "@/lib/artwork-images"
import { buildProductGalleryMedia } from "@/lib/artwork-media"
import {
  convertCnyToStoreAmount,
  getStoreCurrency,
} from "@/lib/pricing"
import { buildStorefrontProduct } from "@/lib/storefront/product"
import { buildProductDetailCopy } from "@/lib/storefront/product-detail-copy"
import {
  buildProductDetailContentModel,
  productDetailStoryLayout,
} from "@/lib/storefront/product-detail-information"
import { isArtworkCheckoutAvailable } from "@/lib/checkout-availability"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"
import { getArtworkReviews, getReviewStats } from "@/lib/reviews"
import { getWhatsAppUrl } from "@/lib/site"
import {
  productAdviceItems,
  productPackagingItems,
} from "@/lib/storefront-content"
import storefrontStyles from "@/components/storefront/storefront.module.css"

export const revalidate = 600

async function getArtwork(slug: string) {
  try {
    return await client.fetch(
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && slug.current == $slug][0]{
        _id,
        title,
        slug,
        artist->{_id, name, slug, bio, location},
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

async function getRelatedArtworks(artworkId: string, category?: string | null, medium?: string | null) {
  try {
    return await client.fetch(
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && _id != $artworkId && (
        (defined($category) && category == $category) ||
        (defined($medium) && medium == $medium)
      )] | order(featured desc, _createdAt desc)[0...4]{
        _id,
        title,
        slug,
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
  const artworkStory = pickEnglish(artwork.artworkStory)
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
  const editorialMedia = galleryMedia.find((media) =>
    media.type === "image"
      && ["detail", "living_room", "bedroom", "dining_room"].includes(media.role)
  )
  const storyLayout = productDetailStoryLayout(Boolean(editorialMedia))
  const detailContent = buildProductDetailContentModel({ framingNotes, adviceItems: productAdviceItems })
  const storefrontProduct = buildStorefrontProduct(
    artwork,
    galleryImages.map((src: string, index: number) => ({
      src,
      alt: index === 0 ? artworkImageAlt : `${artworkImageAlt}, detail view ${index + 1}`,
      width: 1400,
      height: 1750,
      kind: index === 0 ? "artwork" as const : "detail" as const,
    })),
  )
  const detailCopy = buildProductDetailCopy({
    creationWindow: storefrontProduct.creationWindow,
    shippingProfile,
  })
  const priceCny = storefrontProduct.sizes[0]?.priceCny || Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const directCheckoutAvailable = storefrontProduct.sizes.length > 0 && isArtworkCheckoutAvailable(artwork)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const reviews = await getArtworkReviews(artwork._id)
  const reviewStats = getReviewStats(reviews)
  const relatedArtworks = await getRelatedArtworks(artwork._id, artwork.category, artwork.medium)
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
      <ArtworkViewTracker
        id={artwork._id}
        title={title}
        price={priceCny}
        currency={currency}
        value={offerPrice}
        category={category}
      />

      <main className="optimized-product-page flex-1 pb-28 pt-[var(--yiiart-header-offset)] lg:pb-20">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-2 flex flex-wrap items-center gap-2 text-xs text-stone-500" aria-label="Breadcrumb">
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

          <div className={storefrontStyles.mesonProductLayout}>
            <div>
              <ProductGallery media={galleryMedia} alt={artworkImageAlt} />
            </div>

            <div className="lg:sticky lg:top-[calc(var(--yiiart-header-offset)+18px)] lg:self-start">
              <ProductPurchasePanel
                product={storefrontProduct}
                directCheckoutAvailable={directCheckoutAvailable}
                invoiceUrl={invoiceUrl}
                whatsappUrl={whatsappUrl}
              />
            </div>
          </div>

          <ProductDetailNavigation />

          <div className={storefrontStyles.productDetailSections}>
            <section id="about-artwork" className={storefrontStyles.productDetailSection}>
              <div className={`${storefrontStyles.productDetailStoryGrid} ${
                storyLayout === "text-only" ? storefrontStyles.productDetailStoryGridTextOnly : ""
              }`}>
                <div className={storefrontStyles.productDetailReadingColumn}>
                  <p className={storefrontStyles.productDetailEyebrow}>Artwork story</p>
                  <h2>About the artwork</h2>
                  <p className="whitespace-pre-line">
                    {description || `${title} is a physical hand-painted artwork by ${artistName}.`}
                  </p>
                  {artworkStory && artworkStory !== description && (
                    <p className="whitespace-pre-line">{artworkStory}</p>
                  )}
                  <ProductDisclosure productionModel={storefrontProduct.productionModel} />
                  <div className={storefrontStyles.productDetailShare}>
                    <SocialShare title={title} image={imageUrl} />
                  </div>
                </div>

                {editorialMedia && (
                  <figure className={storefrontStyles.productDetailFeatureImage}>
                    <Image
                      src={editorialMedia.url}
                      alt={editorialMedia.alt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 50vw"
                    />
                  </figure>
                )}
              </div>
            </section>

            <section id="details-customization" className={storefrontStyles.productDetailSection}>
              <div className={storefrontStyles.productDetailSectionHeading}>
                <p className={storefrontStyles.productDetailEyebrow}>Specifications and room fit</p>
                <h2>Details &amp; customization</h2>
                <p>
                  Review the listed materials, scale, and presentation notes, then ask for room-specific advice before ordering.
                </p>
              </div>

              <ArtworkDetails
                dimensions={dimensions}
                medium={medium}
                category={category}
                orientation={orientation}
                roomTypes={roomTypes}
                colorFamilies={colorFamilies}
                surfaceFinish={surfaceFinish}
              />

              <div className={storefrontStyles.productDetailSplit}>
                <div>
                  <h3>Scale and placement</h3>
                  <p>
                    Use the guide as a starting point. A wall measurement and room photo provide better context for exact placement advice.
                  </p>
                  <Link href="/size-guide" className={storefrontStyles.productDetailTextLink}>
                    Read full size guide
                  </Link>
                </div>
                <ScaleGuidance dimensions={artwork.dimensions} roomTypes={roomTypes} title={title} />
              </div>

              <div className={storefrontStyles.productDetailSplit}>
                <div>
                  <p className={storefrontStyles.productDetailEyebrow}>Presentation</p>
                  <h3>Choose the finish that suits your room</h3>
                  <p>
                    Available rolled, stretched, and framed choices appear in the purchase panel. Options vary by artwork and size; the selected presentation is confirmed with the order.
                  </p>
                  {detailContent.presentationNote && <p>{detailContent.presentationNote}</p>}
                </div>
                <div>
                  <p className={storefrontStyles.productDetailEyebrow}>Customization</p>
                  <h3>Need a custom size, palette, or orientation?</h3>
                  <p>
                    Send your wall width, ceiling height, room photo, and preferred palette. YiiArt can confirm whether this listing fits or a custom painting is the better path.
                  </p>
                  <Link
                    href={`/custom-painting?artwork=${encodeURIComponent(slug)}`}
                    className="yii-btn-primary mt-6"
                  >
                    Request Custom Painting
                  </Link>
                </div>
              </div>

              <div className={storefrontStyles.productDetailCards}>
                {detailContent.supplementalAdvice.map((item) => (
                  <InfoBlock
                    key={item.title}
                    title={<TranslatedText k={`product.advice.${item.translationIndex}.title`} fallback={item.title} />}
                    text={<TranslatedText k={`product.advice.${item.translationIndex}.text`} fallback={item.text} />}
                  />
                ))}
              </div>
            </section>

            <section id="shipping-returns" className={storefrontStyles.productDetailSection}>
              <div className={storefrontStyles.productDetailSectionHeading}>
                <p className={storefrontStyles.productDetailEyebrow}>Order guidance and support</p>
                <h2>Shipping &amp; returns</h2>
                <p>
                  Production and delivery are separate stages. Timing and format depend on the artwork, finish, destination, and carrier route.
                </p>
              </div>

              <div className={storefrontStyles.productDetailCards}>
                <InfoBlock title="Production guidance" text={detailCopy.processingTime} />
                <InfoBlock title="Dispatch" text={detailCopy.dispatch} />
                <InfoBlock title="Tracking" text="Tracking information is shared when the selected carrier service provides it." />
                <InfoBlock title="Returns" text="Standard and custom orders may have different conditions; contact YiiArt with the order details before returning artwork." />
                {productPackagingItems.map((item) => (
                  <InfoBlock key={item.title} title={item.title} text={item.text} />
                ))}
              </div>

              <div className={storefrontStyles.productDetailPolicyLinks}>
                <Link href="/shipping-returns">Shipping &amp; Returns overview</Link>
                <Link href="/shipping">Complete shipping policy</Link>
                <Link href="/returns">Complete returns policy</Link>
              </div>
            </section>

            <div id="reviews" className={storefrontStyles.productDetailReviewsTarget}>
              <ArtworkReviewSection reviews={reviews} stats={reviewStats} />
            </div>
          </div>

          <section className="mt-16 border-t border-stone-200 pt-12">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-sm uppercase text-stone-500">You may also like</p>
                <h2 className="text-3xl font-light">Related products</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                  Compare works with a similar style or medium before deciding on size, palette, and room fit.
                </p>
              </div>
              <Link href="/artworks" className="text-sm underline underline-offset-4">View all artworks</Link>
            </div>
            {relatedArtworks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {relatedArtworks.map((related: any) => (
                  <HomeProductCard key={related._id} artwork={related} />
                ))}
              </div>
            ) : (
              <p className="border-y border-stone-200 py-12 text-center text-stone-500">
                No similar artworks are available for comparison right now.
              </p>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function ArtworkDetails({
  dimensions,
  medium,
  category,
  orientation,
  roomTypes,
  colorFamilies,
  surfaceFinish,
}: {
  dimensions?: string
  medium?: string
  category?: string
  orientation?: string
  roomTypes: string[]
  colorFamilies: string[]
  surfaceFinish?: string
}) {
  const rows = [
    dimensions ? { label: "Dimensions", value: dimensions } : null,
    medium ? { label: "Material", value: inferMaterial(medium) } : null,
    medium ? { label: "Medium", value: medium } : null,
    category ? { label: "Style", value: category } : null,
    orientation ? { label: "Orientation", value: orientation } : null,
    roomTypes.length > 0 ? { label: "Recommended rooms", value: roomTypes.join(", ") } : null,
    colorFamilies.length > 0 ? { label: "Color palette", value: colorFamilies.join(", ") } : null,
    { label: "Handmade note", value: "Physical hand-painted artwork, not a printed reproduction." },
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
  return parseArtworkDimensionsCm(dimensions)
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
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
