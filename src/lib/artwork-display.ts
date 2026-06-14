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
  if (/in/i.test(clean) && /cm/i.test(clean)) return clean

  const numbers = clean.match(/\d+(?:\.\d+)?/g)?.map(Number)
  if (!numbers || numbers.length < 2) return clean

  let [width, height] = numbers
  const isMillimeters = /mm/i.test(clean) || (!/cm/i.test(clean) && Math.max(width, height) > 300)

  if (isMillimeters) {
    width = width / 10
    height = height / 10
  }

  const widthCm = formatNumber(width)
  const heightCm = formatNumber(height)
  const widthIn = formatNumber(width / 2.54, 1)
  const heightIn = formatNumber(height / 2.54, 1)

  return `${widthCm} x ${heightCm} cm / ${widthIn} x ${heightIn} in`
}

export function buildArtworkSeoTitle(artwork: {
  title?: LocalizedText
  category?: string
  medium?: string
  dimensions?: string
}) {
  const title = pickEnglish(artwork.title, "Original artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)
  const dimensions = formatDimensions(artwork.dimensions)
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
