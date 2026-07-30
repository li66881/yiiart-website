import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { client } from "@/lib/sanity"
import { getMarketingCollection } from "@/lib/collections"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls, hasArtworkImage } from "@/lib/artwork-images"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"
import { buildArtworkDiscoveryItem, inferArtworkSize } from "@/lib/artwork-discovery"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"

export const revalidate = 600

const internalCollectionLinks = [
  { title: "Abstract Paintings", href: "/artworks?category=Abstract" },
  { title: "Large Wall Art", href: "/collections/large-canvas-art" },
  { title: "Textured Wall Art", href: "/collections/textured-wall-art" },
  { title: "Neutral Wall Art", href: "/collections/neutral-canvas-art" },
  { title: "Living Room Art", href: "/collections/abstract-art-for-living-room" },
  { title: "Custom Paintings", href: "/custom-painting" },
]

async function getCollectionArtworks(slug: string) {
  const collection = getMarketingCollection(slug)
  if (!collection) return []

  let artworks: any[] = []

  try {
    artworks = collection.categories?.length
      ? await client.fetch(
          `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && category in $categories] | order(featured desc, _createdAt desc)[0...24]{
            ...,
            artist->{name}
          }`,
          { categories: collection.categories }
        )
      : await client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc)[0...30]{
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
  const description = buildCollectionMetaDescription(collection)

  return buildSeoMetadata({
    title: `${collection.title} for Modern Interiors`,
    description,
    path: `/collections/${slug}`,
    image,
    imageAlt: artworkWithImage ? `${pickEnglish(artworkWithImage.title, collection.title)} from ${collection.title}` : collection.title,
  })
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getMarketingCollection(slug)
  if (!collection) notFound()

  const artworks = await getCollectionArtworks(slug)
  const heroCopy = buildCollectionHeroCopy(collection)
  const artworkItems = artworks.map((artwork: any) => {
    const images = getArtworkImageUrls(artwork, { width: 700 })
    return buildArtworkDiscoveryItem(artwork, images[0], images[1] || images[0])
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Artworks", path: "/artworks" },
            { name: collection.title, path: `/collections/${slug}` },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(collection.faqs)) }}
      />
      <main className="flex-1 bg-[#f7f5f0] pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="-mx-4 mb-8 bg-[#d8d9c4] px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <p className="mb-2 text-xs text-stone-600">Home / Collections / {collection.title}</p>
            <h1 className="mb-3 text-4xl font-medium tracking-[-0.03em] text-stone-950 md:text-5xl">
              {collection.title}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-700 md:text-base md:leading-7">
              {heroCopy}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#available-works"
                className="inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm text-white"
              >
                Shop available works
              </Link>
              <Link
                href="/custom-painting"
                className="inline-flex min-h-11 items-center rounded-full border border-stone-800 bg-transparent px-5 text-sm"
              >
                Request custom canvas
              </Link>
            </div>
          </div>

          <section className="mb-8 pb-2">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Discover</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Related paths</h2>
              </div>
            </div>
            <div className="flex snap-x gap-5 overflow-x-auto pb-2">
              {internalCollectionLinks.map((item, index) => {
                const image = artworkItems[index % Math.max(artworkItems.length, 1)]?.imageUrl
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex w-[92px] shrink-0 snap-start flex-col items-center gap-2 text-center"
                  >
                    <span className="relative block h-[92px] w-[92px] overflow-hidden rounded-full border border-stone-300 bg-[#ebe6dc]">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-medium text-stone-700">
                          {item.title.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="text-xs leading-snug text-stone-700">{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          <section id="available-works" className="pb-16">
            <ArtworkDiscoveryGrid
              items={artworkItems}
              emptyText="No works match this collection right now."
            />
          </section>

          <section className="border-y border-stone-200 bg-white py-12">
            <div className="grid gap-6 md:grid-cols-4">
              <Info title="Original" text="No prints or editions in the main collection." />
              <Info title="Documented" text="Artist details and signed certificate included." />
              <Info title="Delivered" text="Tracked worldwide shipping with careful packaging." />
              <Info title="Supported" text="30-day return window after delivery." />
            </div>
          </section>

          <section className="py-16">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
              <div>
                <p className="mb-3 text-sm uppercase text-stone-500">Collection FAQ</p>
                <h2 className="text-3xl font-medium leading-tight tracking-[-0.03em]">
                  Questions before choosing {collection.shortTitle}
                </h2>
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
        </div>
      </main>
      <Footer />
    </div>
  )
}

function buildCollectionHeroCopy(collection: {
  title: string
  intro?: string
  description?: string
  sizeAdvice?: string
  customPrompt?: string
  rooms?: string[]
}) {
  const rooms = collection.rooms?.length ? collection.rooms.join(", ") : "living rooms, bedrooms, offices, and modern interiors"
  const base = [
    collection.intro || collection.description || `Explore ${collection.title} selected for modern interiors and original canvas art collectors.`,
    collection.sizeAdvice || "Start with wall width, furniture scale, viewing distance, and the mood of the room before choosing a painting.",
    `This collection is useful for ${rooms}, with attention to scale, surface, palette, and how the artwork will feel in daily use.`,
    "Use the filters below to compare room fit, color family, size, and orientation without changing the collection URL.",
    "Each product card leads to a detailed artwork page with dimensions, material notes, shipping guidance, and custom request options when you need a closer match.",
    collection.customPrompt || "If a listed work is close but not exact, YiiArt can discuss a custom canvas based on your wall measurements and room photos.",
  ].join(" ")

  return trimWords(base, 180)
}

function buildCollectionMetaDescription(collection: {
  description: string
  rooms?: string[]
}) {
  const base = collection.description.replace(/\.$/, "")
  const rooms = collection.rooms?.length ? ` for ${collection.rooms.slice(0, 2).join(" and ")}` : ""
  return `${base}${rooms}. Compare handmade paintings by size, room fit, palette, and custom canvas options.`
}

function trimWords(text: string, maxWords: number) {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return `${words.slice(0, maxWords).join(" ")}.`
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
