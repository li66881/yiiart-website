import { buildStorefrontProduct } from "@/lib/storefront/product"

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
  widthCm?: number | string | null
  heightCm?: number | string | null
  productionModel?: "hand_painted_to_order" | "original" | null
  standardSizes?: Array<{
    _key?: string
    label?: string
    widthCm?: number | null
    heightCm?: number | null
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
  const quantity = normalizeQuantity(request.quantity)
  const product = buildStorefrontProduct(
    {
      _id: artwork._id,
      price: artwork.price,
      dimensions: artwork.dimensions,
      widthCm: artwork.widthCm,
      heightCm: artwork.heightCm,
      productionModel: artwork.productionModel,
      standardSizes: artwork.standardSizes,
      frameOptions: artwork.frameOptions,
    },
    [],
  )

  if (product.sizes.length === 0) {
    throw new CheckoutValidationError("One or more artworks do not have a valid price.")
  }

  const requestedSizeId = text(request.sizeId)
  const size = requestedSizeId
    ? product.sizes.find((option) => option.id === requestedSizeId)
    : product.sizes[0]
  if (!size) {
    throw new CheckoutValidationError("The selected artwork size is no longer available.")
  }

  const requestedFinishId = text(request.finishId)
  const finish = requestedFinishId
    ? product.finishes.find((option) => option.id === requestedFinishId)
    : product.finishes[0]
  if (!finish) {
    throw new CheckoutValidationError("The selected artwork finish is no longer available.")
  }

  return {
    productionModel,
    quantity,
    sizeId: size.id,
    sizeLabel: size.label,
    finishId: finish.id,
    finishLabel: finish.label,
    priceCny: size.priceCny + finish.priceDeltaCny,
  }
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new CheckoutValidationError("Invalid cart item quantity.")
  }
  if (quantity > 99) {
    throw new CheckoutValidationError("Quantity cannot exceed 99.")
  }
  return quantity
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}
