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
  message = "SUMMER SALE: DEALS STILL GOING 40% OFF.",
  saleEndsAt = null,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
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
  const totalHours = remaining ? remaining.hours + remaining.days * 24 : 0

  return (
    <div className="relative border-b border-stone-200 bg-[#f3f2ed] px-4 py-2 text-[#1d1c18]">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 pr-8 text-center text-[12px] leading-snug sm:text-[13px]">
        <p className="tracking-[0.04em]">{message}</p>
        {showCountdown && remaining ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold tracking-wide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-stone-600">
              <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8.5V12l2.4 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="tabular-nums">{String(totalHours).padStart(2, "0")}H</span>
            <span className="text-stone-400">:</span>
            <span className="tabular-nums">{String(remaining.minutes).padStart(2, "0")}M</span>
            <span className="text-stone-400">:</span>
            <span className="tabular-nums">{String(remaining.seconds).padStart(2, "0")}S</span>
          </span>
        ) : null}
      </div>
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
