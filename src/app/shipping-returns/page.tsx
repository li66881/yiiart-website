import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { contactEmail } from "@/lib/site"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Shipping & Returns",
  description:
    "YiiArt shipping, packaging, damage protection, and return guidance for handmade paintings, ready-made artwork, and custom canvas orders.",
  path: "/shipping-returns",
})

const processingItems = [
  {
    title: "Processing Time",
    text: "Handmade paintings may require production time, final checks, documentation, protective packing, and dispatch preparation before carrier transit begins.",
  },
  {
    title: "Ready-made artwork",
    text: "Ready-made works still need careful inspection and packaging before shipment. YiiArt confirms the safest practical dispatch format for each artwork.",
  },
  {
    title: "Custom paintings",
    text: "Custom paintings may require additional production, drying, review, and packing time. Timeline expectations should be confirmed before production begins.",
  },
]

const shippingItems = [
  {
    title: "Worldwide shipping",
    text: "YiiArt can support international artwork shipping where carrier service is available for the destination and artwork format.",
  },
  {
    title: "Tracking information",
    text: "Tracking information is shared when the carrier provides it. Tracking visibility can vary by country, route, and carrier handoff.",
  },
  {
    title: "Carefully packaged artwork",
    text: "Artwork is packed according to size, surface, and safest shipping format. Oversized canvas works may ship rolled when that is safer.",
  },
]

const damageItems = [
  {
    title: "Contact us with photos",
    text: "If artwork arrives damaged, contact YiiArt promptly with photos of the artwork, outer box, inner packaging, and shipping label.",
  },
  {
    title: "Keep the packaging",
    text: "Please keep all packaging until the issue is reviewed. Carriers often require packaging evidence for damage review.",
  },
  {
    title: "Reviewed case by case",
    text: "YiiArt will review the issue and available carrier process before confirming the next step.",
  },
]

const returnItems = [
  {
    title: "Standard ready-made artwork",
    text: "Eligible ready-made artwork may follow the standard return policy when returned in original condition with documentation and approved instructions.",
  },
  {
    title: "Custom paintings",
    text: "Custom paintings may have different return conditions because they are made for a specific size, color palette, room, or request.",
  },
  {
    title: "Before shipping anything back",
    text: `Contact ${contactEmail} first and wait for return packing and shipping instructions before sending artwork back.`,
  },
]

const shippingReturnFaqs = [
  {
    question: "How is the painting packed?",
    answer: "Packaging depends on the artwork size, surface, and safest transport format. Oversized canvas may ship rolled; smaller or ready-to-hang works may ship flat when that is safer.",
  },
  {
    question: "Will I receive tracking?",
    answer: "YiiArt shares tracking information when the carrier provides it. Tracking detail and update frequency can vary by destination and carrier route.",
  },
  {
    question: "What if the painting arrives damaged?",
    answer: "Keep the artwork and all packaging, then contact YiiArt promptly with photos of the artwork, box, inner packaging, and shipping label.",
  },
  {
    question: "Can I return a custom painting?",
    answer: "Custom paintings may have different return conditions because they are made for a specific request. Terms should be confirmed before production begins.",
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
              These policies are written for original paintings, ready-made canvas art, and custom artwork requests.
              Exact handling can vary by artwork size, surface, destination, and confirmed order terms.
            </p>
          </div>
        </section>

        <PolicySection eyebrow="Processing Time" title="Preparation happens before carrier transit." items={processingItems} />
        <PolicySection eyebrow="Shipping" title="Worldwide shipping with careful packaging." items={shippingItems} />
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
  items,
}: {
  eyebrow: string
  title: string
  items: Array<{ title: string; text: string }>
}) {
  return (
    <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm uppercase text-stone-500">{eyebrow}</p>
          <h2 className="text-4xl font-light leading-tight">{title}</h2>
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
