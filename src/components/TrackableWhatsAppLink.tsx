"use client"

import type { ReactNode } from "react"
import { trackMarketingEvent } from "@/lib/marketing-events"

type TrackableWhatsAppLinkProps = {
  href: string
  children: ReactNode
  className?: string
  contentName?: string
  location: string
}

export default function TrackableWhatsAppLink({
  href,
  children,
  className,
  contentName,
  location,
}: TrackableWhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackMarketingEvent("WhatsAppClick", {
        content_name: contentName,
        location,
      })}
    >
      {children}
    </a>
  )
}
