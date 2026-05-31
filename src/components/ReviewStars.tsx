type ReviewStarsProps = {
  rating?: number
  size?: "sm" | "md"
}

export default function ReviewStars({ rating = 0, size = "md" }: ReviewStarsProps) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))
  const rounded = Math.round(safeRating)
  const label = safeRating > 0 ? `Rated ${safeRating.toFixed(1)} out of 5.` : "No rating yet."

  return (
    <span className={`inline-flex items-center gap-1 ${size === "sm" ? "text-sm" : "text-base"}`} aria-label={label}>
      <span aria-hidden="true" className="tracking-[0.12em]">
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </span>
    </span>
  )
}
