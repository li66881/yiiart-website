"use client"

import { useMemo, useState } from "react"
import ReviewList from "@/components/ReviewList"
import { hasPermittedPhotos, type PublicReview } from "@/lib/reviews"

type ReviewFiltersProps = {
  reviews: PublicReview[]
}

const filters = [
  "All Reviews",
  "With Photos",
  "Living Room",
  "Bedroom",
  "Office",
  "Packaging",
  "Color Accuracy",
  "Texture",
]

export default function ReviewFilters({ reviews }: ReviewFiltersProps) {
  const [activeFilter, setActiveFilter] = useState("All Reviews")
  const filteredReviews = useMemo(
    () => reviews.filter((review) => matchesFilter(review, activeFilter)),
    [activeFilter, reviews]
  )

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`border px-3 py-2 text-sm transition ${activeFilter === filter ? "bg-black text-white" : "hover:border-black"}`}
          >
            {filter}
          </button>
        ))}
      </div>
      <ReviewList reviews={filteredReviews} />
    </div>
  )
}

function matchesFilter(review: PublicReview, filter: string) {
  if (filter === "All Reviews") return true
  if (filter === "With Photos") return hasPermittedPhotos(review)
  if (filter === "Living Room" || filter === "Bedroom" || filter === "Office") {
    return review.roomType === filter
  }

  const text = `${review.reviewTitle || ""} ${review.reviewText || ""}`.toLowerCase()
  if (filter === "Packaging") return text.includes("packaging") || text.includes("delivery")
  if (filter === "Color Accuracy") return text.includes("color") || text.includes("colour")
  if (filter === "Texture") return text.includes("texture")

  return true
}
