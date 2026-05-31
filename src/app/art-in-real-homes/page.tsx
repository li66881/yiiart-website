import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewPhotoGrid from "@/components/ReviewPhotoGrid"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { buildSeoMetadata } from "@/lib/seo"
import { getRealHomeReviews } from "@/lib/reviews"

export const dynamic = "force-dynamic"

export const metadata = buildSeoMetadata({
  title: "Art in Real Homes",
  description:
    "See how YiiArt original paintings look in real living rooms, bedrooms, offices, and curated interiors.",
  path: "/art-in-real-homes",
})

export default async function ArtInRealHomesPage() {
  const reviews = await getRealHomeReviews()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <section className="border-b py-14">
          <div className="container mx-auto px-4">
            <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">Art in Real Homes</p>
            <h1 className="text-4xl font-light md:text-5xl">Art in Real Homes</h1>
            <p className="mt-5 max-w-3xl text-gray-600">
              See how YiiArt original paintings look in real living rooms, bedrooms, offices, and curated interiors.
            </p>
            <p className="mt-3 text-sm text-gray-500">These photos are shared by collectors with permission.</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl">
              <ReviewTrustBadge />
            </div>
            <ReviewPhotoGrid reviews={reviews} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
