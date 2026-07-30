"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "yiiart-announcement-dismissed"

type Props = {
  message?: string
  saleEndsAt?: string | null
}

function getRemaining(saleEndsAt: string) {
  const end = new Date(saleEndsAt).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function AnnouncementBar({
  message = "SUMMER STUDIO SALE: SELECTED CANVASES UP TO 40% OFF",
  saleEndsAt = null,
}: Props) {
  const [dismissed, setDismissed] = useState(true)
  const [remaining, setRemaining] = useState(() =>
    saleEndsAt ? getRemaining(saleEndsAt) : null,
  )

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1")
  }, [])

  useEffect(() => {
    if (!saleEndsAt) {
      setRemaining(null)
      return
    }
    const tick = () => {
      const next = getRemaining(saleEndsAt)
      setRemaining(next.total > 0 ? next : null)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [saleEndsAt])

  if (dismissed) return null

  const showCountdown = Boolean(saleEndsAt && remaining && remaining.total > 0)

  return (
    <div className="relative border-b border-stone-200 bg-[#f3f2ed] px-4 py-2 text-center text-[12px] leading-snug text-[#1d1c18] sm:text-[13px]">
      <p className="mx-auto max-w-5xl pr-8 tracking-[0.04em]">
        {message}
        {showCountdown && remaining && (
          <span className="ml-2 inline-flex items-center gap-1 font-semibold tracking-wide">
            <span>
              {String(remaining.hours + remaining.days * 24).padStart(2, "0")}H
            </span>
            <span>:</span>
            <span>{String(remaining.minutes).padStart(2, "0")}M</span>
            <span>:</span>
            <span>{String(remaining.seconds).padStart(2, "0")}S</span>
          </span>
        )}
      </p>
      <button
        type="button"
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-stone-500 hover:text-stone-800"
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
