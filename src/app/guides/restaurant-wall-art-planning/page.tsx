import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

const path = "/guides/restaurant-wall-art-planning"
const title = "Restaurant Wall Art Planning Guide"

export const metadata: Metadata = buildSeoMetadata({
  title,
  description: "Plan restaurant wall art by dining zone, sightline, lighting, scale, and palette. Compare hand-painted work and custom abstract paintings for your space.",
  path,
})

const sections = [
  {
    title: "Give each dining zone a clear role",
    paragraphs: [
      "Walk the restaurant from the entrance to the table. Guests may see one wall from the doorway, another while waiting, and a third throughout a meal. Make a short list of entrance, bar, banquette, private dining, and circulation walls before choosing individual paintings.",
      "A focal wall can carry a larger or more expressive work. Art seen close to a table may benefit from quieter movement and surface detail. Repeating the same image in every zone is rarely necessary; a related palette or framing direction can connect the spaces.",
    ],
  },
  {
    title: "Measure the wall, furniture, and viewing distance",
    paragraphs: [
      "Record the clear wall area after allowing for doors, mirrors, menus, sconces, and service access. Compare a painting with the table or banquette below it, then check how it reads from the nearest seat and the far side of the room. A work that looks balanced on a plan can feel too small when viewed across a busy dining room.",
      "For a long wall, consider whether one large canvas or a coordinated group suits the seating rhythm. If the wall has an unusual proportion, a custom size may be easier to place than forcing an existing composition into the available space.",
    ],
  },
  {
    title: "Review color under day and evening light",
    paragraphs: [
      "Restaurant lighting often changes between service periods. Compare artwork references with the room in daylight and under its actual evening lighting. Note the undertones in upholstery, timber, stone, metal finishes, and wall paint; a neutral painting may read warmer or cooler beside them.",
      "Decide which walls should add energy and which should let the food, people, and materials take the lead. Abstract work can provide color and texture without specifying a literal subject, but the right balance depends on the restaurant's atmosphere and sightlines.",
    ],
  },
  {
    title: "Prepare an artwork brief before requesting a quote",
    paragraphs: [
      "Send a room plan or wall photographs, clear dimensions, approximate quantities, palette references, destination, and target timing. Mark each proposed artwork location so the selection can be reviewed as a set. If you are considering existing paintings, note which compositions you like and what would need to change.",
      "YiiArt can discuss suitable listed works, coordinated selections, or a custom abstract direction. Confirm the feasible sizes and finishes, quote, production timing, packing, and delivery arrangements for the actual project before an order is finalized.",
    ],
  },
]

export default function RestaurantWallArtPlanningGuide() {
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
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-stone-500"><Link href="/guides" className="underline underline-offset-4">Guides</Link> / Restaurant wall art</nav>
            <p className="mb-4 text-sm uppercase text-stone-500">Restaurant Art Guide</p>
            <h1 className="max-w-4xl font-serif text-4xl font-normal leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">A practical guide for owners and designers choosing paintings for dining rooms, bars, waiting areas, and private spaces.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/custom-painting?intent=project" className="bg-stone-950 px-6 py-4 text-sm font-medium text-white hover:bg-stone-800">Discuss a restaurant project</Link>
              <Link href="/collections/dining-room-wall-art" className="border border-stone-400 px-6 py-4 text-sm font-medium hover:border-stone-950">Browse dining room art</Link>
            </div>
          </div>
        </section>
        <article className="mx-auto w-full max-w-[1180px] px-4 py-14 sm:px-6 lg:px-10">
          <p className="max-w-3xl text-base leading-8 text-stone-600">Choose artwork as part of the restaurant interior rather than as a last wall decoration. The decisions below help you compare scale, palette, and custom options before ordering.</p>
          {sections.map((section, index) => (
            <section key={section.title} className="max-w-3xl border-b border-stone-200 py-10">
              <p className="text-sm text-stone-500">0{index + 1}</p>
              <h2 className="mt-3 font-serif text-2xl">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-8 text-stone-600">{paragraph}</p>)}
            </section>
          ))}
          <section className="max-w-3xl py-10">
            <h2 className="font-serif text-2xl">Continue planning</h2>
            <p className="mt-4 text-base leading-8 text-stone-600">Compare available work first, then send room details if the palette, proportion, or number of paintings calls for a coordinated project.</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/trade" className="underline underline-offset-4">Hotel and restaurant artwork service</Link>
              <Link href="/guides/hotel-restaurant-wall-art-planning" className="underline underline-offset-4">Hospitality art planning guide</Link>
              <Link href="/collections/large-canvas-art" className="underline underline-offset-4">Large canvas art</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}
