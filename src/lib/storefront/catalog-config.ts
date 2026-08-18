export type SizeProfileId = "square" | "two-three" | "three-four" | "near-square" | "panoramic"
export type CatalogOrientation = "portrait" | "landscape" | "square"
export type QuoteFinishId = "stretched" | "black-frame" | "white-frame" | "natural-frame" | "gold-frame" | "silver-frame"

export type CatalogSizeOption = {
  id: string
  label: string
  widthCm: number
  heightCm: number
}

export type QuoteFinishOption = {
  id: QuoteFinishId
  label: string
  estimateKind: "stretched" | "framed"
}

const ROLLED_AREA_RATE_CNY = 0.48
export const MAX_DIRECT_ROLLED_SIDE_CM = 210

const SIZE_PROFILES: Readonly<Record<SizeProfileId, readonly (readonly [number, number])[]>> = {
  square: [
    [60, 60],
    [70, 70],
    [80, 80],
    [90, 90],
    [100, 100],
    [120, 120],
    [140, 140],
    [160, 160],
    [180, 180],
  ],
  "two-three": [
    [50, 75],
    [60, 90],
    [70, 105],
    [80, 120],
    [90, 135],
    [100, 150],
    [120, 180],
    [140, 210],
  ],
  "three-four": [
    [45, 60],
    [60, 80],
    [75, 100],
    [90, 120],
    [105, 140],
    [120, 160],
    [135, 180],
    [150, 200],
  ],
  "near-square": [
    [50, 60],
    [60, 70],
    [70, 80],
    [80, 90],
    [90, 100],
    [100, 120],
    [120, 140],
    [140, 160],
  ],
  panoramic: [
    [30, 90],
    [40, 120],
    [50, 150],
    [60, 180],
    [70, 210],
    [80, 240],
  ],
}

export const quoteFinishOptions: readonly QuoteFinishOption[] = [
  { id: "stretched", label: "Frameless", estimateKind: "stretched" },
  { id: "black-frame", label: "Stretch + Black Frame", estimateKind: "framed" },
  { id: "white-frame", label: "Stretch + White Frame", estimateKind: "framed" },
  { id: "natural-frame", label: "Stretch + Wood Frame", estimateKind: "framed" },
  { id: "gold-frame", label: "Stretch + Gold Frame", estimateKind: "framed" },
  { id: "silver-frame", label: "Stretch + Silver Frame", estimateKind: "framed" },
]

function round10(value: number) {
  return Math.round(value / 10) * 10
}

export function calculateRolledPriceCny(widthCm: number, heightCm: number) {
  if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm) || widthCm <= 0 || heightCm <= 0) return null
  return round10(widthCm * heightCm * ROLLED_AREA_RATE_CNY)
}

export function calculateFinishEstimateCny(finishId: QuoteFinishId, rolledPriceCny: number) {
  const stretched = round10(rolledPriceCny * 1.70)
  return finishId === "stretched" ? stretched : round10(stretched * 1.05)
}

export function getCatalogSizes(profile: SizeProfileId, orientation: CatalogOrientation): CatalogSizeOption[] {
  return SIZE_PROFILES[profile].map(([profileWidthCm, profileHeightCm]) => {
    const widthCm = orientation === "landscape" ? profileHeightCm : profileWidthCm
    const heightCm = orientation === "landscape" ? profileWidthCm : profileHeightCm

    return {
      id: `${widthCm}x${heightCm}`,
      label: `${widthCm} x ${heightCm} cm`,
      widthCm,
      heightCm,
    }
  })
}

export function partitionRolledSizesForCheckout(sizes: readonly CatalogSizeOption[]) {
  return {
    direct: sizes.filter((size) => Math.max(size.widthCm, size.heightCm) <= MAX_DIRECT_ROLLED_SIDE_CM),
    quote: sizes.filter((size) => Math.max(size.widthCm, size.heightCm) > MAX_DIRECT_ROLLED_SIDE_CM),
  }
}
