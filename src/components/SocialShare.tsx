"use client"

import { useState } from "react"

type SocialShareProps = {
  title: string
  image?: string
}

export default function SocialShare({ title, image }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const pageUrl = typeof window === "undefined" ? "" : window.location.href
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedImage = encodeURIComponent(image || "")

  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Pinterest",
      href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ]

  const copyLink = async () => {
    if (!pageUrl) return

    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border-t pt-6">
      <p className="text-sm font-medium mb-3">Share this artwork</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === "Email" ? undefined : "_blank"}
            rel={link.label === "Email" ? undefined : "noopener noreferrer"}
            className="border px-3 py-2 text-sm hover:border-black"
          >
            {link.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className="border px-3 py-2 text-sm hover:border-black">
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
