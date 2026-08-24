"use client"

import { getSocialProfiles } from "@/lib/site"

export default function SocialLinks({ variant = "light" }: { variant?: "light" | "dark" }) {
  const profiles = getSocialProfiles()

  if (profiles.length === 0) {
    return null
  }

  const className = variant === "dark"
    ? "flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/80"
    : "flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-700"
  const linkClassName = variant === "dark"
    ? "underline underline-offset-4 hover:text-white"
    : "underline underline-offset-4 hover:text-black"

  return (
    <ul className={className}>
      {profiles.map((profile) => (
        <li key={profile.label}>
          <a href={profile.href} target="_blank" rel="me noopener noreferrer" className={linkClassName}>
            {profile.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
