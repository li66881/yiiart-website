import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewFilters from "@/components/ReviewFilters"
import ReviewSummary from "@/components/ReviewSummary"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { buildSeoMetadata } from "@/lib/seo"
import { getApprovedReviews, getReviewStats } from "@/lib/reviews"
import { reviewsPageRobots } from "@/lib/real-homes-seo"
import { getReviewsPageCopy } from "@/lib/reviews-page-copy"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const reviews = await getApprovedReviews({ limit: 1 })
  const copy = getReviewsPageCopy(reviews.length)
  return buildSeoMetadata({
    title: "Customer Reviews",
    description: copy.description,
    path: "/reviews",
    robots: reviewsPageRobots(reviews.length),
  })
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews({ limit: 80 })
  const stats = getReviewStats(reviews)
  const copy = getReviewsPageCopy(reviews.length)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <section className="border-b py-14">
          <div className="container mx-auto px-4">
            <p className="mb-3 text-sm uppercase tracking-wider text-gray-500">{copy.eyebrow}</p>
            <h1 className="text-4xl font-light md:text-5xl">Customer Reviews</h1>
            <p className="mt-5 max-w-3xl text-gray-600">{copy.description}</p>
            {copy.editorialNote && <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{copy.editorialNote}</p>}
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
