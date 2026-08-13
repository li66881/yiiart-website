import {
  calculateFinishEstimateCny,
  quoteFinishOptions,
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
    label: "Rolled canvas",
    assetSrc: "/images/product-finishes/rolled-canvas.webp",
  },
  stretched: {
    label: "Stretched canvas",
    assetSrc: "/images/product-finishes/stretched-canvas.webp",
  },
  "black-frame": {
    label: "Black float frame",
    assetSrc: "/images/product-finishes/black-float-frame.webp",
  },
  "white-frame": {
    label: "White float frame",
    assetSrc: "/images/product-finishes/white-float-frame.webp",
  },
  "natural-frame": {
    label: "Natural wood float frame",
    assetSrc: "/images/product-finishes/natural-wood-float-frame.webp",
  },
  "gold-frame": {
    label: "Gold float frame",
    assetSrc: "/images/product-finishes/gold-float-frame.webp",
  },
  "silver-frame": {
    label: "Silver float frame",
    assetSrc: "/images/product-finishes/silver-float-frame.webp",
  },
}

const AS_LISTED_PRESENTATION = {
  label: "As listed",
  assetSrc: "/images/product-finishes/rolled-canvas.webp",
}

const FALLBACK_PRESENTATION_IDS: readonly Exclude<CatalogPresentationId, "as-listed">[] = [
  "rolled",
  ...quoteFinishOptions.map((finish) => finish.id),
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
  if (hasConfiguredFinishInput(frameOptions)) return configured

  return FALLBACK_PRESENTATION_IDS.map((presentationId) => {
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

    const fallback = FALLBACK_PRESENTATIONS[id as Exclude<CatalogPresentationId, "as-listed">]
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

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}
