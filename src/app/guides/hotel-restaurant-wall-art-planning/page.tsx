import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

const pagePath = "/guides/hotel-restaurant-wall-art-planning"
const title = "How to Choose Art for Hotels and Restaurants"
const description =
  "Plan hotel and restaurant wall art with practical guidance on space planning, artwork scale, abstract palettes, coordinated selections, and custom projects."

export const metadata: Metadata = buildSeoMetadata({ title, description, path: pagePath })

const sections = [
  {
    number: "01",
    title: "How to choose art for hotels and restaurants",
    paragraphs: [
      "Start with the guest experience and the role of each space. A hotel lobby can use a larger, expressive painting to create a focal point; guest rooms often benefit from calmer compositions that work with the headboard, lighting, and overall color scheme. Corridors call for a considered rhythm of works that guests can view at close range.",
      "Before choosing hotel art, record each wall's clear width and height, furniture below it, viewing distance, natural and evening light, and any fixtures or access requirements. For restaurants, include dining zones, waiting areas, and sightlines from the entrance. Straight-on room photos or a floor plan help compare scale and palette with the actual interior.",
      "For a multi-room project, choose a visual thread—such as a shared palette, texture, or framing direction—then vary the composition or scale by zone. This keeps the property cohesive without repeating the same painting in every room. Consider custom abstract paintings when standard sizes or available colors do not fit the space.",
    ],
    bullets: ["Guest rooms and suites", "Lobby, reception, and lounge", "Restaurant dining and waiting areas", "Corridors, meeting rooms, and other shared spaces"],
  },
  {
    number: "02",
    title: "Choose scale for the wall and the viewing distance",
    paragraphs: [
      "Measure the clear wall area, not only the full architectural wall. Include door swings, sconces, televisions, mirrors, headboards, and service access. Then compare the artwork with the furniture and the distance from which guests will see it.",
      "A large composition can anchor a lobby or dining room, while a quieter, more intimate work can suit a guest room. In a corridor, consider the repeated rhythm of several walls and how close people pass to the artwork. Confirm finished dimensions and hanging clearances before ordering a coordinated set.",
    ],
    bullets: ["Wall width and height", "Furniture width and mounting position", "Typical viewing distance", "Clearance around lights, fixtures, and doors"],
  },
  {
    number: "03",
    title: "Build an abstract-art palette from the interior",
    paragraphs: [
      "Abstract art can bring identity to a hospitality space without relying on literal imagery. Begin with the materials and colors already present: flooring, stone, timber, upholstery, metal finishes, and brand accents. Decide whether the artwork should echo those tones or introduce one controlled contrast.",
      "Compare undertones as well as color names. A warm white wall, cool gray stone, and natural oak can shift how a neutral painting reads. If color consistency matters across rooms, share daylight and evening photos, finish samples, and any brand color references when requesting options.",
    ],
    bullets: ["Choose a lead palette and one or two supporting tones", "Check artwork against actual material samples", "Use stronger contrast for focal areas and calmer movement for restful rooms", "Review color in the lighting where the work will hang"],
  },
  {
    number: "04",
    title: "Create consistency without making every room identical",
    paragraphs: [
      "A cohesive project does not require the same painting everywhere. Set a few shared rules, such as a recurring palette, related texture, consistent framing direction, or a family of abstract compositions. Then allow the scale or color balance to change with each zone.",
      "For multi-room programs, prepare a simple artwork schedule. Give each location a room or wall ID and record its dimensions, selected artwork, quantity, finish, and any installation notes. This makes review and later replenishment easier.",
    ],
    bullets: ["Use a visual direction board for the whole property", "Group works by floor, room type, or guest journey", "Track each wall with a unique location ID", "Review the full set together before final approval"],
  },
  {
    number: "05",
    title: "Know when a custom painting is the better fit",
    paragraphs: [
      "An existing work may be the simplest option when its dimensions, orientation, and palette already suit the wall. Consider a custom painting when a feature wall has an unusual proportion, a room needs a specific color balance, or a project calls for related works across several spaces.",
      "Custom possibilities depend on the artwork and production brief. Share the required dimensions, preferred orientation, reference images, palette, quantity, destination, and target timing. Feasibility, materials, pricing, production timing, and delivery format should be confirmed before production begins.",
    ],
    bullets: ["Wall measurements and room photographs", "Palette, material, or brand references", "Quantity and room-by-room schedule", "Destination and target installation date"],
  },
  {
    number: "06",
    title: "Confirm artwork specifications and delivery details",
    paragraphs: [
      "Before approving a project, align on the selected works, dimensions, finish, packing format, quantities, quote, and production timeline. Ask how oversized works will be packed and whether the delivery route requires rolled or ready-to-hang artwork.",
      "International orders may involve customs duties, import taxes, or carrier-clearance charges. Those costs depend on the destination and current rules and may not be collected at checkout. Confirm landed-cost assumptions and receiving arrangements with your project team and customs broker before dispatch.",
    ],
    bullets: ["Approved artwork and location schedule", "Final dimensions and finish for each item", "Packing, delivery address, and receiving contact", "Budget for any destination import charges"],
  },
]

export default function HospitalityArtPlanningGuide() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: "Hotel & Restaurant Art Planning", path: pagePath },
          ])),
        }}
      />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1180px]">
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-stone-500">
              <Link href="/guides" className="underline underline-offset-4">Guides</Link>
              <span aria-hidden="true"> / </span>
              <span>Hospitality art planning</span>
            </nav>
            <p className="mb-4 text-sm uppercase text-stone-500">YiiArt Project Guide</p>
            <h1 className="max-w-4xl font-serif text-4xl font-normal leading-tight sm:text-5xl">
              How to Choose Art for Hotels and Restaurants
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
              A practical starting point for selecting original abstract paintings across guest rooms, lobbies, dining spaces, and other hospitality interiors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/custom-painting?intent=project" className="inline-flex bg-stone-950 px-6 py-4 text-sm font-medium text-white hover:bg-stone-800">
                Discuss a project
              </Link>
              <Link href="/trade" className="inline-flex border border-stone-400 px-6 py-4 text-sm font-medium hover:border-stone-950">
                View hospitality artwork
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1180px] gap-5 md:grid-cols-3">
            <Summary title="Plan by zone" text="Match each artwork to the wall, guest activity, and viewing distance." />
            <Summary title="Set a visual system" text="Coordinate palette and texture while adapting each work to its room." />
            <Summary title="Confirm project details" text="Align dimensions, finish, quantities, timing, and delivery before production." />
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
          <article className="min-w-0">
            <p className="mb-10 text-base leading-8 text-stone-600">
              The strongest hospitality art plans start with the space and the guest experience, not a product shortlist. Use this checklist to move from room measurements to a clear artwork brief.
            </p>
            {sections.map((section) => (
              <section key={section.number} className="border-t border-stone-200 py-8">
                <p className="text-sm text-stone-500">{section.number}</p>
                <h2 className="mt-3 text-2xl font-medium leading-snug">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-stone-600">{paragraph}</p>
                ))}
                <ul className="mt-5 grid gap-2 text-sm leading-6 text-stone-700 sm:grid-cols-2">
                  {section.bullets.map((item) => <li key={item} className="border-l border-stone-300 pl-3">{item}</li>)}
                </ul>
              </section>
            ))}
            <section className="border-y border-stone-200 py-8">
              <h2 className="text-2xl font-medium">A useful project brief</h2>
              <p className="mt-4 text-base leading-8 text-stone-600">
                Include the property type, room or wall locations, approximate quantities, wall dimensions, interior or brand references, preferred palette, delivery country, and target timing. Photos or a floor plan help clarify the request; an early brief can be approximate and refined together.
              </p>
            </section>
          </article>

          <aside className="h-fit border-t border-stone-300 pt-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-medium">Explore YiiArt</h2>
            <div className="mt-4 grid gap-4 text-sm">
              <Link href="/trade" className="underline underline-offset-4">Hotel and restaurant artwork projects</Link>
              <Link href="/collections/large-canvas-art" className="underline underline-offset-4">Large canvas art</Link>
              <Link href="/collections/dining-room-wall-art" className="underline underline-offset-4">Dining room wall art</Link>
              <Link href="/collections/abstract-art-for-living-room" className="underline underline-offset-4">Abstract wall art</Link>
              <Link href="/custom-painting?intent=project" className="underline underline-offset-4">Request a custom project quote</Link>
            </div>
            <p className="mt-8 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-600">
              Import charges vary by destination, classification, and origin. For U.S. tariff references, consult the <a href="https://hts.usitc.gov/" target="_blank" rel="noreferrer" className="underline underline-offset-4">current USITC Harmonized Tariff Schedule</a> and a qualified customs broker.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Summary({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-stone-300 pt-4">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
