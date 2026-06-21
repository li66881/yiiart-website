import { client } from "@/lib/sanity"
import { getReviewPhotoUrl } from "@/lib/review-images"

export type ReviewPhoto = {
  _type?: string
  _key?: string
  key?: string
  url?: string
  alt?: string
  contentType?: string
  asset?: {
    _id?: string
    url?: string
  }
}

export type PublicReview = {
  _id: string
  verifiedBuyer?: boolean
  reviewSource?: "purchase_invite" | "manual_verified" | "imported_verified"
  customerName?: string
  customerCity?: string
  customerCountry?: string
  overallRating?: number
  artworkQualityRating?: number
  textureColorAccuracyRating?: number
  packagingDeliveryRating?: number
  customerSupportRating?: number
  roomFitRating?: number
  reviewTitle?: string
  reviewText?: string
  roomType?: string
  photos?: ReviewPhoto[]
  cloudflarePhotos?: ReviewPhoto[]
  photoPermission?: boolean
  featured?: boolean
  featuredOnHome?: boolean
  featuredOnGallery?: boolean
  storeReply?: string
  submittedAt?: string
  approvedAt?: string
  artwork?: {
    _id?: string
    title?: { en?: string; zh?: string }
    slug?: { current?: string }
    dimensions?: string
    cloudflareImages?: any[]
    images?: any[]
  }
  artist?: {
    _id?: string
    name?: { en?: string; zh?: string } | string
    slug?: { current?: string }
  }
}

export type ReviewStats = {
  count: number
  overall: number
  artworkQuality: number
  textureColorAccuracy: number
  packagingDelivery: number
  customerSupport: number
  roomFit: number
}

export type ReviewInvite = {
  _id: string
  artwork?: {
    _id?: string
    title?: { en?: string; zh?: string }
    slug?: { current?: string }
    dimensions?: string
    artist?: {
      _id?: string
      name?: { en?: string; zh?: string } | string
    }
  }
  orderIdInternal?: string
  customerEmailHash?: string
  customerName?: string
  token?: string
  expiresAt?: string
  usedAt?: string
  status?: "active" | "used" | "expired"
}

type ReviewQueryOptions = {
  artworkId?: string
  featured?: boolean
  featuredOnHome?: boolean
  featuredOnGallery?: boolean
  limit?: number
}

const publicReviewFilter = `
  _type == "review"
  && status == "approved"
  && displayPermission == true
  && (
    verifiedBuyer == true
    || reviewSource in ["purchase_invite", "manual_verified", "imported_verified"]
  )
`

const reviewProjection = `{
  _id,
  verifiedBuyer,
  reviewSource,
  customerName,
  customerCity,
  customerCountry,
  overallRating,
  artworkQualityRating,
  textureColorAccuracyRating,
  packagingDeliveryRating,
  customerSupportRating,
  roomFitRating,
  reviewTitle,
  reviewText,
  roomType,
  photos[]{
    ...,
    asset->{_id, url}
  },
  cloudflarePhotos[]{
    _key,
    key,
    url,
    alt,
    contentType
  },
  photoPermission,
  featured,
  featuredOnHome,
  featuredOnGallery,
  storeReply,
  submittedAt,
  approvedAt,
  artwork->{
    _id,
    title,
    slug,
    dimensions,
    cloudflareImages,
    images
  },
  artist->{
    _id,
    name,
    slug
  }
}`

export async function getApprovedReviews(options: ReviewQueryOptions = {}): Promise<PublicReview[]> {
  const filters = [publicReviewFilter]
  const params: Record<string, string | boolean> = {}

  if (options.artworkId) {
    filters.push("artwork._ref == $artworkId")
    params.artworkId = options.artworkId
  }
  if (options.featured !== undefined) {
    filters.push("featured == $featured")
    params.featured = options.featured
  }
  if (options.featuredOnHome !== undefined) {
    filters.push("featuredOnHome == $featuredOnHome")
    params.featuredOnHome = options.featuredOnHome
  }
  if (options.featuredOnGallery !== undefined) {
    filters.push("featuredOnGallery == $featuredOnGallery")
    params.featuredOnGallery = options.featuredOnGallery
  }

  const limit = Number.isFinite(options.limit) ? Math.max(1, Math.min(Number(options.limit), 100)) : 50
  const query = `*[${filters.join(" && ")}] | order(sortOrder asc, approvedAt desc, submittedAt desc)[0...${limit}]${reviewProjection}`

  try {
    return await client.fetch(query, params)
  } catch {
    return []
  }
}

export async function getArtworkReviews(artworkId: string) {
  return getApprovedReviews({ artworkId, limit: 20 })
}

export async function getFeaturedReviews(limit = 6) {
  const homeReviews = await getApprovedReviews({ featuredOnHome: true, limit })
  if (homeReviews.length > 0) return homeReviews
  return getApprovedReviews({ featured: true, limit })
}

export async function getRealHomeReviews(limit = 60) {
  const galleryReviews = await getApprovedReviews({ featuredOnGallery: true, limit })
  return galleryReviews.filter((review) => hasPermittedPhotos(review))
}

export function getReviewStats(reviews: PublicReview[]): ReviewStats {
  return {
    count: reviews.length,
    overall: averageRating(reviews, "overallRating"),
    artworkQuality: averageRating(reviews, "artworkQualityRating"),
    textureColorAccuracy: averageRating(reviews, "textureColorAccuracyRating"),
    packagingDelivery: averageRating(reviews, "packagingDeliveryRating"),
    customerSupport: averageRating(reviews, "customerSupportRating"),
    roomFit: averageRating(reviews, "roomFitRating"),
  }
}

export function isVerifiedCollector(review: PublicReview) {
  return Boolean(
    review.verifiedBuyer
      || review.reviewSource === "purchase_invite"
      || review.reviewSource === "manual_verified"
      || review.reviewSource === "imported_verified"
  )
}

export function hasPermittedPhotos(review: PublicReview) {
  return getPermittedReviewPhotos(review).length > 0
}

export function getPermittedReviewPhotos(review: PublicReview) {
  if (!review.photoPermission) return []
  return [...(review.cloudflarePhotos || []), ...(review.photos || [])].filter((photo) => getReviewPhotoUrl(photo))
}

export function reviewLocation(review: PublicReview) {
  return [review.customerCity, review.customerCountry].filter(Boolean).join(", ")
}

export function formatReviewDate(review: PublicReview) {
  const value = review.approvedAt || review.submittedAt
  if (!value) return ""

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export async function getReviewInviteByToken(token: string): Promise<ReviewInvite | null> {
  if (!token) return null
  if (token.length < 12) return null

  try {
    return await client.fetch(
      `*[_type == "reviewInvite" && token == $token][0]{
        _id,
        orderIdInternal,
        customerEmailHash,
        customerName,
        token,
        expiresAt,
        usedAt,
        status,
        artwork->{
          _id,
          title,
          slug,
          dimensions,
          artist->{_id, name}
        }
      }`,
      { token }
    )
  } catch {
    return null
  }
}

export function getInviteStatus(invite: ReviewInvite | null) {
  if (!invite) return "missing"
  if (invite.status === "used" || invite.usedAt) return "used"
  if (invite.status === "expired") return "expired"
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) return "expired"
  if (invite.status !== "active") return "invalid"
  return "active"
}

function averageRating(reviews: PublicReview[], key: keyof PublicReview) {
  const values = reviews
    .map((review) => Number(review[key]))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (values.length === 0) return 0

  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.round(average * 10) / 10
}
