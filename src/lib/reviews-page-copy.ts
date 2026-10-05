export function getReviewsPageCopy(reviewCount: number) {
  const hasPublicReviews = reviewCount > 0

  return {
    eyebrow: hasPublicReviews ? "Real Reviews from Real Collectors" : "Verified Collector Feedback",
    description: hasPublicReviews
      ? "Honest feedback from collectors who chose YiiArt original artworks for their homes and spaces."
      : "We are collecting our first verified reviews from YiiArt collectors. Each submission is reviewed before publication.",
    editorialNote: hasPublicReviews
      ? "We only publish reviews connected to real collector experiences. Reviews may include feedback about artwork quality, color accuracy, texture, packaging, delivery, customer support, and how the artwork feels in the room."
      : undefined,
  }
}
