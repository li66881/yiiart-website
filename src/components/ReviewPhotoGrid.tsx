import Link from "next/link"
import { pickEnglish } from "@/lib/artwork-display"
import { hasPermittedPhotos, reviewLocation, type PublicReview } from "@/lib/reviews"

type ReviewPhotoGridProps = {
  reviews: PublicReview[]
}

export default function ReviewPhotoGrid({ reviews }: ReviewPhotoGridProps) {
  const items = reviews.flatMap((review) => {
    if (!hasPermittedPhotos(review)) return []
    return (review.photos || [])
      .filter((photo) => photo.asset?.url)
      .map((photo) => ({ review, photo }))
  })

  if (items.length === 0) {
    return (
      <div className="border p-8 text-center text-gray-600">
        Real home photos will appear here as collectors begin sharing their spaces.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ review, photo }) => {
        const artworkTitle = pickEnglish(review.artwork?.title, "YiiArt artwork")
        const artistName = pickEnglish(review.artist?.name, "YiiArt")
        const artworkHref = review.artwork?.slug?.current ? `/artwork/${review.artwork.slug.current}` : "/artworks"

        return (
          <article key={`${review._id}-${photo._key || photo.asset?.url}`} className="group">
            <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src={photo.asset!.url!}
                alt={photo.alt || `${artworkTitle} in ${review.roomType || "a collector space"}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="font-medium">
              <Link href={artworkHref} className="hover:underline">{artworkTitle}</Link>
            </h2>
            <p className="text-sm text-gray-500">{artistName}</p>
            <p className="mt-1 text-sm text-gray-500">
              {[review.roomType, reviewLocation(review)].filter(Boolean).join(" · ")}
            </p>
            {review.reviewText && <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{review.reviewText}</p>}
          </article>
        )
      })}
    </div>
  )
}
