export type GalleryRole = "room" | "artwork" | "texture" | "edge"

export type ArtworkGalleryItem = {
  url: string
  role: GalleryRole
  alt: string
  isVisualization: boolean
}

export type PresentationOption = {
  label: string
  image?: string
}

type GalleryInput = {
  title: string
  explicit?: Array<{
    url?: string | null
    role?: unknown
    alt?: string | null
  }>
  fallbackUrls?: string[]
}

export function buildGalleryItems({ title, explicit = [], fallbackUrls = [] }: GalleryInput) {
  const seen = new Set<string>()
  const explicitItems = explicit.flatMap((item): ArtworkGalleryItem[] => {
    const url = item.url?.trim()
    if (!url || seen.has(url)) return []
    seen.add(url)
    const role = normalizeGalleryRole(item.role)
    return [{
      url,
      role,
      alt: item.alt?.trim() || defaultAlt(title, role, 1),
      isVisualization: role === "room",
    }]
  })

  if (explicitItems.length > 0) return explicitItems

  return fallbackUrls.flatMap((url, index): ArtworkGalleryItem[] => {
    if (!url || seen.has(url)) return []
    seen.add(url)
    const role: GalleryRole = index === 0 ? "artwork" : "texture"
    return [{
      url,
      role,
      alt: defaultAlt(title, role, index + 1),
      isVisualization: false,
    }]
  })
}

export function normalizePresentationOptions(input: unknown): PresentationOption[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  return input.flatMap((value): PresentationOption[] => {
    const label = typeof value === "string" ? value.trim() : ""
    const key = label.toLocaleLowerCase()
    if (!label || seen.has(key)) return []
    seen.add(key)
    return [{ label }]
  })
}

export function validatePresentationOption(
  requested: unknown,
  options: PresentationOption[],
) {
  if (typeof requested !== "string" || !requested.trim()) return undefined
  const match = options.find((option) => option.label === requested.trim())
  return match?.label
}

function defaultAlt(title: string, role: GalleryRole, index: number) {
  if (role === "room") return `${title}, room visualization showing artwork scale`
  if (role === "artwork") return `${title}, full artwork view`
  if (role === "edge") return `${title}, canvas edge and presentation detail`
  return `${title}, detail view ${index}`
}

function normalizeGalleryRole(value: unknown): GalleryRole {
  return value === "room" || value === "artwork" || value === "texture" || value === "edge"
    ? value
    : "artwork"
}
