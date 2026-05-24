import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AddToCartButton from "@/components/AddToCartButton"
import SocialShare from "@/components/SocialShare"
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
  formatStorePrice,
  getPriceDisclosure,
  getStoreCurrency,
} from "@/lib/pricing"

export const dynamic = "force-dynamic"

async function getArtwork(slug: string) {
  return client.fetch(
    `*[_type == "artwork" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      artist->{_id, name, slug, bio, location},
      price,
      dimensions,
      medium,
      category,
      images,
      description
    }`,
    { slug }
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtwork(slug)
  if (!artwork) {
    return { title: "Artwork not found" }
  }
  const title = buildArtworkSeoTitle(artwork)
  const description = pickEnglish(artwork.description, "Original artwork on YiiArt")
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
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
  const imageUrl = artwork.images?.[0] ? urlFor(artwork.images[0]).width(1400).url() : ""
  const priceCny = Number(artwork.price || 0)
  const currency = getStoreCurrency()
  const offerPrice = convertCnyToStoreAmount(priceCny, currency)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: buildArtworkSeoTitle(artwork),
    image: imageUrl ? [imageUrl] : undefined,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 py-12">
          <Link href="/artworks" className="mb-8 inline-block text-gray-500 hover:text-black">
            Back to artworks
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
              <p className="mb-2 text-3xl font-semibold">{formatStorePrice(priceCny)}</p>
              <p className="mb-6 text-xs text-gray-500">{getPriceDisclosure(currency)}</p>

              <div className="mb-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                {dimensions && <Detail label="Size" value={dimensions} />}
                {medium && <Detail label="Medium" value={medium} />}
                {category && <Detail label="Style" value={category} />}
                <Detail label="Authenticity" value="Original, one-of-a-kind" />
                <Detail label="Certificate" value="Signed certificate included" />
                <Detail label="Dispatch" value="Ships in 5-7 business days" />
              </div>

              <div className="space-y-6 border-t pt-8">
                <section>
                  <h2 className="mb-3 text-lg font-medium">About this artwork</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {description || `${title} is selected for modern interiors and private collections. It is hand-painted, carefully documented, and prepared for secure international delivery.`}
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-medium">Collector notes</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>Best for living rooms, bedrooms, hallways, offices, and quiet statement walls.</li>
                    <li>Protective packaging is used for international shipping; larger works may ship rolled when safer.</li>
                    <li>Contact us before purchase if you need framing advice or a room-size recommendation.</li>
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
                <Link
                  href="/contact"
                  className="block w-full border border-black py-4 text-center transition hover:bg-black hover:text-white"
                >
                  Ask a question
                </Link>
                <SocialShare title={title} image={imageUrl} />
              </div>
            </div>
          </div>

          <section className="mt-16 grid gap-6 border-t pt-12 md:grid-cols-3">
            <InfoBlock title="Packaging" text="Each artwork is protected with layered packaging. We confirm the safest shipping format before dispatch." />
            <InfoBlock title="Returns" text="You have 30 days after delivery to request a return. Damaged shipments are handled as priority support cases." />
            <InfoBlock title="Authenticity" text="Original works include YiiArt documentation and the artist details available on the artwork page." />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
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
