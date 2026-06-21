import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Artwork Size Guide",
  description:
    "Choose the right wall art size for sofas, beds, dining rooms, entryways, offices, large walls, and custom canvas paintings.",
  path: "/size-guide",
})

const sceneGuides = [
  {
    title: "Above Sofa",
    advice: "Choose artwork about 60%-75% of the sofa width.",
    shape: "sofa",
  },
  {
    title: "Above Bed",
    advice: "Choose artwork slightly narrower than the headboard.",
    shape: "bed",
  },
  {
    title: "Dining Room",
    advice: "Large horizontal pieces usually work well.",
    shape: "dining",
  },
  {
    title: "Entryway",
    advice: "Vertical or medium-sized artwork is recommended.",
    shape: "entryway",
  },
  {
    title: "Office",
    advice: "Choose calm colors and balanced compositions.",
    shape: "office",
  },
]

const sizeBands = [
  {
    label: "Small",
    range: "Under 60 cm",
    use: "Best for shelves, compact walls, side corners, narrow entries, or grouped arrangements.",
  },
  {
    label: "Medium",
    range: "60-100 cm",
    use: "Works well in bedrooms, entryways, home offices, reading corners, and smaller sofa walls.",
  },
  {
    label: "Large",
    range: "100-150 cm",
    use: "A strong choice above sofas, beds, dining room walls, and calm feature walls.",
  },
  {
    label: "Oversized",
    range: "150 cm+",
    use: "Designed for large wall art moments, open living rooms, offices, studios, and hospitality spaces.",
  },
]

const links = [
  { title: "Custom Painting", href: "/custom-painting" },
  { title: "Large Wall Art", href: "/collections/large-canvas-art" },
  { title: "Living Room Art", href: "/collections/abstract-art-for-living-room" },
  { title: "Bedroom Wall Art", href: "/collections/bedroom-wall-art" },
]

export default function SizeGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Size Guide</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">Artwork Size Guide</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Choosing the right size is one of the most important parts of buying wall art online.
            </p>
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
