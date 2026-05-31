export type MarketingCollection = {
  slug: string
  title: string
  shortTitle: string
  description: string
  intro: string
  categories?: string[]
  keywords: string[]
  rooms: string[]
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
  },
]

export function getMarketingCollection(slug: string) {
  return marketingCollections.find((collection) => collection.slug === slug)
}
