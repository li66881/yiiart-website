export type MarketingCollection = {
  slug: string
  title: string
  shortTitle: string
  description: string
  intro: string
  categories?: string[]
  keywords: string[]
  rooms: string[]
  group?: "style" | "room" | "scale" | "color"
}

export const marketingCollections: MarketingCollection[] = [
  {
    slug: "abstract-art-for-living-room",
    title: "Abstract Art for Living Rooms",
    shortTitle: "Living Room Abstracts",
    description:
      "Browse original abstract paintings selected for calm living rooms, open-plan spaces, and modern interiors.",
    intro:
      "A focused edit of original abstract paintings with balanced color, strong surface presence, and sizes that hold a room without overwhelming it.",
    categories: ["Abstract"],
    keywords: ["abstract wall art", "living room art", "original canvas painting"],
    rooms: ["Living rooms", "Open-plan apartments", "Quiet statement walls"],
    group: "room",
  },
  {
    slug: "textured-wall-art",
    title: "Textured Wall Art",
    shortTitle: "Textured Wall Art",
    description:
      "Explore original textured paintings and mixed-media canvas works with tactile surfaces for modern homes.",
    intro:
      "Textured works bring depth to simple rooms. This collection highlights pieces with visible brushwork, mineral surfaces, and layered paint.",
    categories: ["Texture", "Textured Art"],
    keywords: ["textured wall art", "mixed media painting", "neutral canvas art"],
    rooms: ["Entryways", "Bedrooms", "Minimal interiors"],
    group: "style",
  },
  {
    slug: "large-canvas-art",
    title: "Large Canvas Art",
    shortTitle: "Large Canvas Art",
    description:
      "Shop large original canvas paintings for feature walls, collector homes, offices, and hospitality spaces.",
    intro:
      "Large-format works are selected for rooms that need presence from a single piece: generous walls, above-sofa placements, and calm commercial spaces.",
    keywords: ["large canvas art", "oversized original painting", "statement wall art"],
    rooms: ["Feature walls", "Offices", "Hotels and studios"],
    group: "scale",
  },
  {
    slug: "wabi-sabi-wall-art",
    title: "Wabi-sabi Wall Art",
    shortTitle: "Wabi-sabi Art",
    description:
      "Browse original wabi-sabi and textured paintings with grounded palettes, quiet movement, and imperfect surfaces.",
    intro:
      "A calm edit of original works for collectors who prefer texture, restraint, natural marks, and rooms that do not feel over-decorated.",
    categories: ["Wabi-sabi", "Texture"],
    keywords: ["wabi-sabi wall art", "neutral textured painting", "quiet luxury art"],
    rooms: ["Bedrooms", "Reading corners", "Minimal living rooms"],
    group: "style",
  },
  {
    slug: "bedroom-wall-art",
    title: "Bedroom Wall Art",
    shortTitle: "Bedroom Art",
    description:
      "Original paintings selected for bedrooms, private spaces, and calm rooms that need measured color and texture.",
    intro:
      "Bedroom works should support the room instead of dominating it. This collection favors softer color, balanced scale, and quieter surfaces.",
    categories: ["Abstract", "Landscape", "Texture", "Wabi-sabi"],
    keywords: ["bedroom wall art", "calm original painting", "soft abstract art"],
    rooms: ["Bedrooms", "Guest rooms", "Private sitting areas"],
    group: "room",
  },
  {
    slug: "neutral-canvas-art",
    title: "Neutral Canvas Art",
    shortTitle: "Neutral Art",
    description:
      "Explore original neutral canvas paintings, textured works, and minimalist pieces for restrained modern interiors.",
    intro:
      "Neutral art is useful when the room already has strong materials or furniture. These pieces focus on surface, proportion, and subtle color.",
    categories: ["Texture", "Wabi-sabi", "Minimalist"],
    keywords: ["neutral canvas art", "minimalist painting", "earth tone wall art"],
    rooms: ["Minimal interiors", "Entryways", "Quiet offices"],
    group: "color",
  },
]

export function getMarketingCollection(slug: string) {
  return marketingCollections.find((collection) => collection.slug === slug)
}
