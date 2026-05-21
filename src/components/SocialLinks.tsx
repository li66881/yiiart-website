"use client"

import { getSocialProfiles } from "@/lib/site"

export default function SocialLinks() {
  const profiles = getSocialProfiles()

  if (profiles.length === 0) {
    return null
  }

  return (
    <ul className="space-y-2 text-sm text-gray-500">
      {profiles.map((profile) => (
        <li key={profile.label}>
          <a href={profile.href} target="_blank" rel="noopener noreferrer" className="hover:text-black">
            {profile.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
