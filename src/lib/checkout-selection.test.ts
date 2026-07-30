import assert from "node:assert/strict"
import test from "node:test"
import { CheckoutValidationError, resolveCheckoutSelection } from "./checkout-selection"

test("resolves a legacy original with customizable size ladder and finishes", () => {
  const selection = resolveCheckoutSelection({
    _id: "legacy-1",
    price: 7200,
    dimensions: "80 x 100 cm",
    widthCm: 80,
    heightCm: 100,
  }, { id: "legacy-1", quantity: 1 })

  assert.equal(selection.productionModel, "original")
  assert.equal(selection.priceCny, 7200)
  assert.equal(selection.sizeId, "original")
  assert.equal(selection.finishId, "rolled")
  assert.match(selection.finishLabel, /rolled/i)
})

test("allows selecting an expanded size on a legacy original", () => {
  const selection = resolveCheckoutSelection({
    _id: "legacy-1",
    price: 7200,
    dimensions: "80 x 100 cm",
    widthCm: 80,
    heightCm: 100,
  }, {
    id: "legacy-1",
    quantity: 1,
    sizeId: "36x48",
    finishId: "black-frame",
  })

  assert.ok(selection.priceCny > 0)
  assert.equal(selection.sizeId, "36x48")
  assert.equal(selection.finishId, "black-frame")
})

test("resolves a made-to-order size and finish from Sanity values", () => {
  const selection = resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [
      { _key: "80x100", label: "80 x 100 cm", widthCm: 80, heightCm: 100, priceCny: 2600 },
      { _key: "100x120", label: "100 x 120 cm", widthCm: 100, heightCm: 120, priceCny: 3400 },
      { _key: "120x150", label: "120 x 150 cm", widthCm: 120, heightCm: 150, priceCny: 4200 },
      { _key: "150x180", label: "150 x 180 cm", widthCm: 150, heightCm: 180, priceCny: 5200 },
    ],
    frameOptions: [
      { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
      { _key: "black", label: "Black float frame", priceDeltaCny: 600 },
      { _key: "wood", label: "Wood frame", priceDeltaCny: 800 },
    ],
  }, {
    id: "catalog-1",
    quantity: 2,
    sizeId: "100x120",
    finishId: "black",
  })

  assert.equal(selection.priceCny, 4000)
  assert.match(selection.sizeLabel, /100|120/)
  assert.equal(selection.finishLabel, "Black float frame")
})

test("rejects an unknown made-to-order size", () => {
  assert.throws(() => resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, {
    id: "catalog-1",
    quantity: 1,
    sizeId: "forged-size",
    finishId: "rolled",
  }), CheckoutValidationError)
})

test("rejects an unknown made-to-order finish", () => {
  assert.throws(() => resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, {
    id: "catalog-1",
    quantity: 1,
    sizeId: "80x100",
    finishId: "forged-finish",
  }), CheckoutValidationError)
})

test("ignores browser-submitted labels and prices", () => {
  const selection = resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, {
    id: "catalog-1",
    quantity: 1,
    sizeId: "80x100",
    finishId: "rolled",
    price: 1,
    sizeLabel: "Forged label",
  } as never)

  assert.equal(selection.priceCny, 2600)
  assert.match(selection.sizeLabel, /80|100/)
})

test("permits quantity above one for customizable originals and made-to-order", () => {
  const original = resolveCheckoutSelection(
    { _id: "legacy-1", price: 7200, widthCm: 80, heightCm: 100 },
    { id: "legacy-1", quantity: 2 },
  )
  assert.equal(original.quantity, 2)

  const selection = resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, { id: "catalog-1", quantity: 3, sizeId: "80x100", finishId: "rolled" })

  assert.equal(selection.quantity, 3)
})
