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
  // On PDP, raise only on mobile where sticky ATC may appear.
  const onArtworkPage = shouldShowFloatingChatOnMobile(pathname)
  const anchorPosition = onArtworkPage
    ? "bottom-28 right-4 md:bottom-8 md:right-6"
    : "bottom-8 right-4 md:bottom-10 md:right-6"
  const mobileVisibility = onArtworkPage ? "flex" : "hidden md:flex"
  const mobilePanelVisibility = onArtworkPage ? "block" : "hidden md:block"

  const trackWhatsAppLead = (leadType: string) => {
    trackMarketingEvent("Lead", { lead_type: leadType, channel: "whatsapp" })
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed ${anchorPosition} ${mobileVisibility} z-50 h-[3.35rem] w-[3.35rem] items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#3a3a3a_0%,#171717_58%,#0d0d0d_100%)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_4px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.36),0_3px_8px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.26)] active:translate-y-0`}
        aria-label={t("chat.openSupport")}
      >
        <ChatBubbleIcon className="h-[1.45rem] w-[1.45rem]" />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#f7f5f0] bg-[#25d366] shadow-[0_1px_3px_rgba(0,0,0,0.25)]" />
      </button>
    )
  }

  return (
    <div
      className={`fixed ${anchorPosition} ${mobilePanelVisibility} z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]`}
    >
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
          ×
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
          className="block w-full rounded-full bg-[#111] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
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
              className="block rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 transition hover:border-black"
            >
              {t(`chat.quick.${key}.label`)}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
