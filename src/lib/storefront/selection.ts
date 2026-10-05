import type { StorefrontFinish, StorefrontSize } from "./product"
import { resolveFinishTotalCny } from "./finish-options"

type SelectableProduct = {
  sizes: StorefrontSize[]
  finishes: StorefrontFinish[]
}

export type ProductVariantParams = {
  size?: string | string[]
  finish?: string | string[]
}

export function buildProductVariantUrl(
  baseUrl: string,
  selection: { sizeId: string; finishId: string },
) {
  const url = new URL(baseUrl)
  if (selection.sizeId) url.searchParams.set("size", selection.sizeId)
  if (selection.finishId) url.searchParams.set("finish", selection.finishId)
  return url.toString()
}

export function buildProductVariantSku(
  productSku: string,
  selection: { sizeId: string; finishId: string },
) {
  return `${productSku}-${variantToken(selection.sizeId)}-${variantToken(selection.finishId)}`
}

export function buildProductOfferIdentity(
  baseUrl: string,
  productSku: string,
  product: SelectableProduct,
  selection: { sizeId: string; finishId: string },
  selectionIsValid: boolean,
) {
  if (
    !selectionIsValid
    || product.sizes.length * product.finishes.length <= 1
    || !selection.sizeId
    || !selection.finishId
  ) return { sku: productSku, url: baseUrl }

  return {
    sku: buildProductVariantSku(productSku, selection),
    url: buildProductVariantUrl(baseUrl, selection),
  }
}

export function buildProductVariantGroup(product: {
  id: string
  title: string
  description: string
  brand: string
  baseUrl: string
  images: string[]
  sizes: StorefrontSize[]
  finishes: StorefrontFinish[]
  sku: string
  priceCurrency: string
  availability: string
  formatPrice: (priceCny: number) => string
}) {
  if (product.sizes.length < 1 || product.finishes.length < 1) return null
  if (product.sizes.length < 2) return null
  if (product.finishes.length !== 1) return null
  if (
    new Set(product.sizes.map(({ id }) => id)).size !== product.sizes.length
    || new Set(product.finishes.map(({ id }) => id)).size !== product.finishes.length
  ) return null

  const finish = product.finishes[0]
  const variants = product.sizes.map((size) => {
    const selection = { sizeId: size.id, finishId: finish.id }
    const priceCny = resolveFinishTotalCny(finish, size.priceCny)
    return {
      "@type": "Product",
      sku: buildProductVariantSku(product.sku, selection),
      name: `${product.title} - ${size.label} - ${finish.label}`,
      image: product.images,
      size: size.label,
      inProductGroupWithID: product.id,
      offers: {
        "@type": "Offer",
        url: buildProductVariantUrl(product.baseUrl, selection),
        sku: buildProductVariantSku(product.sku, selection),
        priceCurrency: product.priceCurrency,
        availability: product.availability,
        itemCondition: "https://schema.org/NewCondition",
        price: product.formatPrice(priceCny),
      },
    }
  })
  const variantSkus = variants.map((variant) => variant.sku)
  if (new Set(variantSkus).size !== variants.length) return null

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": `${product.baseUrl}#product-group`,
    productGroupID: product.id,
    name: product.title,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    url: product.baseUrl,
    variesBy: ["https://schema.org/size"],
    hasVariant: variants,
  }
}

function variantToken(value: string) {
  return Array.from(new TextEncoder().encode(value.trim()))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("") || "default"
}

export function resolveProductVariantIds(
  product: SelectableProduct,
  params: ProductVariantParams,
) {
  const requestedSize = parseParam(params.size)
  const requestedFinish = parseParam(params.finish)
  const requestedSizeId = requestedSize.value
  const requestedFinishId = requestedFinish.value
  const hasValidSize = !requestedSizeId || product.sizes.some((option) => option.id === requestedSizeId)
  const hasValidFinish = !requestedFinishId || product.finishes.some((option) => option.id === requestedFinishId)
  return {
    sizeId: product.sizes.some((option) => option.id === requestedSizeId)
      ? requestedSizeId
      : product.sizes[0]?.id || "",
    finishId: product.finishes.some((option) => option.id === requestedFinishId)
      ? requestedFinishId
      : product.finishes[0]?.id || "",
    isValid: requestedSize.isValid && requestedFinish.isValid && hasValidSize && hasValidFinish,
  }
}

function parseParam(value?: string | string[]) {
  if (value === undefined) return { value: "", isValid: true }
  if (Array.isArray(value)) {
    return value.length === 1 && value[0].trim()
      ? { value: value[0], isValid: true }
      : { value: "", isValid: false }
  }
  const normalized = value.trim()
  return normalized ? { value: normalized, isValid: true } : { value: "", isValid: false }
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
    priceCny: resolveFinishTotalCny(finish, size.priceCny),
  }
}
