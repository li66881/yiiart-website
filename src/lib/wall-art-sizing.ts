export type ArtworkWidthRange = {
  furnitureWidthCm: number
  minArtworkWidthCm: number
  maxArtworkWidthCm: number
  minArtworkWidthIn: number
  maxArtworkWidthIn: number
}

export function calculateArtworkWidthRange(furnitureWidthCm: number): ArtworkWidthRange | null {
  if (!Number.isFinite(furnitureWidthCm) || furnitureWidthCm <= 0) return null

  const minArtworkWidthCm = Math.round(furnitureWidthCm * 0.6)
  const maxArtworkWidthCm = Math.round(furnitureWidthCm * 0.75)

  return {
    furnitureWidthCm,
    minArtworkWidthCm,
    maxArtworkWidthCm,
    minArtworkWidthIn: toOneDecimalInches(minArtworkWidthCm),
    maxArtworkWidthIn: toOneDecimalInches(maxArtworkWidthCm),
  }
}

export const sofaArtworkSizeExamples = [140, 160, 180, 200, 220, 240]
  .map(calculateArtworkWidthRange)
  .filter((range): range is ArtworkWidthRange => range !== null)

function toOneDecimalInches(centimeters: number) {
  return Math.round((centimeters / 2.54) * 10) / 10
}
