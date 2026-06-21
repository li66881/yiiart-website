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
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <Link href="/artworks" className="mb-8 inline-block text-sm text-gray-500 hover:text-black">
              Back to artworks
            </Link>
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
              <div className="max-w-4xl">
                <p className="mb-3 text-sm uppercase tracking-wider text-stone-500">YiiArt collection</p>
                <h1 className="text-5xl font-light leading-tight md:text-6xl">{collection.title}</h1>
              </div>
              <div>
                <p className="max-w-2xl text-base leading-8 text-stone-600">{collection.intro}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="#available-works" className="bg-black px-6 py-4 text-center text-sm text-white transition hover:bg-stone-800">
                    Shop available works
                  </Link>
                  <Link href="/custom-painting" className="border border-stone-300 px-6 py-4 text-center text-sm transition hover:border-black">
                    Request custom canvas
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {collection.keywords.map((keyword) => (
                <span key={keyword} className="bg-white px-3 py-1 text-sm text-stone-600">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white py-8">
          <div className="mx-auto grid max-w-[1440px] gap-4 px-4 text-sm text-stone-600 sm:px-6 md:grid-cols-3 lg:px-10">
            {collection.rooms.map((room) => (
              <p key={room} className="border-l border-stone-300 pl-4">{room}</p>
            ))}
          </div>
        </section>

        <section className="border-b border-stone-200 py-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1fr] lg:px-10">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">How to choose</p>
              <h2 className="text-4xl font-light leading-tight">Choose by wall size, room mood, and surface presence.</h2>
              <p className="mt-5 text-sm leading-6 text-stone-600">{collection.sizeAdvice}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {collection.buyerGuide.map((item, index) => (
                <Info key={item} title={`0${index + 1}`} text={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-stone-950 py-14 text-white">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 md:grid-cols-[1fr_0.55fr] md:items-center lg:px-10">
            <div>
              <p className="mb-3 text-sm uppercase text-white/60">Need a specific size?</p>
              <h2 className="text-4xl font-light leading-tight">Custom canvas art for exact walls and interior palettes.</h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-white/70">{collection.customPrompt}</p>
            </div>
            <div className="grid gap-3">
              <Link href="/custom-painting" className="bg-white px-6 py-4 text-center text-sm text-black transition hover:bg-stone-100">
                Start custom painting
              </Link>
              <Link href="/size-guide" className="border border-white/35 px-6 py-4 text-center text-sm transition hover:bg-white hover:text-black">
                Read size guide
              </Link>
            </div>
          </div>
        </section>

        <section id="available-works" className="py-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
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

        <section className="border-y border-stone-200 bg-white py-12">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-10">
            <Info title="Original" text="No prints or editions in the main collection." />
            <Info title="Documented" text="Artist details and signed certificate included." />
            <Info title="Delivered" text="Tracked worldwide shipping with careful packaging." />
            <Info title="Supported" text="30-day return window after delivery." />
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1fr] lg:px-10">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Collection FAQ</p>
              <h2 className="text-4xl font-light leading-tight">Questions before choosing {collection.shortTitle}</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {collection.faqs.map((item) => (
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
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
