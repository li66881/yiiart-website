import Link from "next/link"
import ReviewStars from "@/components/ReviewStars"
import TranslatedText, { TranslatedOption } from "@/components/TranslatedText"
import { formatDimensions, pickEnglish } from "@/lib/artwork-display"
import { formatReviewDate, hasPermittedPhotos, isVerifiedCollector, reviewLocation, type PublicReview } from "@/lib/reviews"

type ReviewCardProps = {
  review: PublicReview
  compact?: boolean
}

export default function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const artworkTitle = pickEnglish(review.artwork?.title, "YiiArt artwork")
  const artistName = pickEnglish(review.artist?.name, "YiiArt")
  const location = reviewLocation(review)
  const artworkHref = review.artwork?.slug?.current ? `/artwork/${review.artwork.slug.current}` : "/artworks"
  const photo = hasPermittedPhotos(review) ? review.photos?.find((item) => item.asset?.url) : undefined

  return (
    <article className="border p-5">
      <div className="flex items-start gap-4">
        {photo?.asset?.url ? (
          <img
            src={photo.asset.url}
            alt={photo.alt || `${artworkTitle} in ${review.roomType || "a collector space"}`}
            className="h-20 w-20 flex-shrink-0 object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ReviewStars rating={review.overallRating} size="sm" />
            {isVerifiedCollector(review) && (
              <span
                className="bg-gray-100 px-2 py-1 text-xs text-gray-600"
                title="This review is connected to a real YiiArt purchase or a manually verified collector experience."
              >
                <TranslatedText k="reviews.verifiedCollector" />
              </span>
            )}
          </div>
          <h3 className="mt-3 font-medium">{review.reviewTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{review.reviewText}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-500">
        <p>
          {review.customerName || <TranslatedText k="reviews.collector" />}
          {location ? ` · ${location}` : ""}
          {formatReviewDate(review) ? ` · ${formatReviewDate(review)}` : ""}
        </p>
        {!compact && (
          <>
            <p>
              <TranslatedText k="reviews.purchased" />: <Link href={artworkHref} className="text-black underline underline-offset-4">{artworkTitle}</Link>
              {artistName ? <> <TranslatedText k="reviews.by" /> {artistName}</> : ""}
            </p>
            {review.artwork?.dimensions && <p><TranslatedText k="reviews.size" />: {formatDimensions(review.artwork.dimensions)}</p>}
            {review.roomType && <p><TranslatedText k="reviews.room" />: <TranslatedOption value={review.roomType} /></p>}
          </>
        )}
      </div>

      {review.storeReply && (
        <div className="mt-4 border-l-2 border-black pl-4 text-sm text-gray-600">
          <p className="font-medium text-black"><TranslatedText k="reviews.reply" /></p>
          <p className="mt-1 leading-6">{review.storeReply}</p>
        </div>
      )}
    </article>
  )
}
