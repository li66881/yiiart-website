import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import SocialShare from "@/components/SocialShare"
import ArtworkViewTracker from "@/components/ArtworkViewTracker"
import TranslatedText, { TranslatedOption } from "@/components/TranslatedText"
import ArtworkHeroGallery from "@/features/artwork-detail/ArtworkHeroGallery"
import ArtworkMaterialStory from "@/features/artwork-detail/ArtworkMaterialStory"
import ArtworkPurchaseExperience from "@/features/artwork-detail/ArtworkPurchaseExperience"
import ArtworkSupportingSections, {
  artworkPageFaqs,
  inferArtworkMaterial,
} from "@/features/artwork-detail/ArtworkSupportingSections"
import { normalizePresentationOptions } from "@/features/artwork-detail/model"
import { getArtworkDetailPreview, isArtworkPreviewDisabled } from "@/features/artwork-detail/preview"
import { client } from "@/lib/sanity"
import {
  buildArtworkSeoTitle,
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "@/lib/artwork-display"
import {
  getArtworkGalleryItems,
  getArtworkImageUrl,
  getArtworkImageUrls,
} from "@/lib/artwork-images"
import { convertCnyToStoreAmount, getStoreCurrency } from "@/lib/pricing"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"
import { getArtworkReviews, getReviewStats } from "@/lib/reviews"
import { getWhatsAppUrl } from "@/lib/site"

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
        widthCm,
        heightCm,
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
        galleryAssets[]{role, alt, url, image},
        presentationOptions,
        cloudflareImages,
        images,
        description
      }`,
      { slug },
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
        widthCm,
        heightCm,
        medium,
        category,
        cloudflareImages,
        images
      }`,
      { artworkId, category: category || null, medium: medium || null },
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
  const description = pickEnglish(artwork.description) || buildArtworkMetaDescription({
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

export default async function ArtworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ productPreview?: string }>
}) {
  const { slug } = await params
  const artwork = await getArtwork(slug)

  if (!artwork) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="mb-4 text-2xl"><TranslatedText k="product.notFound" /></h1>
            <Link href="/artworks" className="text-gray-500 hover:text-black"><TranslatedText k="product.backToArtworks" /></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const { productPreview } = searchParams ? await searchParams : {}
  const preview = getArtworkDetailPreview(
    productPreview,
    isArtworkPreviewDisabled(
      process.env.NODE_ENV === "production",
      process.env.YIIART_ENABLE_LOCAL_PREVIEW,
    ),
  )
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
  const productionGalleryItems = getArtworkGalleryItems(artwork, { width: 1600 }, title)
  const galleryItems = preview?.gallery || productionGalleryItems
  const productionImages = getArtworkImageUrls(artwork, { width: 1400 })
  const imageUrl = productionImages[0] || ""
  const visibleTitle = preview?.title || title
  const visibleArtistName = preview?.artistName || artistName
  const visibleDescription = preview?.description || description
  const visibleDimensions = preview?.dimensions || dimensions
  const visibleCategory = preview?.category || category
  const visibleMedium = preview?.medium || medium
  const presentationOptions = preview?.presentationOptions || normalizePresentationOptions(artwork.presentationOptions)
  const priceCny = Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const directCheckoutAvailable = priceCny > 0 && isArtworkDirectCheckoutAvailable(artwork)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const reviews = await getArtworkReviews(artwork._id)
  const reviewStats = getReviewStats(reviews)
  const relatedArtworks = await getRelatedArtworks(artwork._id, artwork.category, artwork.medium)
  const whatsappUrl = getWhatsAppUrl(`Hello YiiArt, I am interested in ${visibleTitle}. Can you advise on size, framing, and shipping?`)
  const customRequestUrl = getWhatsAppUrl(`Hello YiiArt, I need a custom size or color palette based on ${title}. Can I share my wall size and room photo?`)
  const invoiceUrl = getWhatsAppUrl(`Hello YiiArt, I would like to confirm availability and request an invoice for ${title}.`)
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
      shippingRate: { "@type": "MonetaryAmount", value: "0", currency },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: ["US", "CA", "GB", "DE", "FR", "AU"] },
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
  if (priceCny > 0) offer.price = offerPrice.toFixed(2)

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: buildArtworkSeoTitle(artwork),
    image: productionImages.slice(0, 10),
    description: description || `${title} is an original hand-painted artwork by ${artistName}.`,
    brand: { "@type": "Brand", name: "YiiArt" },
    category: category || "Original artwork",
    material: medium ? inferArtworkMaterial(medium) : undefined,
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
    productJsonLd.aggregateRating = { "@type": "AggregateRating", ratingValue: reviewStats.overall.toFixed(1), reviewCount: reviewStats.count }
    productJsonLd.review = reviews.map((review) => ({
      "@type": "Review",
      name: review.reviewTitle,
      reviewBody: review.reviewText,
      datePublished: review.approvedAt || review.submittedAt,
      author: { "@type": "Person", name: review.customerName || "Verified Collector" },
      reviewRating: { "@type": "Rating", ratingValue: review.overallRating, bestRating: 5, worstRating: 1 },
    }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-[#181613]">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Artworks", path: "/artworks" },
        ...(category ? [{ name: category, path: `/artworks?category=${encodeURIComponent(category)}` }] : []),
        { name: title, path: `/artwork/${slug}` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(artworkPageFaqs)) }} />
      {!preview && <ArtworkViewTracker id={artwork._id} title={title} price={priceCny} currency={currency} value={offerPrice} category={category} />}

      <main className="flex-1 pb-32 pt-24 lg:pb-16">
        <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-10">
          <nav className="sr-only" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#181613]"><TranslatedText k="common.home" /></Link>
            <span>/</span>
            <Link href="/artworks" className="hover:text-[#181613]"><TranslatedText k="common.artworks" /></Link>
            {category && <><span>/</span><Link href={`/artworks?category=${category}`} className="hover:text-[#181613]"><TranslatedOption value={category} /></Link></>}
            <span>/</span>
            <span className="text-[#181613]">{title}</span>
          </nav>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(380px,0.95fr)] lg:gap-10">
            <ArtworkHeroGallery items={galleryItems} />
            <ArtworkPurchaseExperience
              eyebrow={[visibleCategory, visibleMedium].filter(Boolean).join(" / ")}
              title={visibleTitle}
              artistName={visibleArtistName}
              description={visibleDescription}
              dimensions={visibleDimensions}
              priceCny={priceCny}
              displayPriceOverride={preview?.displayPrice}
              reviewCount={preview ? 0 : reviewStats.count}
              reviewOverall={preview ? 0 : reviewStats.overall}
              presentationOptions={presentationOptions}
              presentationFallbackText={framingNotes}
              baseCartItem={cartItem}
              directCheckoutAvailable={!preview && directCheckoutAvailable}
              invoiceUrl={invoiceUrl}
              whatsappUrl={whatsappUrl}
              previewMode={Boolean(preview)}
            />
          </div>

          <ArtworkMaterialStory items={galleryItems} heading={<TranslatedText k="product.materialStory" fallback="Made by hand, understood in the room." />} />
          <div className="flex justify-end border-b border-[#ded8ce] pb-8"><SocialShare title={visibleTitle} image={galleryItems[0]?.url || imageUrl} /></div>
          <ArtworkSupportingSections
            title={title}
            medium={medium}
            surfaceFinish={surfaceFinish}
            framingNotes={framingNotes}
            shippingProfile={shippingProfile}
            dimensionsSource={artwork.dimensions}
            roomTypes={roomTypes}
            customRequestUrl={customRequestUrl}
            relatedArtworks={relatedArtworks}
            reviews={reviews}
            reviewStats={reviewStats}
          />
        </div>
      </main>
      <Footer />
      <div className="h-24 bg-stone-950 lg:hidden" aria-hidden="true" />
    </div>
  )
}

function buildArtworkMetaDescription({ title, artistName, category, medium, dimensions }: { title: string; artistName: string; category?: string; medium?: string; dimensions?: string }) {
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

function isArtworkDirectCheckoutAvailable(artwork: { availability?: "available" | "reserved" | "sold" | string; allowCheckout?: boolean; reservedUntil?: string | null }) {
  if (artwork.allowCheckout === false || artwork.availability === "sold") return false
  if (artwork.availability === "reserved") {
    if (!artwork.reservedUntil) return false
    return new Date(artwork.reservedUntil).getTime() < Date.now()
  }
  return true
}

function getSchemaAvailability(artwork: { availability?: "available" | "reserved" | "sold" | string }, directCheckoutAvailable: boolean) {
  if (artwork.availability === "sold") return "https://schema.org/SoldOut"
  if (directCheckoutAvailable) return "https://schema.org/InStock"
  return "https://schema.org/LimitedAvailability"
}
