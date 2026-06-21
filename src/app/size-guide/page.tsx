import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Canvas Art Size Guide",
  description:
    "Choose the right handmade canvas art size for sofas, beds, dining rooms, entryways, offices, and large walls.",
  path: "/size-guide",
})

const placements = [
  {
    room: "Above a sofa",
    advice: "Choose art that is about two-thirds to three-quarters of the sofa width. Large horizontal canvas works well above long seating.",
  },
  {
    room: "Above a bed",
    advice: "A single large canvas or two balanced works should sit comfortably above the headboard without touching lamps or side tables.",
  },
  {
    room: "Dining room",
    advice: "Use a calmer palette and enough width to hold the wall behind the table without visually crowding the chairs.",
  },
  {
    room: "Entryway or hallway",
    advice: "Portrait and square works can add presence where viewing distance is shorter. Avoid oversized pieces in narrow passages.",
  },
  {
    room: "Office or hospitality space",
    advice: "Large wall art can anchor meeting rooms, reception areas, studios, and quiet commercial interiors.",
  },
  {
    room: "Oversized feature wall",
    advice: "Confirm wall width, viewing distance, shipping format, and installation plan before choosing a very large canvas.",
  },
]

const sizeBands = [
  ["Small", "Under 60 cm", "Accent shelves, small corners, compact walls"],
  ["Medium", "60-100 cm", "Bedrooms, entryways, pairings, smaller sofas"],
  ["Large", "100-150 cm", "Living rooms, beds, dining rooms, feature walls"],
  ["Oversized", "150 cm+", "Large wall art, offices, hospitality spaces"],
]

export default function SizeGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 px-4 pb-20 pt-32 sm:px-6 lg:px-10">
        <section className="mx-auto grid max-w-[1180px] gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="mb-3 text-sm uppercase text-stone-500">Size guide</p>
            <h1 className="text-5xl font-light leading-tight">Choose canvas art that feels right on the wall.</h1>
          </div>
          <p className="max-w-3xl text-base leading-8 text-stone-600">
            The right artwork size depends on wall width, furniture scale, ceiling height, viewing distance, and
            whether you want a quiet accent or a strong statement piece.
          </p>
        </section>

        <section className="mx-auto max-w-[1180px] py-14">
          <h2 className="mb-6 text-3xl font-light">Common size bands</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {sizeBands.map(([label, range, use]) => (
              <div key={label} className="border border-stone-200 bg-white p-5">
                <h3 className="font-medium">{label}</h3>
                <p className="mt-2 text-sm text-stone-500">{range}</p>
                <p className="mt-4 text-sm leading-6 text-stone-600">{use}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-5 md:grid-cols-2 lg:grid-cols-3">
          {placements.map((placement) => (
            <div key={placement.room} className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-medium">{placement.room}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{placement.advice}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-14 max-w-[1180px] border border-stone-200 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-light">Need help choosing?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-600">
            Send your wall width, ceiling height, furniture width, and a room photo. YiiArt can help confirm whether a
            ready artwork or a custom canvas is the better fit.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="bg-black px-6 py-4 text-center text-sm text-white transition hover:bg-stone-800">
              Request room advice
            </Link>
            <Link href="/collections/large-canvas-art" className="border border-stone-300 px-6 py-4 text-center text-sm transition hover:border-black">
              Browse large wall art
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
