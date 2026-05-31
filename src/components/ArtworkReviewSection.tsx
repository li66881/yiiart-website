import ReviewList from "@/components/ReviewList"
import ReviewSummary from "@/components/ReviewSummary"
import type { PublicReview, ReviewStats } from "@/lib/reviews"

type ArtworkReviewSectionProps = {
  reviews: PublicReview[]
  stats: ReviewStats
}

export default function ArtworkReviewSection({ reviews, stats }: ArtworkReviewSectionProps) {
  return (
    <section className="mt-16 border-t pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light">Collector Reviews</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          See honest feedback from collectors who purchased this artwork or similar original pieces from YiiArt.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <ReviewSummary stats={stats} />
        <ReviewList
          reviews={reviews}
          emptyText="This artwork has not received a collector review yet. After purchase, verified collectors can share feedback about the artwork, texture, color, packaging, and room fit."
        />
      </div>
    </section>
  )
}
