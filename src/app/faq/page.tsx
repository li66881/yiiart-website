import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { faqItems, returnHighlights, shippingHighlights, trustPrinciples } from "@/lib/policy-content"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Artwork Buying FAQ",
  description:
    "Answers about YiiArt original paintings, certificates of authenticity, worldwide shipping, returns, packaging, and commissions.",
  path: "/faq",
})

export default function FAQPage() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqItems)) }}
      />
      <main className="min-h-screen bg-[#fbfaf6] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Help center</p>
              <h1 className="text-5xl font-light leading-tight">Artwork buying FAQ</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Clear answers for buying original handmade paintings, custom canvas art, shipping, returns, and room-size advice.
            </p>
          </section>

          <section className="grid gap-5 py-14 md:grid-cols-4">
            {trustPrinciples.map((item) => (
              <Info key={item.title} title={item.title} text={item.text} />
            ))}
          </section>

          <section className="grid gap-10 border-y border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Common questions</p>
              <h2 className="text-4xl font-light leading-tight">Before you choose a painting</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {faqItems.map((item) => (
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
          </section>

          <section className="grid gap-5 py-14 md:grid-cols-2 lg:grid-cols-4">
            {[...shippingHighlights, ...returnHighlights].slice(0, 4).map((item) => (
              <Info key={item.title} title={item.title} text={item.text} />
            ))}
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
