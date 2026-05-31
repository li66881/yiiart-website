import Link from "next/link"
import ReviewCard from "@/components/ReviewCard"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import type { PublicReview } from "@/lib/reviews"

type FeaturedReviewsProps = {
  reviews: PublicReview[]
  compact?: boolean
}

export default function FeaturedReviews({ reviews, compact = false }: FeaturedReviewsProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl font-light">What Collectors Say</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Real feedback from collectors who brought YiiArt original paintings into their homes.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Every review comes from a real collector experience. We welcome honest feedback about artwork quality,
            texture, color accuracy, packaging, delivery, and how the artwork feels in the space.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, compact ? 3 : 6).map((review) => (
              <ReviewCard key={review._id} review={review} compact />
            ))}
          </div>
        ) : (
          <ReviewTrustBadge />
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/reviews" className="bg-black px-5 py-3 text-sm text-white">
            Read All Reviews
          </Link>
          <Link href="/art-in-real-homes" className="border px-5 py-3 text-sm">
            View Art in Real Homes
          </Link>
        </div>
      </div>
    </section>
  )
}
