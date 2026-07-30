"use client"

import { getSocialProfiles } from "@/lib/site"

export default function SocialLinks({ variant = "light" }: { variant?: "light" | "dark" }) {
  const profiles = getSocialProfiles()

  if (profiles.length === 0) {
    return null
  }

  const className = variant === "dark"
    ? "space-y-2 text-sm text-white/62"
    : "space-y-2 text-sm text-gray-500"
  const linkClassName = variant === "dark" ? "hover:text-white" : "hover:text-black"

  return (
    <ul className={className}>
      {profiles.map((profile) => (
        <li key={profile.label}>
          <a href={profile.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {profile.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
