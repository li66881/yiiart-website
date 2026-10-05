import assert from "node:assert/strict"
import test from "node:test"
import { buildStorefrontProduct } from "./product"
import {
  buildProductVariantGroup,
  buildProductOfferIdentity,
  buildProductVariantUrl,
  getProductSelection,
  resolveProductVariantIds,
} from "./selection"

const product = {
  sizes: [
    { id: "80x100", label: "80 x 100 cm", priceCny: 2600 },
    { id: "100x120", label: "100 x 120 cm", priceCny: 3400 },
  ],
  finishes: [
    {
      id: "rolled",
      label: "Rolled canvas",
      pricing: { kind: "fixed_delta" as const, priceDeltaCny: 0 },
      assetSrc: "/images/product-finishes/rolled-canvas.webp",
      assetAlt: "Rolled canvas",
    },
    {
      id: "black",
      label: "Black float frame",
      pricing: { kind: "fixed_delta" as const, priceDeltaCny: 600 },
      assetSrc: "/images/product-finishes/black-float-frame.webp",
      assetAlt: "Black float frame",
    },
  ],
}

test("returns authoritative selected size, finish, and price", () => {
  const selection = getProductSelection(product, "100x120", "black")

  assert.equal(selection?.size.id, "100x120")
  assert.equal(selection?.finish.id, "black")
  assert.equal(selection?.priceCny, 4000)
})

test("falls back to the first available options", () => {
  const selection = getProductSelection(product, "missing", "missing")

  assert.equal(selection?.size.id, "80x100")
  assert.equal(selection?.finish.id, "rolled")
  assert.equal(selection?.priceCny, 2600)
})

test("resolves direct variant URLs and falls back safely for invalid or repeated params", () => {
  assert.deepEqual(resolveProductVariantIds(product, { size: "100x120", finish: "black" }), {
    sizeId: "100x120",
    finishId: "black",
    isValid: true,
  })
  assert.deepEqual(resolveProductVariantIds(product, { size: "missing", finish: ["black", "rolled"] }), {
    sizeId: "80x100",
    finishId: "rolled",
    isValid: false,
  })
})

test("marks conflicting or unknown selection params invalid instead of choosing by order", () => {
  assert.deepEqual(resolveProductVariantIds(product, {
    size: ["80x100", "100x120"],
    finish: "rolled",
  }), { sizeId: "80x100", finishId: "rolled", isValid: false })
  assert.deepEqual(resolveProductVariantIds(product, { size: "unknown" }), {
    sizeId: "80x100",
    finishId: "rolled",
    isValid: false,
  })
})

test("keeps the base SKU and URL when the product has only one purchasable combination", () => {
  const singleOptionProduct = { sizes: [product.sizes[0]], finishes: [product.finishes[0]] }
  assert.deepEqual(buildProductOfferIdentity(
    "https://www.yiiart.com/artwork/original-work",
    "original-work",
    singleOptionProduct,
    { sizeId: "80x100", finishId: "rolled" },
    true,
  ), {
    sku: "original-work",
    url: "https://www.yiiart.com/artwork/original-work",
  })
})

test("uses a variant offer identity only for an unambiguous valid selection", () => {
  const baseUrl = "https://www.yiiart.com/artwork/quiet-field"
  assert.deepEqual(buildProductOfferIdentity(baseUrl, "quiet-field", product, {
    sizeId: "100x120",
    finishId: "black",
  }, true), {
    sku: "quiet-field-31303078313230-626c61636b",
    url: `${baseUrl}?size=100x120&finish=black`,
  })
  assert.deepEqual(buildProductOfferIdentity(baseUrl, "quiet-field", product, {
    sizeId: "80x100",
    finishId: "rolled",
  }, false), {
    sku: "quiet-field",
    url: baseUrl,
  })
})

test("builds a size-only ProductGroup when the presentation is fixed", () => {
  const baseUrl = "https://www.yiiart.com/artwork/quiet-field"
  assert.equal(buildProductVariantUrl(baseUrl, { sizeId: "100 x 120", finishId: "black" }),
    `${baseUrl}?size=100+x+120&finish=black`)
  const group = buildProductVariantGroup({
    id: "quiet-field-id",
    title: "Quiet Field",
    description: "Abstract landscape painting",
    brand: "YiiArt",
    baseUrl,
    images: ["https://cdn.example/quiet-field.jpg"],
    sizes: product.sizes,
    finishes: [product.finishes[0]],
    sku: "quiet-field",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    formatPrice: (price) => (price / 7.5).toFixed(2),
  })

  assert.equal(group?.["@type"], "ProductGroup")
  assert.equal(group?.productGroupID, "quiet-field-id")
  assert.deepEqual(group?.variesBy, ["https://schema.org/size"])
  assert.equal(group?.hasVariant.length, 2)
  assert.equal(group?.hasVariant[1].offers.price, "453.33")
  assert.equal(group?.hasVariant[1].offers.url,
    `${baseUrl}?size=100x120&finish=rolled`)
  assert.equal(new Set(group?.hasVariant.map(({ sku }) => sku)).size, 2)
})

test("omits ProductGroup when presentations are also selectable variants", () => {
  const result = buildProductVariantGroup({
    id: "quiet-field-id",
    title: "Quiet Field",
    description: "Abstract landscape painting",
    brand: "YiiArt",
    baseUrl: "https://www.yiiart.com/artwork/quiet-field",
    images: [],
    ...product,
    sku: "quiet-field",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    formatPrice: String,
  })
  assert.equal(result, null)
})

test("omits ProductGroup when variant identifiers are ambiguous", () => {
  const result = buildProductVariantGroup({
    id: "quiet-field-id",
    title: "Quiet Field",
    description: "Abstract landscape painting",
    brand: "YiiArt",
    baseUrl: "https://www.yiiart.com/artwork/quiet-field",
    images: [],
    ...product,
    sizes: [...product.sizes, { ...product.sizes[0], label: "Duplicate" }],
    sku: "quiet-field",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    formatPrice: String,
  })
  assert.equal(result, null)
})

test("returns null when a product cannot be purchased", () => {
  assert.equal(getProductSelection({ sizes: [], finishes: [] }, "", ""), null)
})

test("uses catalog finish pricing for a fallback made-to-order product", () => {
  const product = buildStorefrontProduct({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 1730 }],
  }, [])

  const selection = getProductSelection(product, "80x100", "gold-frame")

  assert.equal(selection?.priceCny, 3090)
})
