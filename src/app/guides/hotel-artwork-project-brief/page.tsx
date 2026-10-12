import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

const pagePath = "/guides/hotel-artwork-project-brief"
const title = "Hotel Artwork Project Brief: A Buyer’s Checklist"
const description =
  "Prepare a hotel art project brief with room schedules, wall measurements, abstract palette references, quantities, delivery details, and quote questions."

export const metadata: Metadata = buildSeoMetadata({ title, description, path: pagePath })

const briefFields = [
  ["Property and contact", "Property type, project lead, decision-makers, receiving contact, and preferred communication channel."],
  ["Room and wall schedule", "A unique room or wall ID, location, wall width and height, furniture below, orientation, and a current photo."],
  ["Artwork direction", "Abstract or other style direction, lead colors, materials in the room, reference images, and any brand palette guidance."],
  ["Quantity and phasing", "Estimated pieces by room type, priority areas, sample or pilot needs, and whether the project will ship in phases."],
  ["Specifications", "Target finished dimensions, orientation, surface or finish preferences, framing requirements, and installation constraints."],
  ["Destination and timing", "Full delivery address or country, access and receiving limits, target date, and the date by which artwork must arrive."],
]

const quoteQuestions = [
  "Which dimensions, finishes, and quantities are feasible for this artwork direction?",
  "What are the confirmed artwork price, packing format, production timing, and delivery estimate?",
  "Will large or textured pieces need rolled shipping or special receiving arrangements?",
  "Which destination charges, import taxes, or customs steps should the buyer plan for?",
  "What approvals, deposit, and balance terms apply before production begins?",
]

export default function HotelArtworkProjectBriefPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: "Hotel Artwork Project Brief", path: pagePath },
          ])),
        }}
      />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1180px]">
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-stone-500">
              <Link href="/guides" className="underline underline-offset-4">Guides</Link>
              <span aria-hidden="true"> / </span>
              <span>Hotel artwork project brief</span>
            </nav>
            <p className="mb-4 text-sm uppercase text-stone-500">Hospitality Buyer Checklist</p>
            <h1 className="max-w-4xl font-serif text-4xl font-normal leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
              A clear brief helps a hotel owner, interior designer, or procurement team compare artwork options and confirm project details before approving production.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/custom-painting?intent=project" className="inline-flex bg-stone-950 px-6 py-4 text-sm font-medium text-white hover:bg-stone-800">
                Send a project brief
              </Link>
              <Link href="/trade" className="inline-flex border border-stone-400 px-6 py-4 text-sm font-medium hover:border-stone-950">
                Explore hotel and restaurant art
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-10">
          <article className="min-w-0">
            <section className="border-b border-stone-200 pb-10">
              <h2 className="text-2xl font-medium">Project brief fields</h2>
              <p className="mt-4 text-base leading-8 text-stone-600">
                A first enquiry does not need every answer. Start with the spaces, approximate quantities, destination, and visual direction; confirm exact feasibility and specifications in the quote.
              </p>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                {briefFields.map(([label, detail]) => (
                  <div key={label} className="border-t border-stone-300 pt-4">
                    <dt className="font-medium">{label}</dt>
                    <dd className="mt-2 text-sm leading-6 text-stone-600">{detail}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="border-b border-stone-200 py-10">
              <h2 className="text-2xl font-medium">Build a coordinated abstract art direction</h2>
              <ol className="mt-5 grid gap-4 text-base leading-7 text-stone-600">
                <li><span className="font-medium text-stone-950">1. Start with the room.</span> Note flooring, stone, timber, upholstery, lighting, and existing brand colors.</li>
                <li><span className="font-medium text-stone-950">2. Choose a lead palette.</span> Select a few dominant tones and decide where a deliberate contrast belongs.</li>
                <li><span className="font-medium text-stone-950">3. Vary by zone.</span> Keep a shared visual family while adjusting scale and movement for guest rooms, lobbies, and dining areas.</li>
                <li><span className="font-medium text-stone-950">4. Review real samples and images.</span> Compare work against room photos and material references in the lighting where it will hang.</li>
              </ol>
            </section>

            <section className="border-b border-stone-200 py-10">
              <h2 className="text-2xl font-medium">Questions to settle in the quote</h2>
              <ul className="mt-5 grid gap-3 text-base leading-7 text-stone-600">
                {quoteQuestions.map((question) => <li key={question} className="border-l border-stone-300 pl-4">{question}</li>)}
              </ul>
              <p className="mt-5 text-sm leading-6 text-stone-600">
                Production, pricing, packing, and delivery depend on the selected work, specifications, and destination. Import charges may also apply; confirm the current treatment with the destination customs authority or a qualified broker.
              </p>
            </section>

            <section className="pt-10">
              <h2 className="text-2xl font-medium">Move from brief to artwork selection</h2>
              <p className="mt-4 text-base leading-8 text-stone-600">
                Once the project fields are outlined, compare available work by space and scale or discuss a custom direction. Confirm the final specifications and quote before production starts.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <Link href="/collections/dining-room-wall-art" className="underline underline-offset-4">Dining room wall art</Link>
                <Link href="/collections/large-canvas-art" className="underline underline-offset-4">Large canvas art</Link>
                <Link href="/guides/hotel-restaurant-wall-art-planning" className="underline underline-offset-4">Hospitality art planning guide</Link>
              </div>
            </section>
          </article>

          <aside className="h-fit border-t border-stone-300 pt-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-medium">Brief at a glance</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-stone-600">
              {briefFields.map(([label]) => <li key={label} className="border-b border-stone-200 pb-3">{label}</li>)}
            </ul>
            <Link href="/trade" className="mt-6 inline-flex text-sm underline underline-offset-4">Discuss a hospitality project</Link>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  )
}
