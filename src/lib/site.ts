export const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL
  || "lishuxian100721@gmail.com"

export const internalContactEmail =
  process.env.CONTACT_EMAIL
  || contactEmail

export const whatsappNumber =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8618103832173").replace(/\D/g, "")

export function getWhatsAppUrl(message = "Hello YiiArt, I would like to ask about an artwork.") {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function getSocialProfiles() {
  return [
    { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
    { label: "Pinterest", href: process.env.NEXT_PUBLIC_PINTEREST_URL },
    { label: "TikTok", href: process.env.NEXT_PUBLIC_TIKTOK_URL },
    { label: "Xiaohongshu", href: process.env.NEXT_PUBLIC_XIAOHONGSHU_URL },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  ].filter((profile): profile is { label: string; href: string } => Boolean(profile.href))
}
