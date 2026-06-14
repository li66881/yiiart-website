"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"

type SocialShareProps = {
  title: string
  image?: string
}

export default function SocialShare({ title, image }: SocialShareProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [pageUrl, setPageUrl] = useState("")

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedImage = encodeURIComponent(image || "")

  const shareLinks = [
    {
      label: "Facebook",
      href: pageUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` : "#",
    },
    {
      label: "Pinterest",
      href: pageUrl ? `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}` : "#",
    },
    {
      label: "X",
      href: pageUrl ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` : "#",
    },
    {
      label: "Email",
      href: pageUrl ? `mailto:?subject=${encodedTitle}&body=${encodedUrl}` : "#",
    },
  ]

  const copyLink = async () => {
    if (!pageUrl) return

    await navigator.clipboard.writeText(pageUrl)
    trackMarketingEvent("Share", {
      method: "copy_link",
      content_name: title,
    })
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border-t border-stone-200 pt-6">
      <p className="mb-3 text-sm font-medium">{t("share.title")}</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => trackMarketingEvent("Share", { method: link.label, content_name: title })}
            target={link.label === "Email" ? undefined : "_blank"}
            rel={link.label === "Email" ? undefined : "noopener noreferrer"}
            className="border border-stone-300 px-3 py-2 text-sm hover:border-black"
          >
            {link.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className="border border-stone-300 px-3 py-2 text-sm hover:border-black">
          {copied ? t("share.copied") : t("share.copyLink")}
        </button>
      </div>
    </div>
  )
}
