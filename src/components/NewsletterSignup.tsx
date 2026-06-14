"use client"

import { FormEvent, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"

type Status = "idle" | "loading" | "success" | "error"

export default function NewsletterSignup() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("newsletter.error"))
      }

      setEmail("")
      setStatus("success")
      setMessage(t("newsletter.success"))
      trackMarketingEvent("Lead", {
        lead_type: "newsletter",
      })
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : t("newsletter.error"))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="newsletter-email" className="block text-sm text-white/64">
        {t("newsletter.label")}
      </label>
      <div className="flex">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@example.com"
          className="min-w-0 flex-1 border border-white/20 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-white"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="border border-l-0 border-white bg-white px-4 py-2 text-sm text-black transition hover:bg-stone-200 disabled:opacity-50"
        >
          {status === "loading" ? "..." : t("newsletter.join")}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-300" : "text-white/60"}`} aria-live="polite">
          {message}
        </p>
      )}
    </form>
  )
}
