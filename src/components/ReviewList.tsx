import ReviewCard from "@/components/ReviewCard"
import type { PublicReview } from "@/lib/reviews"

type ReviewListProps = {
  reviews: PublicReview[]
  emptyText?: string
}

export default function ReviewList({ reviews, emptyText = "No verified reviews are public yet." }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="border p-6 text-sm leading-6 text-gray-600">
        {emptyText}
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  )
}
