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
      <main className="min-h-screen bg-[#fbfaf6] px-4 pb-20 pt-[var(--ya-header-offset)] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Shipping</p>
              <h1 className="text-5xl font-light leading-tight">Shipping original artwork safely.</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Shipping is free worldwide and included in the price. Every painting travels insured with an express
              carrier such as DHL, FedEx, or UPS, with tracking emailed the day it ships.
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
              <Timeline title="Artwork preparation: 3-5 business days" text="Ready-made works are inspected, photographed before packing, documented, and handed to the carrier within 3-5 business days of your order." />
              <Timeline title="International transit: 5-10 business days" text="Express carriers such as DHL, FedEx, or UPS usually deliver within 5-10 business days of dispatch. Import duties and local taxes, where applicable, are set by the destination country and collected by the carrier." />
              <Timeline title="Oversized or custom work: 2-4 weeks production" text="Commissioned paintings need 2-4 weeks for production and drying before dispatch. Very large works may need extra freight coordination, confirmed with you in advance." />
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
