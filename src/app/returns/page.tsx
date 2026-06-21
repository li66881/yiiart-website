import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { contactEmail } from "@/lib/site"
import { returnHighlights } from "@/lib/policy-content"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Returns and Refunds",
  description:
    "YiiArt offers a 30-day return window after delivery for eligible original artwork orders, with support for damaged shipments.",
  path: "/returns",
})

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbfaf6] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Returns</p>
              <h1 className="text-5xl font-light leading-tight">Clear return terms for original art.</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Eligible ready-made artworks can be returned within 30 days of delivery. Custom or commissioned works
              may have separate terms confirmed before production because they are made for a specific request.
            </p>
          </section>

          <section className="grid gap-5 py-14 md:grid-cols-2 lg:grid-cols-4">
            {returnHighlights.map((item) => (
              <Info key={item.title} title={item.title} text={item.text} />
            ))}
          </section>

          <section className="grid gap-10 border-y border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">How to request a return</p>
              <h2 className="text-4xl font-light leading-tight">Contact YiiArt before shipping anything back.</h2>
            </div>
            <ol className="grid gap-4">
              {[
                `Contact ${contactEmail} within the return window and include your order number and artwork title.`,
                "Share the reason for return and photos if the artwork arrived damaged or materially different from the listing.",
                "Wait for return packing and shipping instructions before sending the artwork back.",
                "Pack the artwork securely in original packaging when possible, with all documentation included.",
              ].map((item, index) => (
                <li key={item} className="border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-600">
                  <span className="mb-2 block text-xs uppercase text-stone-400">Step 0{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
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
