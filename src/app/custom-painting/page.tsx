import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { getWhatsAppUrl } from "@/lib/site"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Custom Canvas Art",
  description:
    "Commission a handmade modern painting for your wall size, room palette, and interior style with YiiArt artist support.",
  path: "/custom-painting",
})

const steps = [
  {
    title: "Send the room context",
    text: "Share wall width, ceiling height, room photos, furniture colors, and any artworks or palettes you like.",
  },
  {
    title: "Confirm the artwork direction",
    text: "YiiArt helps define size, orientation, palette, surface feel, shipping format, timeline, and artist fit.",
  },
  {
    title: "Approve before production",
    text: "Custom work should be confirmed clearly before payment and production. No surprise checkout pressure.",
  },
]

const details = [
  "Custom sizes for sofas, beds, dining rooms, offices, hallways, and feature walls",
  "Modern abstract, textured, neutral, wabi-sabi, landscape-inspired, and mixed media directions",
  "Color planning around your existing room materials and natural light",
  "Shipping format confirmed before production, especially for oversized canvas work",
]

export default function CustomPaintingPage() {
  const whatsappUrl = getWhatsAppUrl(
    "Hello YiiArt, I would like to discuss a custom canvas painting. I can share my wall size, room photos, and preferred style."
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 px-4 pb-20 pt-32 sm:px-6 lg:px-10">
        <section className="mx-auto grid max-w-[1180px] gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="mb-3 text-sm uppercase text-stone-500">Custom painting</p>
            <h1 className="text-5xl font-light leading-tight">A handmade canvas painting made for your room.</h1>
          </div>
          <div className="space-y-5 text-base leading-8 text-stone-600">
            <p>
              Use this path when the available collection is close, but your wall needs a specific size, color mood,
              orientation, or surface texture. YiiArt can help you prepare a custom request before any payment decision.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-black px-6 py-4 text-sm text-white transition hover:bg-stone-800"
            >
              Start on WhatsApp
            </a>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-5 py-14 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="border-t border-stone-300 pt-5">
              <p className="text-sm text-stone-400">0{index + 1}</p>
              <h2 className="mt-4 text-xl font-medium">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{step.text}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-10 border-y border-stone-200 py-14 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="mb-3 text-sm uppercase text-stone-500">What can be customized</p>
            <h2 className="text-4xl font-light leading-tight">Size, palette, style direction, and room fit.</h2>
          </div>
          <ul className="grid gap-4 text-sm leading-6 text-stone-600 sm:grid-cols-2">
            {details.map((detail) => (
              <li key={detail} className="border border-stone-200 bg-white p-5">{detail}</li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-[1180px] pt-14">
          <div className="border border-stone-200 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-light">Before you ask for a quote</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-600">
              Please prepare the wall width, ceiling height, preferred canvas size if known, delivery country,
              room photos, and 2-5 reference images for mood only. Do not send copyrighted images for direct copying.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
