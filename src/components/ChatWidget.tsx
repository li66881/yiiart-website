"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { getWhatsAppUrl, whatsappNumber } from "@/lib/site"
import { shouldShowFloatingChatOnMobile } from "@/lib/chat-widget"

const quickMessages = ["0", "1", "2"]

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 11.2c0-3.7 3.5-6.7 7.5-6.7s7.5 3 7.5 6.7-3.5 6.7-7.5 6.7c-.7 0-1.4-.1-2-.2L6.2 19.3c-.35.2-.8-.1-.7-.5l.7-2.8C5.1 14.9 4.5 13.1 4.5 11.2Z"
        fill="currentColor"
      />
      <circle cx="9" cy="11.2" r="1" fill="#111" />
      <circle cx="12" cy="11.2" r="1" fill="#111" />
      <circle cx="15" cy="11.2" r="1" fill="#111" />
    </svg>
  )
}

export default function ChatWidget() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const defaultUrl = useMemo(() => getWhatsAppUrl(), [])
  const showOnMobile = shouldShowFloatingChatOnMobile(pathname)
  const mobilePosition = showOnMobile ? "bottom-24 right-4" : "bottom-6 right-6"
  const mobileVisibility = showOnMobile ? "flex" : "hidden md:flex"
  const mobilePanelVisibility = showOnMobile ? "block" : "hidden md:block"

  const trackWhatsAppLead = (leadType: string) => {
    trackMarketingEvent("Lead", { lead_type: leadType, channel: "whatsapp" })
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`yiiart-chat-widget fixed ${mobilePosition} ${mobileVisibility} z-50 inline-flex h-[3.35rem] w-[3.35rem] items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#3a3a3a_0%,#171717_58%,#0d0d0d_100%)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.32)] md:bottom-6 md:right-6`}
        aria-label={t("chat.openSupport")}
      >
        <ChatBubbleIcon className="h-[1.45rem] w-[1.45rem]" />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#25d366]" />
      </button>
    )
  }

  return (
    <div className={`yiiart-chat-widget fixed ${mobilePosition} ${mobilePanelVisibility} z-50 w-[calc(100vw-2rem)] max-w-sm border border-stone-200 bg-white shadow-2xl md:bottom-6 md:right-6`}>
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
