export type PhysicalDimensions = { widthCm: number; heightCm: number }

export function isPhysicalDimensions(value: unknown): value is PhysicalDimensions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const dimensions = value as Record<string, unknown>
  return isPositiveNumber(dimensions.widthCm) && isPositiveNumber(dimensions.heightCm)
}

export function readPhysicalDimensions(widthCm: unknown, heightCm: unknown): PhysicalDimensions | null {
  const normalizedWidthCm = readPhysicalDimension(widthCm)
  const normalizedHeightCm = readPhysicalDimension(heightCm)
  if (normalizedWidthCm === null || normalizedHeightCm === null) return null

  return { widthCm: normalizedWidthCm, heightCm: normalizedHeightCm }
}

export function parsePhysicalDimensions(value: unknown): PhysicalDimensions | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  if (!normalized.includes("cm")
    || /\b(?:px|pixels?)\b/.test(normalized)
    || /[-\u2010-\u2015\u2212\uFE63\uFF0D]\s*\d/.test(normalized)) return null

  const match = normalized.match(/(^|[^-\d.])(\d+(?:\.\d+)?)\s*[x\u00d7\u8133]\s*(\d+(?:\.\d+)?)\s*cm\b/)
  if (!match) return null

  return readPhysicalDimensions(Number(match[2]), Number(match[3]))
}

function readPhysicalDimension(value: unknown): number | null {
  const number = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() ? Number(value) : Number.NaN

  return isPositiveNumber(number) ? number : null
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}
