import type { PublicReview, ReviewStats } from "@/lib/reviews"
import sampleReviews from "../../content/reviews/sample-reviews.json"

type SampleReview = (typeof sampleReviews)[number]

function mapSample(review: SampleReview): PublicReview {
  return {
    _id: `sample-${review.id}`,
    verifiedBuyer: review.verifiedPurchase,
    reviewSource: "manual_verified",
    customerName: review.authorName,
    customerCity: review.location?.split(",")[0]?.trim(),
    customerCountry: review.location?.split(",")[1]?.trim(),
    overallRating: review.rating,
    reviewTitle: review.title,
    reviewText: review.body,
    submittedAt: review.createdAt,
    approvedAt: review.createdAt,
    featured: true,
    artwork: review.productTitle
      ? {
          title: { en: review.productTitle },
          slug: review.productSku ? { current: review.productSku.toLowerCase() } : undefined,
        }
      : undefined,
  }
}

export const curatedSampleReviews: PublicReview[] = sampleReviews.map(mapSample)

export function withSampleReviewsFallback(reviews: PublicReview[]): PublicReview[] {
  if (reviews.length > 0) return reviews
  return curatedSampleReviews
}

export function statsForReviews(reviews: PublicReview[]): ReviewStats {
  const count = reviews.length
  const average = (key: keyof PublicReview) => {
    if (!count) return 0
    const total = reviews.reduce((sum, review) => sum + (Number(review[key]) || 0), 0)
    return Math.round((total / count) * 10) / 10
  }

  return {
    count,
    overall: average("overallRating"),
    artworkQuality: average("artworkQualityRating") || average("overallRating"),
    textureColorAccuracy: average("textureColorAccuracyRating") || average("overallRating"),
    packagingDelivery: average("packagingDeliveryRating") || average("overallRating"),
    customerSupport: average("customerSupportRating") || average("overallRating"),
    roomFit: average("roomFitRating") || average("overallRating"),
  }
}
