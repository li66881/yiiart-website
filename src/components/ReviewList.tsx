import ReviewCard from "@/components/ReviewCard"
import TranslatedText from "@/components/TranslatedText"
import type { ReactNode } from "react"
import type { PublicReview } from "@/lib/reviews"

type ReviewListProps = {
  reviews: PublicReview[]
  emptyText?: ReactNode
}

export default function ReviewList({ reviews, emptyText }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="border p-6 text-sm leading-6 text-gray-600">
        {emptyText || <TranslatedText k="reviews.emptyPublic" />}
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
