"use client"

import { useMemo, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { siteUrl } from "@/lib/seo"
import { buildSocialShareCaption, withCampaignParams } from "@/lib/social"

type SocialShareProps = {
  title: string
  path: string
  image?: string
  caption?: string
  artistName?: string
}

export default function SocialShare({ title, path, image, caption, artistName }: SocialShareProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const shareText = buildSocialShareCaption({ title, artistName, caption })
  const shareUrl = useMemo(
    () =>
      withCampaignParams(path, {
        source: "share",
        medium: "social",
        campaign: "artwork_page",
        content: path.replace(/^\//, "").replace(/\W+/g, "-"),
      }),
    [path],
  )

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(shareText)
  const encodedImage = encodeURIComponent(image ? (/^https?:\/\//.test(image) ? image : `${siteUrl}${image}`) : "")

  const shareLinks = [
    {
      label: "Pinterest",
      href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
  ]

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    trackMarketingEvent("Share", {
      method: "copy_caption",
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
