import ReviewList from "@/components/ReviewList"
import ReviewSummary from "@/components/ReviewSummary"
import TranslatedText from "@/components/TranslatedText"
import type { PublicReview, ReviewStats } from "@/lib/reviews"

type ArtworkReviewSectionProps = {
  reviews: PublicReview[]
  stats: ReviewStats
}

export default function ArtworkReviewSection({ reviews, stats }: ArtworkReviewSectionProps) {
  return (
    <section className="mt-16 border-t pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light"><TranslatedText k="reviews.sectionTitle" /></h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          <TranslatedText k="reviews.sectionDesc" />
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <ReviewSummary stats={stats} />
        <ReviewList
          reviews={reviews}
          emptyText={<TranslatedText k="reviews.emptyArtwork" />}
        />
      </div>
    </section>
  )
}
