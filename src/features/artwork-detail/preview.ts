import type { ArtworkGalleryItem, PresentationOption } from "./model"

export type ArtworkDetailPreview = {
  title: string
  artistName: string
  category: string
  medium: string
  description: string
  dimensions: string
  displayPrice: string
  certificateIncluded: boolean
  gallery: ArtworkGalleryItem[]
  presentationOptions: PresentationOption[]
}

const quietMeridian: ArtworkDetailPreview = {
  title: "Quiet Meridian",
  artistName: "Huang Liang",
  category: "Textured Art",
  medium: "Mixed Media on Canvas",
  description: "Built in thin layers of plaster, ash gray, and muted gold, this original painting brings a measured focal point to calm interiors.",
  dimensions: "90 x 140 cm / 35.4 x 55.1 in",
  displayPrice: "$1,520 USD",
  certificateIncluded: true,
  presentationOptions: [
    { label: "Rolled Canvas", image: "/prototypes/quiet-meridian/rolled.png", description: "Ships rolled in a protective tube" },
    { label: "Stretched", image: "/prototypes/quiet-meridian/stretched.png", description: "Ready to hang" },
    { label: "Natural Oak Float Frame", image: "/prototypes/quiet-meridian/edge.png", description: "Warm oak frame with a float mount" },
  ],
  gallery: [
    { url: "/prototypes/quiet-meridian/room.png", role: "room", alt: "Quiet Meridian room visualization showing artwork scale", isVisualization: true },
    { url: "/prototypes/quiet-meridian/artwork.png", role: "artwork", alt: "Quiet Meridian, full artwork view", isVisualization: false },
    { url: "/prototypes/quiet-meridian/texture.png", role: "texture", alt: "Quiet Meridian, raised plaster and mineral-gold texture detail", isVisualization: false },
    { url: "/prototypes/quiet-meridian/edge.png", role: "edge", alt: "Quiet Meridian, canvas edge and natural-oak float-frame detail", isVisualization: false },
  ],
}

export function getArtworkDetailPreview(previewKey: string | undefined, isProduction: boolean) {
  if (isProduction || previewKey !== "quiet-meridian") return undefined
  return quietMeridian
}

export function isArtworkPreviewDisabled(isProduction: boolean, localQaFlag: string | undefined) {
  return isProduction && localQaFlag !== "1"
}
