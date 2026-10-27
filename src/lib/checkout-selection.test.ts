import assert from "node:assert/strict"
import test from "node:test"
import { CheckoutValidationError, resolveCheckoutSelection } from "./checkout-selection"

test("resolves a legacy original from its authoritative base price", () => {
  const selection = resolveCheckoutSelection({
    _id: "legacy-1",
    price: 7200,
    dimensions: "80 x 100 cm",
  }, { id: "legacy-1", quantity: 1 })

  assert.equal(selection.productionModel, "original")
  assert.equal(selection.priceCny, 7200)
  assert.equal(selection.sizeLabel, "80 x 100 cm")
  assert.equal(selection.finishLabel, "As listed")
})

test("refuses non-rolled finishes for direct checkout even when legacy records contain them", () => {
  assert.throws(() => resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [
      { _key: "80x100", label: "80 x 100 cm", priceCny: 2600 },
      { _key: "100x120", label: "100 x 120 cm", priceCny: 3400 },
    ],
    frameOptions: [
      { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
      { _key: "black", label: "Black float frame", priceDeltaCny: 600 },
    ],
  }, {
    id: "catalog-1",
    quantity: 2,
    sizeId: "100x120",
    finishId: "black",
  }), /require destination and carrier confirmation/i)
})

test("server rejects a non-rolled fallback finish from direct checkout", () => {
  assert.throws(
    () => resolveCheckoutSelection({
      _id: "catalog-1",
      productionModel: "hand_painted_to_order",
      standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 1730 }],
    }, { id: "catalog-1", quantity: 1, sizeId: "80x100", finishId: "gold-frame" }),
    /require destination and carrier confirmation/i,
  )
})

const malformedCheckoutPriceDeltas: Array<{
  name: string
  value?: unknown
  omit?: boolean
}> = [
  { name: "an absent value", omit: true },
  { name: "null", value: null },
  { name: "a blank string", value: "" },
  { name: "whitespace", value: "   " },
  { name: "NaN", value: Number.NaN },
  { name: "positive infinity", value: Number.POSITIVE_INFINITY },
  { name: "a numeric string", value: "0" },
  { name: "a non-number string", value: "free" },
  { name: "a boolean", value: false },
]

test("authoritative checkout rejects configured finishes with malformed price deltas", async (t) => {
  for (const invalid of malformedCheckoutPriceDeltas) {
    await t.test(invalid.name, () => {
      const configured = {
        _key: "rolled",
        label: "Rolled canvas",
        ...(!invalid.omit ? { priceDeltaCny: invalid.value } : {}),
      }

      assert.throws(() => resolveCheckoutSelection({
        _id: "catalog-malformed-finish",
        productionModel: "hand_painted_to_order",
        standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
        frameOptions: [configured],
      } as never, {
        id: "catalog-malformed-finish",
        quantity: 1,
        sizeId: "80x100",
        finishId: "rolled",
      }), CheckoutValidationError)
    })
  }
})

test("authoritative checkout rejects ambiguous duplicate normalized finish ids", () => {
  assert.throws(() => resolveCheckoutSelection({
    _id: "catalog-duplicate-finish",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [
      { _key: " rolled ", label: "Rolled canvas", priceDeltaCny: 0 },
      { _key: "rolled", label: "Rolled duplicate", priceDeltaCny: 200 },
    ],
  }, {
    id: "catalog-duplicate-finish",
    quantity: 1,
    sizeId: "80x100",
    finishId: "rolled",
  }), CheckoutValidationError)
})

test("authoritative checkout preserves a numeric zero configured price delta", () => {
  const selection = resolveCheckoutSelection({
    _id: "catalog-zero-finish",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, {
    id: "catalog-zero-finish",
    quantity: 1,
    sizeId: "80x100",
    finishId: "rolled",
  })

  assert.equal(selection.priceCny, 2600)
})

test("authoritative checkout rejects stretched canvas from the generated fallback options", () => {
  assert.throws(() => resolveCheckoutSelection({
    _id: "catalog-stretched",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, {
    id: "catalog-stretched",
    quantity: 1,
    sizeId: "80x100",
    finishId: "stretched",
  }), /require destination and carrier confirmation/i)
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
  assert.equal(selection.sizeLabel, "80 x 100 cm")
})

test("rejects quantity above one for an original but permits made-to-order quantity", () => {
  assert.throws(
    () => resolveCheckoutSelection({ _id: "legacy-1", price: 7200 }, { id: "legacy-1", quantity: 2 }),
    /quantity/i,
  )

  const selection = resolveCheckoutSelection({
    _id: "catalog-1",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
    frameOptions: [{ _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 }],
  }, { id: "catalog-1", quantity: 3, sizeId: "80x100", finishId: "rolled" })

  assert.equal(selection.quantity, 3)
})
