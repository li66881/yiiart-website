import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AddToCartButton from "@/components/AddToCartButton"
import { client, urlFor } from "@/lib/sanity"

async function getArtwork(slug: string) {
  return client.fetch(
    `*[_type == "artwork" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      artist->{_id, name},
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

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artwork = await getArtwork(slug)

  if (!artwork) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Artwork not found</h1>
          <Link href="/artworks" className="text-gray-500 hover:text-black">
            Back to artworks
          </Link>
        </div>
      </div>
    )
  }

  const title = artwork.title?.zh || artwork.title?.en || "Untitled artwork"
  const artistName = artwork.artist?.name?.zh || artwork.artist?.name?.en || "YiiArt artist"
  const imageUrl = artwork.images?.[0] ? urlFor(artwork.images[0]).width(1200).url() : ""
  const price = Number(artwork.price || 0)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.yiiart.com").replace(/\/$/, "")
  const currency = (process.env.STRIPE_CURRENCY || "cny").toUpperCase()
  const description = artwork.description?.zh || artwork.description?.en
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: imageUrl ? [imageUrl] : undefined,
    description,
    brand: {
      "@type": "Brand",
      name: "YiiArt",
    },
    category: artwork.category || "Artwork",
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/artwork/${slug}`,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
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
          <Link href="/artworks" className="text-gray-500 hover:text-black mb-8 inline-block">
            Back to artworks
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-4">
            <div>
              {imageUrl ? (
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}

              {artwork.images?.length > 1 && (
                <div className="flex gap-4 mt-4">
                  {artwork.images.slice(1).map((img: any, i: number) => (
                    <div key={i} className="w-24 h-24 bg-gray-100">
                      <img src={urlFor(img).width(200).url()} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                {[artwork.category, artwork.medium].filter(Boolean).join(" / ")}
              </p>
              <h1 className="text-4xl font-light mb-2">{title}</h1>
              <p className="text-xl text-gray-500 mb-6">{artistName}</p>
              <p className="text-3xl font-semibold mb-6">
                CNY {price.toLocaleString()}
              </p>

              <div className="space-y-3 text-gray-600 mb-8">
                {artwork.dimensions && <p>Dimensions: {artwork.dimensions}</p>}
                {artwork.medium && <p>Medium: {artwork.medium}</p>}
                {artwork.category && <p>Category: {artwork.category}</p>}
              </div>

              {description && (
                <div className="border-t pt-8">
                  <h2 className="text-lg font-medium mb-4">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">{description}</p>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <AddToCartButton
                  item={{
                    id: artwork._id,
                    title,
                    titleZh: artwork.title?.zh,
                    artist: artistName,
                    artistId: artwork.artist?._id,
                    price,
                    image: imageUrl,
                    size: artwork.dimensions,
                  }}
                />
                <Link
                  href="/contact"
                  className="block w-full py-4 border border-black text-center hover:bg-black hover:text-white transition"
                >
                  Contact artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
