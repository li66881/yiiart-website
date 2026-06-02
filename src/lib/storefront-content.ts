export type StorefrontCollectionTile = {
  title: string
  eyebrow: string
  description: string
  href: string
  categories?: string[]
  meta: string
}

export const storefrontCollectionTiles: StorefrontCollectionTile[] = [
  {
    title: "Textured Wall Art",
    eyebrow: "Style",
    description: "Layered surfaces, visible brushwork, and tactile paintings for quiet modern rooms.",
    href: "/collections/textured-wall-art",
    categories: ["Texture", "Textured Art"],
    meta: "Texture / Mixed media",
  },
  {
    title: "Living Room Abstracts",
    eyebrow: "Room",
    description: "Balanced abstract works selected for sofas, open-plan spaces, and statement walls.",
    href: "/collections/abstract-art-for-living-room",
    categories: ["Abstract"],
    meta: "Living room / Abstract",
  },
  {
    title: "Large Canvas Art",
    eyebrow: "Scale",
    description: "Large originals for feature walls, offices, hospitality spaces, and collector homes.",
    href: "/collections/large-canvas-art",
    meta: "Oversized / Feature wall",
  },
  {
    title: "Wabi-sabi Wall Art",
    eyebrow: "Style",
    description: "Quiet texture, imperfect surfaces, and grounded palettes for calm interiors.",
    href: "/collections/wabi-sabi-wall-art",
    categories: ["Wabi-sabi", "Texture"],
    meta: "Wabi-sabi / Neutral",
  },
  {
    title: "Bedroom Wall Art",
    eyebrow: "Room",
    description: "Softer compositions and measured color for bedrooms, reading corners, and private spaces.",
    href: "/collections/bedroom-wall-art",
    categories: ["Abstract", "Landscape", "Texture", "Wabi-sabi"],
    meta: "Bedroom / Calm color",
  },
  {
    title: "Neutral Canvas Art",
    eyebrow: "Color",
    description: "Minimal, textured, and earthy works for collectors building a restrained palette.",
    href: "/collections/neutral-canvas-art",
    categories: ["Texture", "Wabi-sabi", "Minimalist"],
    meta: "Neutral / Minimal",
  },
]

export const collectorJourney = [
  {
    title: "Choose by room",
    text: "Start from the wall, furniture scale, and mood of the space before choosing a work.",
  },
  {
    title: "Confirm the size",
    text: "Each artwork page gives dimensions in centimeters and inches, with advice available before purchase.",
  },
  {
    title: "Ask on WhatsApp",
    text: "Send a room photo or sizing question and receive direct guidance before checkout.",
  },
  {
    title: "Receive documented art",
    text: "Original works ship with careful packaging and collector documentation.",
  },
]

export const productConfidenceItems = [
  {
    title: "Original artwork",
    text: "One physical work, not a print edition.",
  },
  {
    title: "Signed certificate",
    text: "Collector documentation is included when available for the artwork.",
  },
  {
    title: "Tracked delivery",
    text: "Packaging format is selected according to artwork size and shipping safety.",
  },
  {
    title: "30-day return window",
    text: "Return requests can be opened after delivery according to YiiArt policy.",
  },
]

export const productAdviceItems = [
  {
    title: "Room fit",
    text: "Best considered for living rooms, bedrooms, offices, hallways, and quiet statement walls.",
  },
  {
    title: "Framing",
    text: "Ask before purchase if you need advice on frame color, float framing, or keeping the canvas unframed.",
  },
  {
    title: "Color confidence",
    text: "Screens vary. Request extra daylight photos on WhatsApp if the palette must match a room.",
  },
]
