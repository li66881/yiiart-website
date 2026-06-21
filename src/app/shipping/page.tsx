import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { shippingHighlights } from "@/lib/policy-content"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Shipping Original Artwork",
  description:
    "YiiArt ships original paintings worldwide with tracked delivery, protective packaging, and clear customs guidance.",
  path: "/shipping",
})

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbfaf6] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Shipping</p>
              <h1 className="text-5xl font-light leading-tight">Shipping original artwork safely.</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              YiiArt ships original paintings internationally with protective packaging and tracking when available.
              Final timing depends on preparation, destination, customs review, and carrier conditions.
            </p>
          </section>

          <section className="grid gap-5 py-14 md:grid-cols-2 lg:grid-cols-4">
            {shippingHighlights.map((item) => (
              <Info key={item.title} title={item.title} text={item.text} />
            ))}
          </section>

          <section className="grid gap-10 border-y border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Timeline</p>
              <h2 className="text-4xl font-light leading-tight">Preparation first, then carrier transit.</h2>
            </div>
            <div className="grid gap-4">
              <Timeline title="Artwork preparation" text="Final checks, documentation, packing, and dispatch preparation usually happen before carrier transit begins." />
              <Timeline title="International transit" text="Transit timing varies by destination, customs, carrier route, and artwork shipping format." />
              <Timeline title="Oversized or custom work" text="Large canvas art and commissioned works may need extra production, drying, packing, or freight coordination time." />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-stone-300 pt-5">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}

function Timeline({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-stone-200 bg-white p-5">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
