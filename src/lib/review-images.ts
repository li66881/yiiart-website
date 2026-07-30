import type { ReviewPhoto } from "@/lib/reviews"

export function getReviewPhotoUrl(photo?: ReviewPhoto | null) {
  return photo?.url || photo?.asset?.url || ""
}
