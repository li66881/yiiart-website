export const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL
  || "lishuxian100721@gmail.com"

export const internalContactEmail =
  process.env.CONTACT_EMAIL
  || contactEmail

export const whatsappNumber =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8617538137711").replace(/\D/g, "")

export function getWhatsAppUrl(message = "Hello YiiArt, I would like to ask about an artwork.") {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export { getSocialProfiles } from "./social-profiles"

