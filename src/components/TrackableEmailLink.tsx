"use client"

import type { ReactNode } from "react"
import { trackMarketingEvent } from "@/lib/marketing-events"

type TrackableEmailLinkProps = {
  email: string
  children?: ReactNode
  className?: string
  leadType?: string
}

export default function TrackableEmailLink({
  email,
  children,
  className,
  leadType = "email_click",
}: TrackableEmailLinkProps) {
  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={() => trackMarketingEvent("Contact", { location: leadType })}
    >
      {children || email}
    </a>
  )
}
