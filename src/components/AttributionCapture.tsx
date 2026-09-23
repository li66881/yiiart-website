"use client"

import { useEffect } from "react"
import { ATTRIBUTION_STORAGE_KEY, parseEnquiryAttribution } from "@/lib/attribution"

export default function AttributionCapture() {
  useEffect(() => {
    try {
      const storedRaw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
      const stored = storedRaw ? JSON.parse(storedRaw) : null
      const next = parseEnquiryAttribution({
        currentPath: `${window.location.pathname}${window.location.search}`,
        search: window.location.search,
        stored,
      })
      window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage failures; enquiry forms still work without stored UTM.
    }
  }, [])

  return null
}
