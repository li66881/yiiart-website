"use client"

import { useEffect, useState } from "react"
import { formatSaleCountdown, getSaleCountdownParts } from "@/lib/storefront/sale"

const STORAGE_KEY = "yiiart-announcement-dismissed"

type Props = {
  message?: string
  saleEndsAt?: string | null
}

export default function AnnouncementBar({
  message = "SUMMER SALE: DEALS STILL GOING 40% OFF.",
  saleEndsAt = null,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(() =>
    saleEndsAt ? formatSaleCountdown(saleEndsAt) : null,
  )

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1")
  }, [])

  useEffect(() => {
    if (!saleEndsAt) {
      setCountdown(null)
      return
    }
    const tick = () => {
      const parts = getSaleCountdownParts(saleEndsAt)
      setCountdown(parts.total > 0 ? formatSaleCountdown(saleEndsAt) : null)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [saleEndsAt])

  if (dismissed) return null

  return (
    <div className="relative border-b border-[#d5d2c3] bg-[#e4e2d4] px-4 py-1.5 text-[#1d1c18]">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 pr-8 text-center text-[12px] leading-snug sm:text-[13px]">
        <p className="tracking-[0.04em]">{message}</p>
        {countdown ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold tracking-wide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#5c584e]">
              <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8.5V12l2.4 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="tabular-nums">{countdown}</span>
          </span>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-[#6f675d] hover:text-[#1d1c18]"
        onClick={() => {
          sessionStorage.setItem(STORAGE_KEY, "1")
          setDismissed(true)
        }}
      >
        ×
      </button>
    </div>
  )
}
