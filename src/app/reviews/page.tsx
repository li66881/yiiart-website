import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewFilters from "@/components/ReviewFilters"
import ReviewSummary from "@/components/ReviewSummary"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { buildSeoMetadata } from "@/lib/seo"
import { getApprovedReviews, getReviewStats } from "@/lib/reviews"
import { statsForReviews, withSampleReviewsFallback } from "@/lib/sample-reviews"

export const dynamic = "force-dynamic"

export const metadata = buildSeoMetadata({
  title: "Customer Reviews",
  description:
    "Honest feedback from collectors who chose YiiArt original artworks for their homes and spaces.",
  path: "/reviews",
})

export default async function ReviewsPage() {
  const reviews = withSampleReviewsFallback(await getApprovedReviews({ limit: 80 }))
  const stats = reviews.some((review) => review._id.startsWith("sample-"))
    ? statsForReviews(reviews)
    : getReviewStats(reviews)

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-[#181613]">
      <Header />
      <main className="flex-1 pb-20 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <section className="border-b border-stone-200 pb-12">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
              Real reviews from collectors
            </p>
            <h1 className="text-4xl font-medium tracking-[-0.03em] md:text-5xl">Customer Reviews</h1>
            <p className="mt-5 max-w-3xl text-stone-600">
              Honest feedback from collectors who chose YiiArt original artworks for their homes and spaces.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-500">
              We only publish reviews connected to real collector experiences. Reviews may include feedback about artwork
              quality, color accuracy, texture, packaging, delivery, customer support, and how the artwork feels in the room.
            </p>
          </div>
        </section>

        <section className="pt-12">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-10">
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
