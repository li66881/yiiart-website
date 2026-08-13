import {
  buildNormalizedFinishOptions,
  resolveFinishTotalCny,
} from "./storefront/finish-options"

export class CheckoutValidationError extends Error {}

export type CheckoutSelectionRequest = {
  id: string
  quantity: number
  sizeId?: string
  finishId?: string
}

export type CheckoutSelectionArtwork = {
  _id: string
  price?: number | null
  dimensions?: string | null
  productionModel?: "hand_painted_to_order" | "original" | null
  standardSizes?: Array<{
    _key?: string
    label?: string
    priceCny?: number | null
  }> | null
  frameOptions?: Array<{
    _key?: string
    label?: string
    priceDeltaCny?: number | null
  }> | null
}

export type CheckoutSelection = {
  productionModel: "hand_painted_to_order" | "original"
  quantity: number
  sizeId: string
  sizeLabel: string
  finishId: string
  finishLabel: string
  priceCny: number
}

export function resolveCheckoutSelection(
  artwork: CheckoutSelectionArtwork,
  request: CheckoutSelectionRequest,
): CheckoutSelection {
  const productionModel = artwork.productionModel === "hand_painted_to_order"
    ? "hand_painted_to_order"
    : "original"
  const quantity = normalizeQuantity(request.quantity, productionModel)

  if (productionModel === "original") {
    const priceCny = positiveNumber(artwork.price)
    if (!priceCny) {
      throw new CheckoutValidationError("One or more artworks do not have a valid price.")
    }

    const finish = buildNormalizedFinishOptions(artwork.frameOptions, productionModel)[0]
    return {
      productionModel,
      quantity,
      sizeId: "original",
      sizeLabel: text(artwork.dimensions) || "Original size",
      finishId: finish.id,
      finishLabel: finish.label,
      priceCny: resolveFinishTotalCny(finish, priceCny),
    }
  }

  const sizes = (artwork.standardSizes || []).filter((size) => (
    Boolean(text(size?._key))
    && Boolean(text(size?.label))
    && Boolean(positiveNumber(size?.priceCny))
  ))
  const requestedSizeId = text(request.sizeId) || text(sizes[0]?._key)
  const size = sizes.find((option) => text(option._key) === requestedSizeId)
  if (!size) {
    throw new CheckoutValidationError("The selected artwork size is no longer available.")
  }

  const finishes = buildNormalizedFinishOptions(artwork.frameOptions, productionModel)
  const requestedFinishId = text(request.finishId) || finishes[0]?.id
  const finish = finishes.find((option) => option.id === requestedFinishId)
  if (!finish) {
    throw new CheckoutValidationError("The selected artwork finish is no longer available.")
  }

  return {
    productionModel,
    quantity,
    sizeId: text(size._key),
    sizeLabel: text(size.label),
    finishId: finish.id,
    finishLabel: finish.label,
    priceCny: resolveFinishTotalCny(finish, positiveNumber(size.priceCny)!),
  }
}

function normalizeQuantity(value: unknown, productionModel: CheckoutSelection["productionModel"]) {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new CheckoutValidationError("Invalid cart item quantity.")
  }
  if (productionModel === "original" && quantity !== 1) {
    throw new CheckoutValidationError("Original artwork quantity must be one.")
  }
  if (productionModel === "hand_painted_to_order" && quantity > 99) {
    throw new CheckoutValidationError("Made-to-order quantity cannot exceed 99.")
  }
  return quantity
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function positiveNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}
