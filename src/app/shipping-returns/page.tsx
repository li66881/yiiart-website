import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { customsIntro, customsMarketGuidance, returnHighlights, shippingHighlights, trustPrinciples } from "@/lib/policy-content"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Shipping & Returns",
  description:
    "YiiArt shipping, packaging, damage protection, and return guidance for handmade paintings, ready-made artwork, and custom canvas orders.",
  path: "/shipping-returns",
})

const processingItems = [
  {
    title: "Processing confirmed per order",
    text: "Preparation and production timing depends on the selected size, finish, surface, and current studio workload.",
  },
  {
    title: "Production timing",
    text: "Production timing is confirmed before the order is finalized.",
  },
  {
    title: "Hand-painted artwork",
    text: "Physical hand-painted artwork, not a printed reproduction.",
  },
]

const shippingItems = shippingHighlights

const damageItems = [
  trustPrinciples[3],
  returnHighlights[3],
]

const returnItems = returnHighlights

const shippingReturnFaqs = [
  {
    question: "How much does shipping cost?",
    answer: "Delivery timing and format are confirmed by destination, size, finish, and carrier route.",
  },
  {
    question: "How is the painting packed?",
    answer: "Packaging is selected for the artwork size, finish, texture, and carrier route.",
  },
  {
    question: "Will I receive tracking?",
    answer: "Tracking information is shared when the selected carrier service provides it.",
  },
  {
    question: "Will I have to pay customs duties or taxes?",
    answer:
      "Duties and local taxes may be charged by the destination country. YiiArt does not currently collect them at checkout. Many destinations charge no customs duty on original hand-painted paintings, but the United Kingdom, EU, Canada, and Australia still often collect import VAT or GST through the courier. See the Shipping page for destination notes.",
  },
  {
    question: "What if the painting arrives damaged?",
    answer: "Keep the artwork and all packaging and send clear photos so YiiArt can review the issue and available carrier process.",
  },
  {
    question: "Who pays for return shipping, and when do I get my refund?",
    answer: "Standard and custom orders may have different conditions; contact YiiArt with the order details before returning artwork.",
  },
  {
    question: "Can I return a custom painting?",
    answer: "Custom sizes, colors, and compositions may have different cancellation and return conditions confirmed before production.",
  },
]

export default function ShippingReturnsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shipping & Returns", path: "/shipping-returns" },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(shippingReturnFaqs)) }}
      />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Shipping & Returns</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">Shipping, returns, and damage support for handmade art.</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              These policies are written for hand-painted paintings, ready-made canvas art, and custom artwork requests.
              Exact handling can vary by artwork size, surface, destination, and confirmed order terms. Duties and local
              taxes may be charged by the destination country.
            </p>
          </div>
        </section>

        <PolicySection eyebrow="Processing Time" title="Preparation happens before carrier transit." items={processingItems} />
        <PolicySection eyebrow="Shipping" title="Worldwide shipping with careful packaging." items={shippingItems} />
        <PolicySection
          eyebrow="Import charges"
          title="Duty is often zero. Import VAT usually is not."
          intro={customsIntro}
          items={customsMarketGuidance.map((item) => ({ title: item.region, text: item.text }))}
        />
        <PolicySection eyebrow="Damage Protection" title="What to do if artwork arrives damaged." items={damageItems} />
        <PolicySection eyebrow="Returns" title="Ready-made and custom artwork have different conditions." items={returnItems} />

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">FAQ</p>
              <h2 className="text-4xl font-light leading-tight">Shipping and return questions</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {shippingReturnFaqs.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {item.question}
                      <span className="text-stone-400 group-open:hidden">+</span>
                      <span className="hidden text-stone-400 group-open:inline">-</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 border border-stone-200 bg-white p-6 md:flex-row md:items-center">
            <p className="max-w-3xl text-sm leading-6 text-stone-600">
              For more detail, you can still read the standalone shipping and returns pages. Their content is shared from
              editable policy copy so future policy updates stay consistent.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/shipping" className="underline underline-offset-4">Shipping</Link>
              <Link href="/returns" className="underline underline-offset-4">Returns</Link>
              <Link href="/faq" className="underline underline-offset-4">FAQ</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function PolicySection({
  eyebrow,
  title,
  intro,
  items,
}: {
  eyebrow: string
  title: string
  intro?: string
  items: Array<{ title: string; text: string }>
}) {
  return (
    <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm uppercase text-stone-500">{eyebrow}</p>
          <h2 className="text-4xl font-light leading-tight">{title}</h2>
          {intro ? <p className="mt-4 text-sm leading-6 text-stone-600">{intro}</p> : null}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <Info key={item.title} title={item.title} text={item.text} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-stone-300 pt-5">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
