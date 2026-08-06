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
    <section className="border-y border-stone-200 bg-[#f7f5f0] py-16 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Customer reviews</p>
            <h2 className="text-3xl font-medium tracking-[-0.02em] md:text-4xl"><TranslatedText k="reviews.featuredTitle" /></h2>
          </div>
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
          <Link href="/reviews" className="inline-flex min-h-11 items-center rounded-full bg-[#111] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]">
            <TranslatedText k="reviews.readAll" />
          </Link>
          <Link href="/art-in-real-homes" className="inline-flex min-h-11 items-center border border-stone-300 px-5 text-sm transition hover:border-black">
            <TranslatedText k="reviews.viewRealHomes" />
          </Link>
        </div>
      </div>
    </section>
  )
}
