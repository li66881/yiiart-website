export type ProductDetailStoryLayout = "with-media" | "text-only"

type ProductDetailAdviceItem = {
  id: string
  title: string
  text: string
}

const consolidatedAdviceIds = new Set(["room-fit", "framing"])

export function productDetailStoryLayout(hasEditorialMedia: boolean): ProductDetailStoryLayout {
  return hasEditorialMedia ? "with-media" : "text-only"
}

export function buildProductDetailContentModel({
  framingNotes,
  shippingProfile,
  adviceItems,
}: {
  framingNotes?: string | null
  shippingProfile?: string | null
  adviceItems: ProductDetailAdviceItem[]
}) {
  const safeFramingNotes = typeof framingNotes === "string" ? framingNotes.trim() : ""
  const presentationNote = safeFramingNotes.replace(
    /Ships rolled for direct checkout\.?/i,
    shippingProfile === "Ships rolled"
      ? "Rolled canvas is the current direct-checkout format."
      : "Delivery format is confirmed for the destination and selected size.",
  )
  return {
    presentationNote,
    supplementalAdvice: adviceItems.flatMap((item, translationIndex) =>
      consolidatedAdviceIds.has(item.id) ? [] : [{ ...item, translationIndex }]
    ),
  }
}
