import {
  calculateFinishEstimateCny,
  type QuoteFinishId,
} from "./catalog-config"

export type CatalogPresentationId = "rolled" | QuoteFinishId | "as-listed"

export type StorefrontFinishPricing =
  | { kind: "fixed_delta"; priceDeltaCny: number }
  | { kind: "catalog_formula"; presentationId: Exclude<CatalogPresentationId, "as-listed"> }

export type NormalizedFinishOption = {
  id: string
  label: string
  pricing: StorefrontFinishPricing
  assetSrc: string
  assetAlt: string
}

const FALLBACK_PRESENTATIONS: Readonly<Record<Exclude<CatalogPresentationId, "as-listed">, {
  label: string
  assetSrc: string
}>> = {
  rolled: {
    label: "Rolled Canvas",
    assetSrc: "/images/product-finishes/rolled-canvas-v2.webp",
  },
  stretched: {
    label: "Frameless",
    assetSrc: "/images/product-finishes/stretched-canvas-v2.webp",
  },
  "black-frame": {
    label: "Stretch + Black Frame",
    assetSrc: "/images/product-finishes/black-float-frame-v2.webp",
  },
  "white-frame": {
    label: "Stretch + White Frame",
    assetSrc: "/images/product-finishes/white-float-frame-v2.webp",
  },
  "natural-frame": {
    label: "Stretch + Wood Frame",
    assetSrc: "/images/product-finishes/natural-wood-float-frame-v2.webp",
  },
  "gold-frame": {
    label: "Stretch + Gold Frame",
    assetSrc: "/images/product-finishes/gold-float-frame-v2.webp",
  },
  "silver-frame": {
    label: "Stretch + Silver Frame",
    assetSrc: "/images/product-finishes/silver-float-frame-v2.webp",
  },
}

const AS_LISTED_PRESENTATION = {
  label: "As listed",
  assetSrc: "/images/product-finishes/rolled-canvas-v2.webp",
}

const FALLBACK_PRESENTATION_IDS: readonly Exclude<CatalogPresentationId, "as-listed">[] = [
  "rolled",
  "stretched",
  "gold-frame",
  "silver-frame",
  "black-frame",
  "white-frame",
  "natural-frame",
]

export function buildNormalizedFinishOptions(
  frameOptions: unknown,
  productionModel: "hand_painted_to_order" | "original",
): NormalizedFinishOption[] {
  if (productionModel === "original") {
    return [{
      id: "as-listed",
      label: AS_LISTED_PRESENTATION.label,
      pricing: { kind: "fixed_delta", priceDeltaCny: 0 },
      assetSrc: AS_LISTED_PRESENTATION.assetSrc,
      assetAlt: AS_LISTED_PRESENTATION.label,
    }]
  }

  const configured = normalizeConfiguredFinishes(frameOptions)
  if (hasConfiguredFinishInput(frameOptions)) {
    return configured.length > 0 ? completeCatalogPresentations(configured) : []
  }

  return completeCatalogPresentations([])
}

export function resolveCatalogPresentationId(id: string, label = ""): Exclude<CatalogPresentationId, "as-listed"> | null {
  if (id in FALLBACK_PRESENTATIONS) {
    return id as Exclude<CatalogPresentationId, "as-listed">
  }

  const value = `${id} ${label}`.toLowerCase()
  if (value.includes("gold")) return "gold-frame"
  if (value.includes("silver")) return "silver-frame"
  if (value.includes("white")) return "white-frame"
  if (value.includes("black")) return "black-frame"
  if (value.includes("wood") || value.includes("natural") || value.includes("oak")) return "natural-frame"
  if (value.includes("rolled")) return "rolled"
  if (value.includes("frameless") || value.includes("stretch") || value.includes("gallery")) return "stretched"
  return null
}

export function resolveFinishTotalCny(
  finish: NormalizedFinishOption,
  rolledPriceCny: number,
): number {
  if (finish.pricing.kind === "fixed_delta") {
    return rolledPriceCny + finish.pricing.priceDeltaCny
  }

  return finish.pricing.presentationId === "rolled"
    ? rolledPriceCny
    : calculateFinishEstimateCny(finish.pricing.presentationId, rolledPriceCny)
}

export function resolveFinishDeltaCny(
  finish: NormalizedFinishOption,
  rolledPriceCny: number,
): number {
  return resolveFinishTotalCny(finish, rolledPriceCny) - rolledPriceCny
}

function normalizeConfiguredFinishes(frameOptions: unknown): NormalizedFinishOption[] {
  if (!Array.isArray(frameOptions)) return []

  const idCounts = frameOptions.reduce((counts, value) => {
    if (!value || typeof value !== "object") return counts
    const id = text((value as Record<string, unknown>)._key)
    if (id) counts.set(id, (counts.get(id) || 0) + 1)
    return counts
  }, new Map<string, number>())

  return frameOptions.flatMap((value): NormalizedFinishOption[] => {
    if (!value || typeof value !== "object") return []
    const finish = value as Record<string, unknown>
    const id = text(finish._key)
    const label = text(finish.label)
    const priceDeltaCny = finiteNumber(finish.priceDeltaCny)
    if (
      !id
      || idCounts.get(id) !== 1
      || !label
      || priceDeltaCny === null
      || priceDeltaCny < 0
    ) return []

    const catalogId = resolveCatalogPresentationId(id, label)
    const fallback = catalogId ? FALLBACK_PRESENTATIONS[catalogId] : undefined
    return [{
      id,
      label,
      pricing: { kind: "fixed_delta", priceDeltaCny },
      assetSrc: fallback?.assetSrc || FALLBACK_PRESENTATIONS.rolled.assetSrc,
      assetAlt: label,
    }]
  })
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function hasConfiguredFinishInput(value: unknown) {
  if (value === null || value === undefined) return false
  return !Array.isArray(value) || value.length > 0
}

function completeCatalogPresentations(configured: NormalizedFinishOption[]): NormalizedFinishOption[] {
  const byCatalogId = new Map<Exclude<CatalogPresentationId, "as-listed">, NormalizedFinishOption>()

  for (const finish of configured) {
    const catalogId = resolveCatalogPresentationId(finish.id, finish.label)
    if (!catalogId || byCatalogId.has(catalogId)) continue
    const presentation = FALLBACK_PRESENTATIONS[catalogId]
    byCatalogId.set(catalogId, {
      id: catalogId,
      label: presentation.label,
      pricing: finish.pricing,
      assetSrc: presentation.assetSrc,
      assetAlt: presentation.label,
    })
  }

  return FALLBACK_PRESENTATION_IDS.map((presentationId) => {
    const existing = byCatalogId.get(presentationId)
    if (existing) return existing

    const presentation = FALLBACK_PRESENTATIONS[presentationId]
    return {
      id: presentationId,
      label: presentation.label,
      pricing: { kind: "catalog_formula", presentationId },
      assetSrc: presentation.assetSrc,
      assetAlt: presentation.label,
    }
  })
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}
