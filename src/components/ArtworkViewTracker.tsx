"use client"

import { useEffect } from "react"
import { trackMarketingEvent } from "@/lib/marketing-events"

type ArtworkViewTrackerProps = {
  id: string
  title: string
  price: number
  currency: string
  value: number
  category?: string
}

export default function ArtworkViewTracker({
  id,
  title,
  price,
  currency,
  value,
  category,
}: ArtworkViewTrackerProps) {
  useEffect(() => {
    trackMarketingEvent("ViewContent", {
      content_ids: id,
      content_name: title,
      content_type: "product",
      content_category: category,
      currency,
      value,
      price_cny: price,
    })
  }, [category, currency, id, price, title, value])

  return null
}
