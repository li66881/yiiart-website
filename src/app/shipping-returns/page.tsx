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
    title: "Ready-made: 3-5 business days",
    text: "Ready-made paintings are inspected, photographed before packing, documented, and dispatched within 3-5 business days of your order.",
  },
  {
    title: "Custom: 2-4 weeks",
    text: "Custom paintings need 2-4 weeks for production, drying, and review before dispatch. The exact timeline is confirmed with you before production begins.",
  },
  {
    title: "Certificate included",
    text: "Every original ships with a signed certificate of authenticity and care instructions inside the package.",
  },
]

const shippingItems = [
  {
    title: "Free worldwide shipping",
    text: "Shipping is included in the price for every destination we serve. Artwork travels with express carriers such as DHL, FedEx, or UPS, typically arriving 5-10 business days after dispatch.",
  },
  {
    title: "Tracked and insured",
    text: "Tracking is emailed the day your artwork ships. Every shipment is fully insured by YiiArt from the studio to your door.",
  },
  {
    title: "Carefully packaged artwork",
    text: "Oversized canvas works ship rolled in a rigid tube for safety; smaller or ready-to-hang works ship flat in reinforced boxes or wooden crates.",
  },
]

const damageItems = [
  {
    title: "Report within 48 hours",
    text: "If artwork arrives damaged, contact YiiArt within 48 hours with photos of the artwork, outer box, inner packaging, and shipping label.",
  },
  {
    title: "Keep the packaging",
    text: "Please keep all packaging until the issue is resolved. Carriers require packaging evidence for the insurance claim.",
  },
  {
    title: "Replacement or full refund",
    text: "Because every shipment is insured, YiiArt will arrange a free replacement or a full refund - the insurance claim is our job, not yours.",
  },
]

const returnItems = [
  {
    title: "30 days, any reason",
    text: "Ready-made artwork can be returned within 30 days of delivery for any reason. After approval you have 14 days to ship it back in original condition; the refund is issued within 5 business days of the artwork arriving back.",
  },
  {
    title: "Custom paintings",
    text: "Custom paintings are made for your specific size, palette, and room, so they are final sale once production is complete. Cancellation is free before production starts, and transit damage is always covered.",
  },
  {
    title: "Before shipping anything back",
    text: `Contact ${contactEmail} first and wait for return packing and shipping instructions before sending artwork back. Change-of-mind return shipping is paid by the buyer; damaged or not-as-described returns are fully covered by YiiArt.`,
  },
]

const shippingReturnFaqs = [
  {
    question: "How much does shipping cost?",
    answer: "Nothing - shipping is free worldwide and included in the price. Express carriers such as DHL, FedEx, or UPS deliver within 5-10 business days of dispatch, and every shipment is insured door to door.",
  },
  {
    question: "How is the painting packed?",
    answer: "Oversized canvas ships rolled in a rigid tube; smaller or ready-to-hang works ship flat in reinforced boxes or wooden crates. Every package includes the signed certificate of authenticity.",
  },
  {
    question: "Will I receive tracking?",
    answer: "Yes. Tracking is emailed the day your artwork ships so you can follow the delivery from dispatch to your door.",
  },
  {
    question: "What if the painting arrives damaged?",
    answer: "Keep the artwork and all packaging, then contact YiiArt within 48 hours with photos of the artwork, box, inner packaging, and shipping label. We will arrange a free replacement or a full refund.",
  },
  {
    question: "Who pays for return shipping, and when do I get my refund?",
    answer: "For change-of-mind returns the buyer covers return shipping; for damaged or not-as-described artwork YiiArt covers everything. Refunds go to the original payment method within 5 business days after the returned artwork is received.",
  },
  {
    question: "Can I return a custom painting?",
    answer: "Custom paintings are final sale because they are made for a specific request. You can cancel free of charge before production starts, and damage in transit is always covered by a replacement or full refund.",
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
      <main className="flex-1 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
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
