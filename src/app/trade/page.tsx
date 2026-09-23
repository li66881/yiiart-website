import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { client } from "@/lib/sanity"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

export const revalidate = 600

export const metadata = buildSeoMetadata({
  title: "Art for Interior Designers | Project Artwork Enquiries",
  description:
    "Explore hand-painted artwork for interior design projects. Discuss coordinated selections, custom sizes, palettes, and a project quote with YiiArt.",
  path: "/trade",
})

type TradeArtwork = {
  _id: string
  title?: string | { en?: string; zh?: string }
  slug?: { current?: string }
  productMedia?: unknown
  cloudflareImages?: unknown
  images?: unknown
}

const selectedSlugs = [
  "orange-grove-elephant",
  "electric-pink-meadow",
  "white-peony-relief",
  "pastel-meadow",
  "walled-garden",
]

async function getSelectedArtworks(): Promise<TradeArtwork[]> {
  try {
    const artworks = await client.fetch<TradeArtwork[]>(
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && slug.current in $slugs]{
        _id, title, slug, productMedia, cloudflareImages, images
      }`,
      { slugs: selectedSlugs },
    )
    return artworks
      .filter((artwork) => artwork.slug?.current && getArtworkImageUrl(artwork, { width: 900 }))
      .sort((a, b) => selectedSlugs.indexOf(a.slug!.current!) - selectedSlugs.indexOf(b.slug!.current!))
  } catch {
    return []
  }
}

const process = [
  ["01", "Share the project", "Tell us about the space, artwork quantity, destination, timing, and the look you are planning."],
  ["02", "Review a selection", "We discuss suitable listed works, possible sizes and palette changes, and the scope of a proposal."],
  ["03", "Confirm a quote", "Artwork specifications, pricing, sampling if needed, and production timing are confirmed for your project."],
  ["04", "Approve and produce", "Production starts after the agreed specifications and payment terms are confirmed. Delivery is planned by destination."],
] as const

export default async function TradePage() {
  const artworks = await getSelectedArtworks()

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "For Designers", path: "/trade" },
        ])) }}
      />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">YiiArt for designers</p>
              <h1 className="max-w-4xl font-serif text-5xl font-normal leading-[1.08] tracking-tight sm:text-6xl">
                Hand-painted art for the spaces you design.
              </h1>
            </div>
            <div>
              <p className="max-w-xl text-lg leading-8 text-stone-600">
                Explore artwork, discuss a coordinated selection, and plan custom sizes or color directions for your next project. We confirm each project’s scope and quote before production.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/custom-painting?intent=project" className="inline-flex bg-stone-950 px-6 py-4 text-sm font-medium text-white hover:bg-stone-800">
                  Discuss your project
                </Link>
                <Link href={artworks.length > 0 ? "#selected-art" : "/artworks"} className="inline-flex border border-stone-400 px-6 py-4 text-sm font-medium hover:border-stone-950">
                  Explore artwork
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Project support</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Artwork that fits the brief</h2>
              <p className="mt-4 leading-7 text-stone-600">Start with an existing composition or share the dimensions and palette your space calls for. Available options are confirmed for each artwork and project.</p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div className="border-t border-stone-300 pt-5"><h3 className="text-lg font-medium">Curated selections</h3><p className="mt-3 leading-7 text-stone-600">Review pieces together by scale, color, and visual rhythm across a room or a small set of spaces.</p></div>
              <div className="border-t border-stone-300 pt-5"><h3 className="text-lg font-medium">Custom size and palette</h3><p className="mt-3 leading-7 text-stone-600">Ask about changes to the size, orientation, color direction, and presentation of a listed work.</p></div>
              <div className="border-t border-stone-300 pt-5"><h3 className="text-lg font-medium">Project quoting</h3><p className="mt-3 leading-7 text-stone-600">Share the quantity, delivery destination, and timing so we can confirm the feasible specifications and a quote.</p></div>
            </div>
          </div>
        </section>

        {artworks.length > 0 && (
          <section id="selected-art" className="border-b border-stone-200 px-4 py-16 scroll-mt-28 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1440px]">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Start a selection</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Selected artwork</h2></div>
                <Link href="/artworks" className="text-sm underline underline-offset-4">Browse all artwork</Link>
              </div>
              <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {artworks.map((artwork) => {
                  const slug = artwork.slug!.current!
                  const image = getArtworkImageUrl(artwork, { width: 900, height: 1100 })
                  const title = pickEnglish(artwork.title, "YiiArt artwork")
                  return (
                    <article key={artwork._id} className="min-w-0">
                      <Link href={`/artwork/${slug}`} className="block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                          {image && <Image src={image} alt={title} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />}
                        </div>
                        <h3 className="mt-4 text-lg">{title}</h3>
                      </Link>
                      <Link href={`/custom-painting?intent=project&artwork=${encodeURIComponent(slug)}`} className="mt-2 inline-flex text-sm underline underline-offset-4">Ask about this work for a project</Link>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">How a project begins</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">From brief to finished work</h2>
            <div className="mt-9 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
              {process.map(([number, title, description]) => (
                <div key={number} className="border-t border-stone-300 pt-5"><p className="text-sm text-stone-500">{number}</p><h3 className="mt-4 text-lg font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{description}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Start a conversation</p><h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Tell us what you’re planning.</h2><p className="mt-4 max-w-2xl leading-7 text-stone-600">A room photo, reference, or a short brief is enough to start. We’ll ask for any details needed to prepare a useful response.</p></div>
            <Link href="/custom-painting?intent=project" className="inline-flex shrink-0 justify-center bg-stone-950 px-7 py-4 text-sm font-medium text-white hover:bg-stone-800">Start a project enquiry</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
