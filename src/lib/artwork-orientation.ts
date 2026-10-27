import { parsePhysicalDimensions, readPhysicalDimensions } from "./physical-dimensions"

export type ArtworkOrientation = "Portrait" | "Landscape" | "Square"

export function resolveArtworkOrientation(input: {
  orientation?: string | null
  widthCm?: number | string | null
  heightCm?: number | string | null
  dimensions?: string | null
}): ArtworkOrientation | null {
  const dimensions = readPhysicalDimensions(input.widthCm, input.heightCm)
    || parsePhysicalDimensions(input.dimensions)

  if (dimensions) {
    const relativeDifference = Math.abs(dimensions.widthCm - dimensions.heightCm)
      / Math.max(dimensions.widthCm, dimensions.heightCm)
    if (relativeDifference <= 0.02) return "Square"
    return dimensions.widthCm > dimensions.heightCm ? "Landscape" : "Portrait"
  }

  const saved = input.orientation?.trim().toLowerCase()
  if (saved === "portrait" || saved === "vertical") return "Portrait"
  if (saved === "landscape" || saved === "horizontal") return "Landscape"
  if (saved === "square") return "Square"
  return null
}
