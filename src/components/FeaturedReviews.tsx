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
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.75fr_1fr]">
          <h2 className="text-4xl font-light leading-tight"><TranslatedText k="reviews.featuredTitle" /></h2>
          <div className="max-w-3xl">
          <p className="text-sm leading-6 text-stone-600">
            <TranslatedText k="reviews.featuredDesc1" />
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            <TranslatedText k="reviews.featuredDesc2" />
          </p>
          </div>
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
          <Link href="/reviews" className="bg-black px-5 py-3 text-sm text-white transition hover:bg-stone-800">
            <TranslatedText k="reviews.readAll" />
          </Link>
          <Link href="/art-in-real-homes" className="border border-stone-300 px-5 py-3 text-sm transition hover:border-black">
            <TranslatedText k="reviews.viewRealHomes" />
          </Link>
        </div>
      </div>
    </section>
  )
}
