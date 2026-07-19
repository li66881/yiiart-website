import type { StorefrontFinish, StorefrontSize } from "./product"

type SelectableProduct = {
  sizes: StorefrontSize[]
  finishes: StorefrontFinish[]
}

export function getProductSelection(
  product: SelectableProduct,
  sizeId: string,
  finishId: string,
) {
  const size = product.sizes.find((option) => option.id === sizeId) || product.sizes[0]
  const finish = product.finishes.find((option) => option.id === finishId) || product.finishes[0]
  if (!size || !finish) return null

  return {
    size,
    finish,
    priceCny: size.priceCny + finish.priceDeltaCny,
  }
}
