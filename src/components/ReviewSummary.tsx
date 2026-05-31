import ReviewStars from "@/components/ReviewStars"
import type { ReviewStats } from "@/lib/reviews"

type ReviewSummaryProps = {
  stats: ReviewStats
}

const rows = [
  ["Artwork quality", "artworkQuality"],
  ["Texture & color accuracy", "textureColorAccuracy"],
  ["Packaging & delivery", "packagingDelivery"],
  ["Customer support", "customerSupport"],
  ["Room fit", "roomFit"],
] as const

export default function ReviewSummary({ stats }: ReviewSummaryProps) {
  if (stats.count === 0) {
    return (
      <div className="border p-5">
        <p className="text-lg font-medium">No reviews yet</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Verified collector reviews will appear here after customers share their real experience.
        </p>
      </div>
    )
  }

  return (
    <div className="border p-5">
      <div className="flex flex-wrap items-center gap-3">
        <ReviewStars rating={stats.overall} />
        <p className="text-2xl font-light">{stats.overall.toFixed(1)} out of 5</p>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Based on {stats.count} verified {stats.count === 1 ? "review" : "reviews"}
      </p>
      <div className="mt-5 space-y-2 text-sm">
        {rows.map(([label, key]) => (
          <div key={key} className="flex justify-between gap-4">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{stats[key] ? stats[key].toFixed(1) : "Not rated"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
