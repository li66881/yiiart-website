import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

const path = "/guides/custom-abstract-painting-for-hotels"
const title = "Custom Abstract Paintings for Hotels: A Planning Guide"

export const metadata: Metadata = buildSeoMetadata({
  title,
  description: "Plan custom abstract paintings for hotel rooms, lobbies, and restaurants. Compare size, palette, quantity, samples, and delivery before requesting a quote.",
  path,
})

const steps = [
  {
    heading: "Start with the spaces and the guest experience",
    text: "List the guest rooms, lobby walls, lounges, dining areas, and corridors that need artwork. Record each wall's clear width and height, viewing distance, nearby furniture, lighting, and the mood the space should create. A reception focal point may need a different scale and contrast from a guest room painting.",
  },
  {
    heading: "Choose a visual family, then adapt it by zone",
    text: "Abstract paintings can share a palette, surface treatment, or compositional rhythm without repeating the same image on every wall. Compare color references with flooring, upholstery, timber, stone, and brand accents. Decide where the art should blend with those materials and where one stronger accent would help guests navigate the space.",
  },
  {
    heading: "Set dimensions and quantities before the quote",
    text: "Create a room-by-room schedule with a wall ID, target canvas size, orientation, quantity, and preferred finish. Include photos taken straight on and, where available, a floor plan or elevation. Mark any unusual proportions, fixtures, or installation clearances. Approximate quantities are enough for an initial conversation; final specifications can follow.",
  },
  {
    heading: "Review feasibility, samples, and delivery",
    text: "Ask which changes to an existing composition are feasible, whether a coordinated set needs a sample, and how color and surface will be approved. Confirm the final artwork schedule, price, production timing, packing format, destination, and receiving arrangements before production. Large canvases may require a different shipping format from smaller works.",
  },
]

export default function CustomAbstractPaintingForHotelsGuide() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: title, path },
      ])) }} />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1180px]">
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-stone-500"><Link href="/guides" className="underline underline-offset-4">Guides</Link> / Custom abstract paintings for hotels</nav>
            <p className="mb-4 text-sm uppercase text-stone-500">Hospitality Art Guide</p>
            <h1 className="max-w-4xl font-serif text-4xl font-normal leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">A practical way for hotel owners, designers, and procurement teams to plan coordinated abstract artwork before requesting a custom quote.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/custom-painting?intent=project" className="bg-stone-950 px-6 py-4 text-sm font-medium text-white hover:bg-stone-800">Discuss a custom project</Link>
              <Link href="/trade" className="border border-stone-400 px-6 py-4 text-sm font-medium hover:border-stone-950">Explore hospitality artwork</Link>
            </div>
          </div>
        </section>
        <article className="mx-auto w-full max-w-[1180px] px-4 py-14 sm:px-6 lg:px-10">
          <p className="max-w-3xl text-base leading-8 text-stone-600">A custom commission works best when the brief explains the room as well as the painting. Use the following steps to compare existing work with a new abstract direction and make the eventual quote specific.</p>
          {steps.map((step, index) => (
            <section key={step.heading} className="max-w-3xl border-b border-stone-200 py-10">
              <p className="text-sm text-stone-500">Step {index + 1}</p>
              <h2 className="mt-3 font-serif text-2xl">{step.heading}</h2>
              <p className="mt-4 text-base leading-8 text-stone-600">{step.text}</p>
            </section>
          ))}
          <section className="max-w-3xl py-10">
            <h2 className="font-serif text-2xl">What to send with your first enquiry</h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-8 text-stone-600">
              <li>Project location, room types, and approximate number of paintings</li>
              <li>Wall measurements, room photos, and available plans</li>
              <li>Palette, material, and style references</li>
              <li>Target installation date and delivery destination</li>
            </ul>
            <p className="mt-5 text-base leading-8 text-stone-600">If some details are undecided, send what you have. YiiArt can discuss suitable existing compositions, custom size or palette options, and the information needed for a project quote.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/guides/hotel-artwork-project-brief" className="underline underline-offset-4">Hotel project brief checklist</Link>
              <Link href="/guides/hotel-restaurant-wall-art-planning" className="underline underline-offset-4">Hotel and restaurant art planning</Link>
              <Link href="/collections/large-canvas-art" className="underline underline-offset-4">Large canvas art</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}
