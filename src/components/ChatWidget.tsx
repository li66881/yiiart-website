"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { getWhatsAppUrl, whatsappNumber } from "@/lib/site"
import { shouldShowFloatingChatOnMobile } from "@/lib/chat-widget"

const quickMessages = ["0", "1", "2"]

export default function ChatWidget() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const defaultUrl = useMemo(() => getWhatsAppUrl(), [])
  const mobilePosition = shouldShowFloatingChatOnMobile(pathname) ? "bottom-24 right-4" : "bottom-6 right-6"
  const mobileVisibility = shouldShowFloatingChatOnMobile(pathname) ? "flex" : "hidden md:flex"
  const mobilePanelVisibility = shouldShowFloatingChatOnMobile(pathname) ? "block" : "hidden md:block"

  const trackWhatsAppLead = (leadType: string) => {
    trackMarketingEvent("Lead", { lead_type: leadType, channel: "whatsapp" })
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed ${mobilePosition} ${mobileVisibility} z-50 h-14 w-14 items-center justify-center bg-black text-sm font-medium text-white shadow-xl transition hover:bg-stone-800 md:bottom-6 md:right-6`}
        aria-label={t("chat.openSupport")}
      >
        WA
      </button>
    )
  }

  return (
    <div className={`fixed ${mobilePosition} ${mobilePanelVisibility} z-50 w-[calc(100vw-2rem)] max-w-sm border border-stone-200 bg-white shadow-2xl md:bottom-6 md:right-6`}>
      <div className="flex items-start justify-between bg-stone-950 p-4 text-white">
        <div>
          <h3 className="font-medium">{t("chat.title")}</h3>
          <p className="mt-1 text-xs text-white/64">{t("chat.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-2 text-lg leading-none text-white/64 hover:text-white"
          aria-label={t("chat.closeSupport")}
        >
          x
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="border border-stone-200 bg-[#fbfaf6] p-3 text-sm text-stone-600">
          <p className="font-medium text-black">{t("chat.chatWith")}</p>
          <p className="mt-1">WhatsApp +{whatsappNumber}</p>
        </div>

        <a
          href={defaultUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppLead("whatsapp_main")}
          className="block w-full bg-black px-4 py-3 text-center text-sm text-white transition hover:bg-stone-800"
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
              className="block border border-stone-200 px-3 py-2 text-sm text-stone-700 transition hover:border-black"
            >
              {t(`chat.quick.${key}.label`)}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
