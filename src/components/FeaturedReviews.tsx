import Link from "next/link"
import ReviewCard from "@/components/ReviewCard"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import TranslatedText from "@/components/TranslatedText"
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
          <h2 className="text-3xl font-light"><TranslatedText k="reviews.featuredTitle" /></h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            <TranslatedText k="reviews.featuredDesc1" />
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            <TranslatedText k="reviews.featuredDesc2" />
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
            <TranslatedText k="reviews.readAll" />
          </Link>
          <Link href="/art-in-real-homes" className="border px-5 py-3 text-sm">
            <TranslatedText k="reviews.viewRealHomes" />
          </Link>
        </div>
      </div>
    </section>
  )
}
