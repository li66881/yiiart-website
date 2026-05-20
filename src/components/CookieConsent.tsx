"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "yiiart-cookie-consent"

type CookieChoice = "pending" | "accepted" | "essential"

export default function CookieConsent() {
  const [choice, setChoice] = useState<CookieChoice>("pending")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedChoice = localStorage.getItem(STORAGE_KEY)

    if (savedChoice === "accepted" || savedChoice === "essential") {
      setChoice(savedChoice)
    }
  }, [])

  const saveChoice = (nextChoice: Exclude<CookieChoice, "pending">) => {
    localStorage.setItem(STORAGE_KEY, nextChoice)
    window.dispatchEvent(new CustomEvent("yiiart:cookie-consent", { detail: nextChoice }))
    setChoice(nextChoice)
  }

  if (!mounted || choice !== "pending") {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600 max-w-2xl">
          YiiArt uses essential cookies for checkout and optional analytics cookies to improve the store.
          You can accept analytics or keep only essential cookies.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => saveChoice("essential")}
            className="px-4 py-2 border text-sm hover:bg-gray-50"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="px-4 py-2 bg-black text-sm text-white hover:bg-gray-800"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  )
}
