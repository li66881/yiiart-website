"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import type { GoogleReviewOptIn } from "@/lib/google-customer-reviews"

declare global {
  interface Window {
    gapi?: {
      load: (name: string, callback: () => void) => void
      surveyoptin: { render: (options: GoogleReviewOptIn) => void }
    }
    yiiartReviewInvitations?: Set<string>
  }
}

export default function GoogleCustomerReviews({ invitation }: { invitation: GoogleReviewOptIn | null }) {
  const [isLiveSite, setIsLiveSite] = useState(false)
  useEffect(() => {
    setIsLiveSite(window.location.protocol === "https:"
      && ["www.yiiart.com", "yiiart.com"].includes(window.location.hostname))
  }, [])

  if (!invitation || !isLiveSite) return null

  const render = () => {
    const api = window.gapi
    if (!api) return
    const seen = window.yiiartReviewInvitations ||= new Set()
    if (seen.has(invitation.order_id)) return
    seen.add(invitation.order_id)
    try {
      api.load("surveyoptin", () => {
        try {
          api.surveyoptin.render(invitation)
        } catch {
          seen.delete(invitation.order_id)
        }
      })
    } catch {
      // Review services must never interrupt order confirmation.
      seen.delete(invitation.order_id)
    }
  }

  return <Script id="google-customer-reviews" src="https://apis.google.com/js/platform.js" strategy="afterInteractive" onReady={render} />
}
