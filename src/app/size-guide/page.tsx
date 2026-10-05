import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildSeoMetadata } from "@/lib/seo"
import { sofaArtworkSizeExamples } from "@/lib/wall-art-sizing"

export const metadata: Metadata = buildSeoMetadata({
  title: "Wall Art Size Guide: Sofa, Bed & Room Sizes",
  description:
    "Find the right wall art size for a sofa, bed, or room. Use the 60%-75% sofa-width starting point, compare size examples, and measure your clear wall space.",
  path: "/size-guide",
})

const sceneGuides = [
  {
    title: "Above Sofa",
    advice: "A useful starting range is 60%-75% of the sofa width. Compare the dimensions below, then check the clear wall space.",
    shape: "sofa",
  },
  {
    title: "Above Bed",
    advice: "Relate the artwork width to the headboard and leave visible space at both sides; check lamps and wall lights too.",
    shape: "bed",
  },
  {
    title: "Dining Room",
    advice: "If the work hangs above a sideboard, compare its width with the furniture. Keep enough clearance for chairs and lighting.",
    shape: "dining",
  },
  {
    title: "Entryway",
    advice: "Measure the usable wall between doors, trim, and switches. A vertical work can suit a narrow entry wall.",
    shape: "entryway",
  },
  {
    title: "Office",
    advice: "Check the viewing distance and screen glare as well as the desk width; surface details are best seen up close.",
    shape: "office",
  },
]

const sizeBands = [
  {
    label: "Small",
    range: "Under 60 cm",
    use: "Longest side under 60 cm. Suits shelves, compact walls, narrow entries, or a grouped arrangement.",
  },
  {
    label: "Medium",
    range: "60-100 cm",
    use: "Longest side 60-100 cm. Works well in bedrooms, entryways, home offices, reading corners, and smaller furniture walls.",
  },
  {
    label: "Large",
    range: "100-150 cm",
    use: "Longest side 100-150 cm. Compare the width with sofas, beds, dining furniture, and the clear wall area.",
  },
  {
    label: "Oversized",
    range: "150 cm+",
    use: "Longest side over 150 cm. Measure access, hanging clearance, and delivery format for open living rooms, offices, and feature walls.",
  },
]

const links = [
  { title: "Wall Art Pairing Guide", href: "/guides/home-wall-art-pairing-guide" },
  { title: "Custom Painting", href: "/custom-painting" },
  { title: "Large Wall Art", href: "/collections/large-canvas-art" },
  { title: "Living Room Art", href: "/collections/abstract-art-for-living-room" },
  { title: "Bedroom Wall Art", href: "/collections/bedroom-wall-art" },
  { title: "Dining Room Art", href: "/collections/dining-room-wall-art" },
  { title: "Office Wall Art", href: "/collections/office-wall-art" },
]

export default function SizeGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Wall Art Size Guide</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">What size wall art fits your room?</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Start with the furniture and usable wall width, then compare the artwork dimensions. The ranges below are
              practical starting points, not fixed rules; ceiling height, side furniture, and viewing distance all affect
              the final fit.
            </p>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-4 md:grid-cols-[0.7fr_1fr] md:items-start">
            <h2 className="text-2xl font-light leading-tight">What size wall art should go above a sofa?</h2>
            <div className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                A useful starting range is artwork or a complete group about 60%-75% of the sofa's width. For an
                84-inch sofa, that is roughly 50-63 inches (127-160 cm) wide.
              </p>
              <p>
                Measure the clear wall and include gaps between pieces. If windows, lamps, or an off-center sofa limit
                the space, fit the artwork to the usable area instead of treating the ratio as a rule.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-[#fbfaf6] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-sm uppercase text-stone-500">Above the sofa</p>
              <h2 className="text-4xl font-light leading-tight">Use sofa width to estimate artwork width.</h2>
              <p className="mt-4 text-base leading-7 text-stone-600">
                A common starting point is an artwork or grouped arrangement about 60%-75% as wide as the sofa. Measure
                the full arrangement, including gaps between pieces, and keep it inside the usable wall area.
              </p>
            </div>
            <div className="border-y border-stone-300 bg-white">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <caption className="sr-only">Suggested total artwork width by sofa width</caption>
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th scope="col" className="w-[35%] px-4 py-3 font-medium">Sofa width</th>
                    <th scope="col" className="w-[65%] px-4 py-3 font-medium">Artwork width (cm / in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sofaArtworkSizeExamples.map((row) => (
                    <tr key={row.furnitureWidthCm} className="border-t border-stone-200">
                      <th scope="row" className="px-4 py-3 font-medium text-stone-900">{row.furnitureWidthCm} cm</th>
                      <td className="px-4 py-3 text-stone-700">
                        <span>{row.minArtworkWidthCm}-{row.maxArtworkWidthCm} cm</span>
                        <span className="block text-xs text-stone-500">{row.minArtworkWidthIn}-{row.maxArtworkWidthIn} in</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-stone-600">
              For example, a 180 cm sofa gives a starting artwork-width range of about 108-135 cm. If the wall is narrow,
              the sofa sits off-center, or lamps occupy the ends, use the clear wall width instead of forcing the full range.
            </p>
          </div>
        </section>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Measure before you choose</p>
              <h2 className="text-4xl font-light leading-tight">Four checks for a better fit.</h2>
            </div>
            <ol className="grid gap-5 sm:grid-cols-2">
              <li className="border-t border-stone-300 pt-4">
                <h3 className="font-medium">1. Measure the furniture</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">Record the full sofa, headboard, or sideboard width, including its outer edges.</p>
              </li>
              <li className="border-t border-stone-300 pt-4">
                <h3 className="font-medium">2. Measure clear wall width</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">Subtract space occupied by windows, doors, sconces, shelves, or cabinetry.</p>
              </li>
              <li className="border-t border-stone-300 pt-4">
                <h3 className="font-medium">3. Compare the full composition</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">For multiple pieces, add every artwork width and the gaps between them before comparing with furniture.</p>
              </li>
              <li className="border-t border-stone-300 pt-4">
                <h3 className="font-medium">4. Test the outline on the wall</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">Use painter's tape to mark the outer dimensions and view them from the main seat or doorway.</p>
              </li>
            </ol>
          </div>
          <div className="mx-auto mt-10 max-w-[1440px] border-l-2 border-stone-400 pl-5 text-sm leading-6 text-stone-600">
            Above a sofa or bed, leave a comfortable visual gap rather than aligning artwork to a universal height. Start
            around 15-30 cm (6-12 in) above the furniture, then adjust for the artwork's height, ceiling, wall features,
            and seated sightline.
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm uppercase text-stone-500">Scene Advice</p>
              <h2 className="text-4xl font-light leading-tight">Start with the furniture, then choose the art.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {sceneGuides.map((item) => (
                <div key={item.title} className="border border-stone-200 bg-[#fbfaf6] p-5">
                  <RoomDiagram shape={item.shape} />
                  <h2 className="mt-5 text-xl font-medium">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.advice}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm uppercase text-stone-500">Size Table</p>
              <h2 className="text-4xl font-light leading-tight">Small, Medium, Large, and Oversized</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sizeBands.map((band) => (
                <div key={band.label} className="border border-stone-200 bg-white p-6">
                  <p className="text-sm uppercase text-stone-500">{band.range}</p>
                  <h2 className="mt-4 text-3xl font-light">{band.label}</h2>
                  <p className="mt-5 text-sm leading-6 text-stone-600">{band.use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-stone-950 px-4 py-16 text-white sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm uppercase text-white/60">Need help choosing a size?</p>
              <h2 className="text-4xl font-light leading-tight">Request a custom recommendation.</h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-white/70">
                Send your wall width, ceiling height, furniture width, and room photo. YiiArt can help compare a ready
                artwork with a custom canvas size.
              </p>
            </div>
            <Link href="/custom-painting" className="bg-white px-6 py-4 text-center text-sm font-medium text-black transition hover:bg-stone-100">
              Request a custom recommendation
            </Link>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-sm uppercase text-stone-500">Helpful Links</p>
              <h2 className="text-4xl font-light leading-tight">Continue by room, scale, or custom size</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {links.map((item) => (
                <Link key={item.href} href={item.href} className="flex min-h-24 items-center justify-between border border-stone-200 bg-[#fbfaf6] px-5 py-4 transition hover:border-black hover:bg-white">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-stone-400">View</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function RoomDiagram({ shape }: { shape: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-stone-200 bg-white">
      <div className={artClass(shape)} />
      <div className={furnitureClass(shape)} />
      {shape === "dining" && (
        <>
          <div className="absolute bottom-[20%] left-[21%] h-5 w-10 border border-stone-300" />
          <div className="absolute bottom-[20%] right-[21%] h-5 w-10 border border-stone-300" />
        </>
      )}
      {shape === "office" && <div className="absolute bottom-[18%] right-[18%] h-10 w-8 border border-stone-300" />}
    </div>
  )
}

function artClass(shape: string) {
  const base = "absolute border border-stone-950 bg-[#d8d1c4]"
  const map: Record<string, string> = {
    sofa: "left-[21%] top-[16%] h-[24%] w-[58%]",
    bed: "left-[24%] top-[15%] h-[22%] w-[52%]",
    dining: "left-[18%] top-[18%] h-[20%] w-[64%]",
    entryway: "left-[38%] top-[12%] h-[42%] w-[24%]",
    office: "left-[27%] top-[16%] h-[28%] w-[46%]",
  }

  return `${base} ${map[shape] || map.sofa}`
}

function furnitureClass(shape: string) {
  const base = "absolute border border-stone-300 bg-stone-100"
  const map: Record<string, string> = {
    sofa: "bottom-[18%] left-[12%] h-[20%] w-[76%]",
    bed: "bottom-[14%] left-[18%] h-[34%] w-[64%]",
    dining: "bottom-[18%] left-[32%] h-[28%] w-[36%]",
    entryway: "bottom-[16%] left-[30%] h-[16%] w-[40%]",
    office: "bottom-[14%] left-[18%] h-[18%] w-[52%]",
  }

  return `${base} ${map[shape] || map.sofa}`
}
