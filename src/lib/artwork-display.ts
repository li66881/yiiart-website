type LocalizedText = {
  en?: string
  zh?: string
}

const categoryMap: Record<string, string> = {
  "鏅": "Landscape",
  "鎶借薄": "Abstract",
  "鑲栧儚": "Portrait",
  "鑲岀悊": "Texture",
  "肌理": "Texture",
  "鏋佺畝": "Minimalist",
  "极简": "Minimalist",
  "抽象": "Abstract",
  "景观": "Landscape",
  "肖像": "Portrait",
}

const mediumMap: Record<string, string> = {
  "涓欑儻棰滄枡鐢诲竷": "Acrylic on canvas",
  "丙烯颜料画布": "Acrylic on canvas",
  "甯冮潰娌圭敾": "Oil on canvas",
  "布面油画": "Oil on canvas",
  "娌圭敾甯": "Oil on canvas",
  "油画布": "Oil on canvas",
}

export function pickEnglish(value?: LocalizedText | string | null, fallback = "") {
  if (!value) return fallback
  if (typeof value === "string") return normalizeDisplayText(value) || fallback
  return normalizeDisplayText(value.en || value.zh || fallback)
}

export function normalizeCategory(value?: string | null) {
  if (!value) return ""
  const clean = normalizeDisplayText(value)
  return categoryMap[clean] || clean
}

export function normalizeMedium(value?: string | null) {
  if (!value) return ""
  const clean = normalizeDisplayText(value)
  return mediumMap[clean] || clean
}

export function formatDimensions(value?: string | null) {
  if (!value) return ""

  const clean = value.replace(/\s+/g, " ").trim()
  if (!clean) return ""

  const numbers = clean.match(/\d+(?:\.\d+)?/g)?.map(Number)
  if (!numbers || numbers.length < 2) return clean

  const [rawWidth, rawHeight] = numbers
  let width = rawWidth
  let height = rawHeight
  const hasCm = /cm/i.test(clean)
  const hasMm = /mm/i.test(clean)
  const hasInches = /\b(in|inch|inches)\b/i.test(clean)

  if (!hasCm && !hasMm && Math.max(rawWidth, rawHeight) > 1000 && Math.min(rawWidth, rawHeight) > 500) {
    return ""
  }

  if (hasMm || (!hasCm && !hasInches && Math.max(width, height) > 300)) {
    width = width / 10
    height = height / 10
  } else if (hasInches && !hasCm) {
    width = width * 2.54
    height = height * 2.54
  }

  return formatDimensionPair(width, height)
}

export function formatArtworkDimensions(artwork?: {
  dimensions?: string | null
  widthCm?: number | string | null
  heightCm?: number | string | null
} | null) {
  const widthCm = readDimensionNumber(artwork?.widthCm)
  const heightCm = readDimensionNumber(artwork?.heightCm)

  if (widthCm && heightCm) {
    return formatDimensionPair(widthCm, heightCm)
  }

  return formatDimensions(artwork?.dimensions)
}

export function parseArtworkDimensionsCm(dimensions?: string | null) {
  const formatted = formatDimensions(dimensions)
  const numbers = formatted.match(/\d+(?:\.\d+)?/g)?.map(Number)
  if (!numbers || numbers.length < 2) return null

  return { width: numbers[0], height: numbers[1] }
}

function formatDimensionPair(width: number, height: number) {
  if (!isPlausibleArtworkSizeCm(width, height)) return ""

  const widthCm = formatNumber(width)
  const heightCm = formatNumber(height)
  const widthIn = formatNumber(width / 2.54, 1)
  const heightIn = formatNumber(height / 2.54, 1)

  return `${widthCm} x ${heightCm} cm / ${widthIn} x ${heightIn} in`
}

function readDimensionNumber(value?: number | string | null) {
  const number = typeof value === "number" ? value : Number(String(value || "").trim())
  return Number.isFinite(number) && number > 0 ? number : null
}

function isPlausibleArtworkSizeCm(width: number, height: number) {
  const shortest = Math.min(width, height)
  const longest = Math.max(width, height)

  return shortest >= 10 && longest <= 320
}

export function buildArtworkSeoTitle(artwork: {
  title?: LocalizedText
  category?: string
  medium?: string
  dimensions?: string
  widthCm?: number | string | null
  heightCm?: number | string | null
}) {
  const title = pickEnglish(artwork.title, "Original artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)
  const dimensions = formatArtworkDimensions(artwork)
  const details = [category, medium, dimensions].filter(Boolean).join(", ")

  return details ? `${title} - ${details}` : title
}

export function normalizeDisplayText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\bCanvas\b/g, "canvas")
    .replace(/\bOil on canvas\b/i, "Oil on canvas")
    .replace(/\bAcrylic on canvas\b/i, "Acrylic on canvas")
    .replace(/\bMixed media\b/i, "Mixed media")
    .trim()
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
