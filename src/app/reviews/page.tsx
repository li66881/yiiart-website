import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewFilters from "@/components/ReviewFilters"
import ReviewSummary from "@/components/ReviewSummary"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { buildSeoMetadata } from "@/lib/seo"
import { getApprovedReviews, getReviewStats } from "@/lib/reviews"

export const dynamic = "force-dynamic"

export const metadata = buildSeoMetadata({
  title: "Customer Reviews",
  description:
    "Honest feedback from collectors who chose YiiArt original artworks for their homes and spaces.",
  path: "/reviews",
})

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews({ limit: 80 })
  const stats = getReviewStats(reviews)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <section className="border-b py-14">
          <div className="container mx-auto px-4">
            <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">Real Reviews from Real Collectors</p>
            <h1 className="text-4xl font-light md:text-5xl">Customer Reviews</h1>
            <p className="mt-5 max-w-3xl text-gray-600">
              Honest feedback from collectors who chose YiiArt original artworks for their homes and spaces.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
              We only publish reviews connected to real collector experiences. Reviews may include feedback about artwork
              quality, color accuracy, texture, packaging, delivery, customer support, and how the artwork feels in the room.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[320px_1fr]">
            <div className="space-y-5">
              <ReviewSummary stats={stats} />
              <ReviewTrustBadge />
            </div>
            <ReviewFilters reviews={reviews} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
