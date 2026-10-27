import { normalizePublicFramingNotes } from "./framing-notes"

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
  const presentationNote = normalizePublicFramingNotes(framingNotes, shippingProfile)
  return {
    presentationNote,
    supplementalAdvice: adviceItems.flatMap((item, translationIndex) =>
      consolidatedAdviceIds.has(item.id) ? [] : [{ ...item, translationIndex }]
    ),
  }
}
