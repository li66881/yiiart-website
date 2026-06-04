"use client"

import { useMemo, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { getWhatsAppUrl, whatsappNumber } from "@/lib/site"

const quickMessages = ["0", "1", "2"]

export default function ChatWidget() {
  const { t } = useLanguage()
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
        aria-label={t("chat.openSupport")}
      >
        WA
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm border bg-white shadow-2xl">
      <div className="flex items-start justify-between bg-black p-4 text-white">
        <div>
          <h3 className="font-medium">{t("chat.title")}</h3>
          <p className="mt-1 text-xs text-gray-300">{t("chat.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-2 text-lg leading-none text-gray-300 hover:text-white"
          aria-label={t("chat.closeSupport")}
        >
          x
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="border bg-gray-50 p-3 text-sm text-gray-600">
          <p className="font-medium text-black">{t("chat.chatWith")}</p>
          <p className="mt-1">WhatsApp +{whatsappNumber}</p>
        </div>

        <a
          href={defaultUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppLead("whatsapp_main")}
          className="block w-full bg-black px-4 py-3 text-center text-sm text-white transition hover:bg-gray-800"
        >
          {t("chat.openWhatsApp")}
        </a>

        <div className="space-y-2">
          {quickMessages.map((key) => (
            <a
              key={key}
              href={getWhatsAppUrl(t(`chat.quick.${key}.message`))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead("whatsapp_quick_reply")}
              className="block border px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {t(`chat.quick.${key}.label`)}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
