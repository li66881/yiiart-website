export type ArtworkCatalogFields = {
  collectionType: "new_collection" | "artist_collection"
  productionModel: "hand_painted_to_order" | "original"
  rightsStatus: "approved" | "needs_review" | "blocked"
  migrationStatus: "ready" | "needs_copy" | "needs_images" | "needs_rights_review" | "archive"
  shortDescription?: { en: string }
  artworkStory?: { en: string }
  materials?: { en: string }
  creationWindow?: { en: string }
  standardSizes: Array<{
    _key: string
    label: string
    widthCm?: number
    heightCm?: number
    priceCny: number
  }>
  frameOptions: Array<{
    _key: string
    label: string
    priceDeltaCny: number
  }>
}

export function parseArtworkCatalogFields(form: FormData): ArtworkCatalogFields {
  const productionModel = enumField(
    form,
    "productionModel",
    ["hand_painted_to_order", "original"] as const,
    "original",
  )
  const standardSizes = parseArray(form, "standardSizes").flatMap((value, index) => {
    if (!value || typeof value !== "object") return []
    const size = value as Record<string, unknown>
    const label = text(size.label)
    const priceCny = positiveNumber(size.priceCny)
    if (!label || !priceCny) return []

    return [{
      _key: safeKey(size.id || size._key, `size-${index + 1}`),
      label,
      widthCm: positiveNumber(size.widthCm) || undefined,
      heightCm: positiveNumber(size.heightCm) || undefined,
      priceCny,
    }]
  })

  if (productionModel === "hand_painted_to_order" && standardSizes.length === 0) {
    throw new Error("A made-to-order artwork requires at least one valid standard size.")
  }

  const frameOptions = parseArray(form, "frameOptions").flatMap((value, index) => {
    if (!value || typeof value !== "object") return []
    const finish = value as Record<string, unknown>
    const label = text(finish.label)
    const priceDeltaCny = nonNegativeNumber(finish.priceDeltaCny)
    if (!label || priceDeltaCny === null) return []

    return [{
      _key: safeKey(finish.id || finish._key, `finish-${index + 1}`),
      label,
      priceDeltaCny,
    }]
  })

  return {
    collectionType: enumField(
      form,
      "collectionType",
      ["new_collection", "artist_collection"] as const,
      "artist_collection",
    ),
    productionModel,
    rightsStatus: enumField(
      form,
      "rightsStatus",
      ["approved", "needs_review", "blocked"] as const,
      "needs_review",
    ),
    migrationStatus: enumField(
      form,
      "migrationStatus",
      ["ready", "needs_copy", "needs_images", "needs_rights_review", "archive"] as const,
      "needs_rights_review",
    ),
    shortDescription: localizedEnglish(form, "shortDescription"),
    artworkStory: localizedEnglish(form, "artworkStory"),
    materials: localizedEnglish(form, "materials"),
    creationWindow: localizedEnglish(form, "creationWindow"),
    standardSizes,
    frameOptions,
  }
}

function enumField<const T extends readonly string[]>(
  form: FormData,
  name: string,
  options: T,
  fallback: T[number],
) {
  const value = text(form.get(name))
  return (options as readonly string[]).includes(value) ? value as T[number] : fallback
}

function localizedEnglish(form: FormData, name: string) {
  const value = text(form.get(name))
  return value ? { en: value } : undefined
}

function parseArray(form: FormData, name: string): unknown[] {
  const raw = text(form.get(name))
  if (!raw) return []

  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value : []
  } catch {
    throw new Error(`${name} must be valid JSON.`)
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
}

function positiveNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function nonNegativeNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function safeKey(value: unknown, fallback: string) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-|-$/g, "") || fallback
}
