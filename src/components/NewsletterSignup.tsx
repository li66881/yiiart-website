"use client"

import { FormEvent, useState } from "react"
import { trackMarketingEvent } from "@/lib/marketing-events"

type Status = "idle" | "loading" | "success" | "error"

export default function NewsletterSignup() {
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
        throw new Error(data.error || "Subscription failed.")
      }

      setEmail("")
      setStatus("success")
      setMessage("Thank you. You are on the YiiArt list.")
      trackMarketingEvent("Lead", {
        lead_type: "newsletter",
      })
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Subscription failed.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="newsletter-email" className="block text-sm text-gray-500">
        New artwork arrivals and collector notes
      </label>
      <div className="flex">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@example.com"
          className="min-w-0 flex-1 border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="border border-l-0 bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-600" : "text-gray-500"}`} aria-live="polite">
          {message}
        </p>
      )}
    </form>
  )
}
