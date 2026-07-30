import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PaymentBadges from "@/components/PaymentBadges"
import ReviewCard from "@/components/ReviewCard"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { contactEmail } from "@/lib/site"
import { trustPrinciples } from "@/lib/policy-content"
import { buildSeoMetadata } from "@/lib/seo"
import { getFeaturedReviews } from "@/lib/reviews"
import { curatedSampleReviews } from "@/lib/sample-reviews"

export const dynamic = "force-dynamic"

export const metadata: Metadata = buildSeoMetadata({
  title: "About YiiArt",
  description:
    "Learn how YiiArt connects collectors with independent artists through original hand-painted works, artist-first pricing, and worldwide delivery.",
  path: "/about",
})

export default async function AboutPage() {
  const featured = await getFeaturedReviews(3)
  const reviews = featured.length > 0 ? featured : curatedSampleReviews.slice(0, 3)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbfaf6] px-4 pb-20 pt-[var(--ya-header-offset)] sm:px-6 lg:px-10 lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">About YiiArt</p>
              <h1 className="text-5xl font-light leading-tight">Original art should be within reach.</h1>
            </div>
            <div className="space-y-5 text-base leading-8 text-stone-600">
              <p>
                YiiArt is a curated online platform connecting collectors around the world with talented independent
                artists in China. Our artists work in oil, acrylic, and mixed media, producing hand-painted originals
                that range from serene abstracts to expressive landscapes.
              </p>
              <p>
                Each work is genuine and unrepeatable. Every brushstroke, layer of color, and subtle surface texture is
                part of the original object you receive.
              </p>
            </div>
          </section>

          <section className="grid gap-5 py-14 md:grid-cols-4">
            {trustPrinciples.map((item) => (
              <div key={item.title} className="border-t border-stone-300 pt-5">
                <h2 className="text-xl font-medium">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-10 border-y border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Mission</p>
              <h2 className="text-4xl font-light leading-tight">A fairer path from studio to home.</h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-stone-600">
              <p>
                YiiArt keeps the buying process practical: clear artwork details, visible scale, signed documentation,
                protective packaging, tracked international delivery, and a 30-day return process.
              </p>
              <p>
                Need help before purchasing? Send room dimensions, wall photos, or artwork links. YiiArt will help
                confirm size, palette, framing, and shipping format before payment.
              </p>
              <p>Email: {contactEmail}</p>
            </div>
          </section>

          <section className="grid gap-10 border-b border-stone-200 py-14 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">What you can count on</p>
              <h2 className="text-4xl font-light leading-tight">Concrete promises, not slogans.</h2>
            </div>
            <div className="space-y-6">
              <ul className="grid gap-4 text-sm leading-6 text-stone-600 sm:grid-cols-2">
                <li className="border border-stone-200 bg-white p-5">
                  <span className="block font-medium text-stone-900">Replies within 12 hours</span>
                  Questions by email or WhatsApp are answered within 12 hours, including extra photos or a short video of any artwork before you buy.
                </li>
                <li className="border border-stone-200 bg-white p-5">
                  <span className="block font-medium text-stone-900">Free insured shipping</span>
                  Shipping is included in the price, fully insured door to door, with tracking emailed at dispatch and delivery in 5-10 business days.
                </li>
                <li className="border border-stone-200 bg-white p-5">
                  <span className="block font-medium text-stone-900">30-day returns</span>
                  Ready-made works can be returned within 30 days for any reason, with the refund issued within 5 business days of the artwork arriving back.
                </li>
                <li className="border border-stone-200 bg-white p-5">
                  <span className="block font-medium text-stone-900">Signed certificate</span>
                  Every original ships with a signed certificate of authenticity and care instructions in the package.
                </li>
              </ul>
              <PaymentBadges />
            </div>
          </section>

          <section className="mt-14">
            <div className="mb-8 max-w-3xl">
              <h2 className="text-3xl font-light">Trusted by Collectors</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Every YiiArt review comes from a real collector experience. We welcome honest feedback about artwork
                quality, color accuracy, texture, packaging, delivery, and how the artwork feels in the space.
              </p>
            </div>
            {reviews.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-3">
                {reviews.slice(0, 3).map((review) => (
                  <ReviewCard key={review._id} review={review} compact />
                ))}
              </div>
            ) : (
              <ReviewTrustBadge />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
