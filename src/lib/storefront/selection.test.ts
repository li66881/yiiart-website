import assert from "node:assert/strict"
import test from "node:test"
import { buildStorefrontProduct } from "./product"
import { getProductSelection } from "./selection"

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
