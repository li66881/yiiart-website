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
  adviceItems,
}: {
  framingNotes?: string | null
  adviceItems: ProductDetailAdviceItem[]
}) {
  return {
    presentationNote: typeof framingNotes === "string" ? framingNotes.trim() : "",
    supplementalAdvice: adviceItems.flatMap((item, translationIndex) =>
      consolidatedAdviceIds.has(item.id) ? [] : [{ ...item, translationIndex }]
    ),
  }
}
