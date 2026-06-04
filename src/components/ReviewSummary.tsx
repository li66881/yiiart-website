import ReviewStars from "@/components/ReviewStars"
import TranslatedText, { TranslatedReviewCount } from "@/components/TranslatedText"
import type { ReviewStats } from "@/lib/reviews"

type ReviewSummaryProps = {
  stats: ReviewStats
}

const rows = [
  ["reviews.metric.artworkQuality", "artworkQuality"],
  ["reviews.metric.textureColorAccuracy", "textureColorAccuracy"],
  ["reviews.metric.packagingDelivery", "packagingDelivery"],
  ["reviews.metric.customerSupport", "customerSupport"],
  ["reviews.metric.roomFit", "roomFit"],
] as const

export default function ReviewSummary({ stats }: ReviewSummaryProps) {
  if (stats.count === 0) {
    return (
      <div className="border p-5">
        <p className="text-lg font-medium"><TranslatedText k="reviews.noReviewsYet" /></p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          <TranslatedText k="reviews.noReviewsDesc" />
        </p>
      </div>
    )
  }

  return (
    <div className="border p-5">
      <div className="flex flex-wrap items-center gap-3">
        <ReviewStars rating={stats.overall} />
        <p className="text-2xl font-light">{stats.overall.toFixed(1)} <TranslatedText k="reviews.outOf5" /></p>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        <TranslatedReviewCount count={stats.count} />
      </p>
      <div className="mt-5 space-y-2 text-sm">
        {rows.map(([label, key]) => (
          <div key={key} className="flex justify-between gap-4">
            <span className="text-gray-500"><TranslatedText k={label} /></span>
            <span className="font-medium">{stats[key] ? stats[key].toFixed(1) : <TranslatedText k="reviews.notRated" />}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
