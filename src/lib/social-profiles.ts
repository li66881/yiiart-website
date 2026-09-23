export type SocialProfile = {
  label: string
  href: string
}

const CANONICAL_SOCIAL_PROFILES: SocialProfile[] = [
  { label: "Instagram", href: "https://www.instagram.com/yiiartstudio/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61593697816451" },
  { label: "Pinterest", href: "https://www.pinterest.com/lishuxian100721/" },
  { label: "TikTok", href: "https://www.tiktok.com/@user2014937819332" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCEw0868l9l4LMq6tTZ-macQ" },
  { label: "X", href: process.env.NEXT_PUBLIC_X_URL || process.env.NEXT_PUBLIC_TWITTER_URL || "" },
  { label: "Xiaohongshu", href: process.env.NEXT_PUBLIC_XIAOHONGSHU_URL || "" },
]

const ENV_OVERRIDES: Record<string, string | undefined> = {
  Instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  Facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  Pinterest: process.env.NEXT_PUBLIC_PINTEREST_URL,
  TikTok: process.env.NEXT_PUBLIC_TIKTOK_URL,
  YouTube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  X: process.env.NEXT_PUBLIC_X_URL || process.env.NEXT_PUBLIC_TWITTER_URL,
  Xiaohongshu: process.env.NEXT_PUBLIC_XIAOHONGSHU_URL,
}

const STALE_PROFILE_HOSTS = [
  "instagram.com/lishuxian100721",
  "facebook.com/profile.php?id=61590629042020",
]

export function isStaleSocialProfileUrl(href: string) {
  const normalized = href.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase()
  return STALE_PROFILE_HOSTS.some((stale) => normalized.startsWith(stale))
}

export function resolveSocialProfileHref(label: string, envHref?: string, canonicalHref?: string) {
  const envValue = envHref?.trim()
  if (envValue && !isStaleSocialProfileUrl(envValue)) {
    return envValue.replace(/\?lang=zh-Hans$/, "")
  }
  return canonicalHref?.trim() || ""
}

export function getCanonicalSocialProfiles() {
  return CANONICAL_SOCIAL_PROFILES.filter((profile) => Boolean(profile.href))
}

export function getSocialProfiles() {
  return CANONICAL_SOCIAL_PROFILES
    .map((profile) => ({
      label: profile.label,
      href: resolveSocialProfileHref(profile.label, ENV_OVERRIDES[profile.label], profile.href),
    }))
    .filter((profile): profile is SocialProfile => Boolean(profile.href))
}
