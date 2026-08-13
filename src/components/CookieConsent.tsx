"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"

const STORAGE_KEY = "yiiart-cookie-consent"

type CookieChoice = "pending" | "accepted" | "essential"

export default function CookieConsent() {
  const { t } = useLanguage()
  const [choice, setChoice] = useState<CookieChoice>("pending")
  const [mounted, setMounted] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const savedChoice = localStorage.getItem(STORAGE_KEY)

    if (savedChoice === "accepted" || savedChoice === "essential") {
      setChoice(savedChoice)
    }
  }, [])

  const consentVisible = mounted && choice === "pending"

  useEffect(() => {
    if (!consentVisible) {
      delete document.body.dataset.cookieConsentVisible
      document.body.style.removeProperty("--cookie-consent-height")
      return
    }

    document.body.dataset.cookieConsentVisible = "true"
    const updateHeight = () => {
      const height = bannerRef.current?.getBoundingClientRect().height || 0
      document.body.style.setProperty("--cookie-consent-height", `${Math.ceil(height)}px`)
    }
    updateHeight()

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateHeight)
    if (bannerRef.current) resizeObserver?.observe(bannerRef.current)

    return () => {
      resizeObserver?.disconnect()
      delete document.body.dataset.cookieConsentVisible
      document.body.style.removeProperty("--cookie-consent-height")
    }
  }, [consentVisible])

  const saveChoice = (nextChoice: Exclude<CookieChoice, "pending">) => {
    localStorage.setItem(STORAGE_KEY, nextChoice)
    window.dispatchEvent(new CustomEvent("yiiart:cookie-consent", { detail: nextChoice }))
    setChoice(nextChoice)
  }

  if (!mounted || choice !== "pending") {
    return null
  }

  return (
    <div ref={bannerRef} className="fixed inset-x-0 bottom-0 z-[60] border-t bg-white/95 backdrop-blur">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:py-4">
        <p className="max-w-2xl text-xs leading-5 text-gray-600 md:text-sm">
          {t("cookie.message")}
        </p>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-row">
          <button
            type="button"
            onClick={() => saveChoice("essential")}
            className="min-h-10 border px-3 py-2 text-xs hover:bg-gray-50 md:px-4 md:text-sm"
          >
            {t("cookie.essential")}
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="min-h-10 bg-black px-3 py-2 text-xs text-white hover:bg-gray-800 md:px-4 md:text-sm"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  )
}
