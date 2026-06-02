"use client"

import { useMemo, useState } from "react"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { getWhatsAppUrl, whatsappNumber } from "@/lib/site"

const quickMessages = [
  "Hello YiiArt, I would like help choosing an artwork.",
  "Hello YiiArt, I have a question about shipping.",
  "Hello YiiArt, can you help me with size and room advice?",
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const defaultUrl = useMemo(() => getWhatsAppUrl(), [])

  const trackWhatsAppLead = (leadType: string) => {
    trackMarketingEvent("Lead", { lead_type: leadType, channel: "whatsapp" })
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-sm font-medium text-white shadow-lg transition hover:bg-gray-800"
        aria-label="Open WhatsApp support"
      >
        WA
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm border bg-white shadow-2xl">
      <div className="flex items-start justify-between bg-black p-4 text-white">
        <div>
          <h3 className="font-medium">YiiArt WhatsApp</h3>
          <p className="mt-1 text-xs text-gray-300">Artwork advice, shipping, sizing, and custom requests.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-2 text-lg leading-none text-gray-300 hover:text-white"
          aria-label="Close WhatsApp support"
        >
          x
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="border bg-gray-50 p-3 text-sm text-gray-600">
          <p className="font-medium text-black">Chat with YiiArt</p>
          <p className="mt-1">WhatsApp +{whatsappNumber}</p>
        </div>

        <a
          href={defaultUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppLead("whatsapp_main")}
          className="block w-full bg-black px-4 py-3 text-center text-sm text-white transition hover:bg-gray-800"
        >
          Open WhatsApp
        </a>

        <div className="space-y-2">
          {quickMessages.map((message) => (
            <a
              key={message}
              href={getWhatsAppUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead("whatsapp_quick_reply")}
              className="block border px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {message.replace("Hello YiiArt, ", "")}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
