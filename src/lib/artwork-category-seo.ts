import { ARTWORK_CATEGORIES } from "./artwork-categories"

const categorySeoCopy = {
  Abstract: {
    title: "Abstract Art & Paintings | YiiArt",
    description:
      "Browse hand-painted abstract paintings from YiiArt. Compare available compositions by palette, size, and medium, then review each artwork's details.",
  },
  Landscape: {
    title: "Landscape Paintings | YiiArt",
    description:
      "Explore hand-painted landscape paintings on canvas. Compare available compositions by size, medium, and palette, with details listed for each work.",
  },
  Portrait: {
    title: "Portrait Paintings | YiiArt",
    description:
      "Browse hand-painted portrait paintings from YiiArt. Compare available works by composition, size, and medium, and review details before ordering.",
  },
  Figurative: {
    title: "Figurative Paintings | YiiArt",
    description:
      "Discover hand-painted figurative art on canvas. Explore available works and compare their composition, listed dimensions, and medium.",
  },
  Texture: {
    title: "Textured Wall Art & Paintings | YiiArt",
    description:
      "Explore hand-painted textured wall art, including paintings with tactile surfaces and mixed-media details. Compare available works by size and medium.",
  },
  "Wabi-sabi": {
    title: "Wabi-Sabi Paintings | YiiArt",
    description:
      "Browse hand-painted wabi-sabi art with restrained palettes and expressive surfaces. Compare available paintings by size, medium, and composition.",
  },
  Minimalist: {
    title: "Minimalist Paintings | YiiArt",
    description:
      "Explore hand-painted minimalist art for considered interiors. Compare available paintings by composition, dimensions, and medium.",
  },
} satisfies Record<(typeof ARTWORK_CATEGORIES)[number], { title: string; description: string }>

const allArtworkDescription =
  "Browse hand-painted paintings from YiiArt across abstract, landscape, portrait, textured, and minimalist styles. Filter by room, color, size, and orientation."

export function getArtworkCategorySeo(category?: string) {
  const normalized = ARTWORK_CATEGORIES.find(
    (item) => item.toLowerCase() === category?.trim().toLowerCase(),
  )

  return normalized ? { category: normalized, ...categorySeoCopy[normalized] } : undefined
}

export function buildArtworkCategorySeoMetadata(category?: string) {
  const categorySeo = getArtworkCategorySeo(category)
  const hasCategoryQuery = Boolean(category?.trim())

  return {
    ...categorySeo,
    title: categorySeo?.title || "Hand-Painted Paintings | YiiArt",
    description: categorySeo?.description || allArtworkDescription,
    path: categorySeo ? `/artworks?category=${encodeURIComponent(categorySeo.category)}` : "/artworks",
    robots: hasCategoryQuery && !categorySeo ? { index: false as const, follow: true as const } : undefined,
  }
}
