import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { client } from "@/lib/sanity"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"

export const revalidate = 600

export const metadata = buildSeoMetadata({
  title: "Hotel & Restaurant Artwork for Hospitality Projects",
  description:
    "Explore hand-painted artwork for hotels and restaurants. Discuss coordinated selections, custom sizes, palettes, delivery destinations, and a project quote with YiiArt.",
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
  ["01", "Share the project brief", "Tell us whether you are planning for a hotel, restaurant, or another hospitality space, plus room types, artwork quantity, destination, and timing."],
  ["02", "Review artwork directions", "We discuss suitable listed works, coordinated selections, possible sizes and palette changes, and the scope of a proposal."],
  ["03", "Confirm a quote", "Artwork specifications, pricing, sampling if needed, and production timing are confirmed for your project."],
  ["04", "Approve and produce", "Production starts after the agreed specifications and payment terms are confirmed. Delivery is planned by destination."],
] as const

const faqs = [
  { question: "Can YiiArt help select artwork for a hotel or restaurant?", answer: "Yes. Share the space, room types, visual direction, approximate artwork quantity, and destination. YiiArt can discuss suitable listed works and coordinated selections for the project." },
  { question: "Can artwork sizes or colors be adapted for a hospitality project?", answer: "Custom sizes, orientation, and palette direction can be discussed for selected works. Feasibility and specifications are confirmed for each artwork before a quote is finalized." },
  { question: "How do I request a quote for a hotel or restaurant art project?", answer: "Send the project type, artwork quantity or estimate, preferred sizes, delivery country, and target timing through the project enquiry form. YiiArt will review the brief and confirm scope and pricing." },
  { question: "Do you ship hospitality artwork internationally?", answer: "Delivery options, packing format, and timing depend on the artwork dimensions and destination. These details are confirmed as part of the project quote." },
  { question: "Can I start a project enquiry before all details are decided?", answer: "Yes. A room photo, reference, approximate quantity, or short brief is enough to begin a conversation. Specifications and quote can be refined as the project develops." },
]

const projectCollectionLinks = [
  { title: "Dining room wall art", href: "/collections/dining-room-wall-art", description: "Compare hand-painted works for restaurant dining rooms and shared guest spaces." },
  { title: "Large canvas art", href: "/collections/large-canvas-art", description: "Explore statement-scale paintings for lobbies, lounges, and feature walls." },
  { title: "Abstract art for living rooms", href: "/collections/abstract-art-for-living-room", description: "Browse abstract palettes that can inform suites and other relaxed interiors." },
]

export default async function TradePage() {
  const artworks = await getSelectedArtworks()

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Hotel & Restaurant Art", path: "/trade" },
        ])) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }} />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Artwork for hospitality projects</p>
              <h1 className="max-w-4xl font-serif text-5xl font-normal leading-[1.08] tracking-tight sm:text-6xl">
                Hand-painted artwork for hotels and restaurants.
              </h1>
            </div>
            <div>
              <p className="max-w-xl text-lg leading-8 text-stone-600">
                Find artwork for hotel rooms, lobbies, restaurants, and other guest spaces. Explore existing paintings or discuss coordinated selections, custom sizes, and palette directions for your project. We confirm scope, pricing, production timing, and delivery options before an order is finalized.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/custom-painting?intent=project" className="inline-flex bg-stone-950 px-6 py-4 text-sm font-medium text-white hover:bg-stone-800">
                  Enquire about project artwork
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
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Artwork planned around your guest spaces</h2>
              <p className="mt-4 leading-7 text-stone-600">For hotels, restaurants, and interior design projects, start with an existing composition or share the dimensions and palette your space calls for. Options are confirmed for each artwork and destination.</p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div className="border-t border-stone-300 pt-5"><h3 className="text-lg font-medium">Hotel and restaurant selections</h3><p className="mt-3 leading-7 text-stone-600">Review works for guest rooms, lobbies, dining rooms, and other spaces by scale, color, and visual rhythm.</p></div>
              <div className="border-t border-stone-300 pt-5"><h3 className="text-lg font-medium">Coordinated artwork</h3><p className="mt-3 leading-7 text-stone-600">Discuss a consistent palette or a related selection across multiple rooms, while keeping each space’s brief in view.</p></div>
              <div className="border-t border-stone-300 pt-5"><h3 className="text-lg font-medium">Custom sizes and project quotes</h3><p className="mt-3 leading-7 text-stone-600">Share quantities, dimensions, destination, and timing so feasible specifications and a project quote can be confirmed.</p></div>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Browse by space and scale</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Explore artwork for your project brief</h2>
              <p className="mt-4 leading-7 text-stone-600">Use these collections to compare current works. For coordinated selections, custom sizes, or a project quote, share your hospitality brief with YiiArt.</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {projectCollectionLinks.map((item) => (
                <Link key={item.href} href={item.href} className="border-t border-stone-300 pt-5 hover:border-stone-950">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-3 leading-7 text-stone-600">{item.description}</p>
                </Link>
              ))}
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

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Project questions</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Planning artwork for a hospitality space?</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {faqs.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium">
                    <span className="inline-flex w-full items-center justify-between gap-4">{item.question}<span className="text-stone-400 group-open:hidden">+</span><span className="hidden text-stone-400 group-open:inline">-</span></span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Start a conversation</p><h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Tell us about your hotel or restaurant project.</h2><p className="mt-4 max-w-2xl leading-7 text-stone-600">Share the space, a room photo or reference, approximate artwork quantity, delivery country, and target timing. A short brief is enough to start.</p><p className="mt-4 text-sm text-stone-600">Also planning a single custom piece? <Link href="/custom-painting" className="underline underline-offset-4">Explore custom abstract paintings</Link>.</p></div>
            <Link href="/custom-painting?intent=project" className="inline-flex shrink-0 justify-center bg-stone-950 px-7 py-4 text-sm font-medium text-white hover:bg-stone-800">Start a project enquiry</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
