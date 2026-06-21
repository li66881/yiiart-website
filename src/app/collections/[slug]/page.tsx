import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { client } from "@/lib/sanity"
import { getMarketingCollection } from "@/lib/collections"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"
import { buildArtworkDiscoveryItem, inferArtworkSize } from "@/lib/artwork-discovery"

export const revalidate = 600

async function getCollectionArtworks(slug: string) {
  const collection = getMarketingCollection(slug)
  if (!collection) return []

  let artworks: any[] = []

  try {
    artworks = collection.categories?.length
      ? await client.fetch(
          `*[_type == "artwork" && category in $categories] | order(featured desc, _createdAt desc)[0...24]{
            ...,
            artist->{name}
          }`,
          { categories: collection.categories }
        )
      : await client.fetch(`*[_type == "artwork"] | order(featured desc, _createdAt desc)[0...30]{
          ...,
          artist->{name}
        }`)
  } catch {
    return []
  }

  if (slug !== "large-canvas-art") return artworks

  const largeArtworks = artworks.filter((artwork: any) => inferArtworkSize(artwork.dimensions) === "Large" || inferArtworkSize(artwork.dimensions) === "Oversized")
  return largeArtworks.length > 0 ? largeArtworks : artworks.slice(0, 12)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getMarketingCollection(slug)

  if (!collection) {
    return buildSeoMetadata({
      title: "Collection Not Found",
      description: "This YiiArt collection could not be found.",
      path: `/collections/${slug}`,
      robots: { index: false, follow: true },
    })
  }

  const artworks = await getCollectionArtworks(slug)
  const artworkWithImage = artworks.find(hasArtworkImage)
  const image = getArtworkImageUrl(artworkWithImage, { width: 1200, height: 630 })

  return buildSeoMetadata({
    title: collection.title,
    description: collection.description,
    path: `/collections/${slug}`,
    image,
    imageAlt: artworkWithImage ? pickEnglish(artworkWithImage.title, collection.title) : collection.title,
  })
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getMarketingCollection(slug)
  if (!collection) notFound()

  const artworks = await getCollectionArtworks(slug)
  const artworkItems = artworks.map((artwork: any) => {
    const imageUrl = getArtworkImageUrl(artwork, { width: 700 })
    return buildArtworkDiscoveryItem(artwork, imageUrl)
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="border-b py-14">
          <div className="container mx-auto px-4">
            <Link href="/artworks" className="mb-8 inline-block text-sm text-gray-500 hover:text-black">
              Back to artworks
            </Link>
            <div className="max-w-4xl">
              <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">YiiArt collection</p>
              <h1 className="text-4xl font-light leading-tight md:text-5xl">{collection.title}</h1>
              <p className="mt-5 max-w-2xl text-gray-600">{collection.intro}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {collection.keywords.map((keyword) => (
                <span key={keyword} className="bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-8">
          <div className="container mx-auto grid gap-4 px-4 text-sm text-gray-600 md:grid-cols-3">
            {collection.rooms.map((room) => (
              <p key={room}>{room}</p>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-light">Available works</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Each piece is original, documented, and prepared for tracked international delivery.
                </p>
              </div>
              <Link href="/contact" className="text-sm underline underline-offset-4">
                Request room advice
              </Link>
            </div>

            <ArtworkDiscoveryGrid
              items={artworkItems}
              emptyText="New works for this collection are being prepared."
            />
          </div>
        </section>

        <section className="border-t bg-gray-50 py-12">
          <div className="container mx-auto grid gap-6 px-4 md:grid-cols-4">
            <Info title="Original" text="No prints or editions in the main collection." />
            <Info title="Documented" text="Artist details and signed certificate included." />
            <Info title="Delivered" text="Tracked worldwide shipping with careful packaging." />
            <Info title="Supported" text="30-day return window after delivery." />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  )
}
