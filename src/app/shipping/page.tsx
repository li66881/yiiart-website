import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { customsIntro, customsMarketGuidance, shippingHighlights } from "@/lib/policy-content"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Shipping Hand-Painted Artwork",
  description:
    "YiiArt shipping for hand-painted artwork, including destination notes on customs duty and import VAT.",
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
              <h1 className="text-5xl font-light leading-tight">Shipping hand-painted artwork carefully.</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Delivery timing and format are confirmed by destination, size, finish, and carrier route. Tracking
              information is shared when the selected carrier service provides it. Duties and local taxes may be charged
              by the destination country and are not collected in the YiiArt checkout total.
            </p>
          </section>

          <section className="grid gap-5 py-14 md:grid-cols-2 lg:grid-cols-4">
            {shippingHighlights.map((item) => (
              <Info key={item.title} title={item.title} text={item.text} />
            ))}
          </section>

          <section className="grid gap-10 border-y border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Import charges</p>
              <h2 className="text-4xl font-light leading-tight">Duty is often zero. Import VAT usually is not.</h2>
            </div>
            <div className="grid gap-4">
              <p className="text-sm leading-6 text-stone-600">{customsIntro}</p>
              {customsMarketGuidance.map((item) => (
                <Timeline key={item.region} title={item.region} text={item.text} />
              ))}
            </div>
          </section>

          <section className="grid gap-10 border-b border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Timeline</p>
              <h2 className="text-4xl font-light leading-tight">Preparation first, then carrier transit.</h2>
            </div>
            <div className="grid gap-4">
              <Timeline title="Artwork preparation" text="Production timing is confirmed before the order is finalized." />
              <Timeline title="Carrier transit" text="Delivery timing and format are confirmed by destination, size, finish, and carrier route." />
              <Timeline title="Oversized or custom work" text="Preparation and delivery guidance is confirmed for the selected size, finish, and carrier route." />
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
