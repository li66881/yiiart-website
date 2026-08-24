"use client"

import type { ReactNode } from "react"
import { getSocialProfiles } from "@/lib/site"

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8zm9.2 1.3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M14.5 8.5V6.8c0-.7.5-1.1 1.2-1.1h1.3V3h-2.3C11.8 3 11 5 11 6.7v1.8H9v2.7h2V21h3.5v-9.8h2.3l.4-2.7h-2.7z" />
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.2-1.8 0-2.6l1.4-6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.6-2.7 3.6-5.9 0-2.4-1.6-4.2-4.6-4.2-3.3 0-5.4 2.5-5.4 5.2 0 1 .5 2.1 1.1 2.7a.4.4 0 0 1 .1.4l-.4 1.6c-.1.3-.3.4-.6.3-2.2-.9-3.2-3.3-3.2-6 0-4.5 3.8-9.9 11.3-9.9 6 0 10 4.4 10 9.1 0 6.2-3.5 10.8-8.6 10.8-1.7 0-3.3-.9-3.9-2l-1.1 4.1A9 9 0 1 0 12 3z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M13.7 10.5 20.4 3h-1.6l-5.8 6.5L8.4 3H3.2l7 10.1L3.2 21h1.6l6.1-6.9 4.9 6.9h5.2L13.7 10.5zm-2.2 2.4-.7-1L5.4 4.2h2.4l4.5 6.3.7 1 5.9 8.3h-2.4l-4.9-6.9z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M14.2 3c.3 2.3 1.6 4.1 3.8 4.8V10c-1.3 0-2.5-.4-3.5-1.1v6.3A5.3 5.3 0 1 1 9.3 10v2.4a2.9 2.9 0 1 0 2.1 2.8V3h2.8z" />
    </svg>
  )
}

function XiaohongshuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M5 4h14v3.2h-2.2V6.6H7.2v10.8h9.6V17H19V20H5V4zm3.4 5.2h7.2v1.8H8.4V9.2zm0 3.4h7.2v1.8H8.4v-1.8z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="currentColor" d="M21.6 7.8a2.7 2.7 0 0 0-1.9-1.9C18 5.5 12 5.5 12 5.5s-6 0-7.7.4A2.7 2.7 0 0 0 2.4 7.8 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.2 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.2zM10 15.2V8.8L15.5 12 10 15.2z" />
    </svg>
  )
}

const platformIcons: Record<string, ReactNode> = {
  Instagram: <InstagramIcon />,
  Facebook: <FacebookIcon />,
  Pinterest: <PinterestIcon />,
  X: <XIcon />,
  TikTok: <TikTokIcon />,
  Xiaohongshu: <XiaohongshuIcon />,
  YouTube: <YouTubeIcon />,
}

export default function SocialLinks({ variant = "light" }: { variant?: "light" | "dark" }) {
  const profiles = getSocialProfiles()

  if (profiles.length === 0) {
    return null
  }

  const listClassName = variant === "dark"
    ? "flex flex-wrap gap-2 text-sm text-white/85"
    : "flex flex-wrap gap-2 text-sm text-stone-800"
  const linkClassName = variant === "dark"
    ? "inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 hover:border-white hover:text-white"
    : "inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 hover:border-black"

  return (
    <ul className={listClassName}>
      {profiles.map((profile) => (
        <li key={profile.label}>
          <a href={profile.href} target="_blank" rel="me noopener noreferrer" className={linkClassName}>
            {platformIcons[profile.label] || null}
            <span>{profile.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
