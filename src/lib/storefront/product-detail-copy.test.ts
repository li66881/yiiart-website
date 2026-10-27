import assert from "node:assert/strict"
import test from "node:test"
import { buildProductDetailCopy } from "./product-detail-copy"

test("keeps processing time separate from the shipping format", () => {
  const copy = buildProductDetailCopy({
    creationWindow: "Production timing and approval stages are confirmed after ordering.",
    shippingProfile: "Ships rolled",
  })

  assert.equal(copy.processingTime, "Production timing and approval stages are confirmed after ordering.")
  assert.match(copy.dispatch, /protective tube/i)
  assert.match(copy.dispatch, /carrier confirmation before payment/i)
})

test("uses cautious fallbacks when product timing or dispatch data is absent", () => {
  const copy = buildProductDetailCopy({ creationWindow: "", shippingProfile: "" })

  assert.match(copy.processingTime, /confirmed before the order is finalized/i)
  assert.match(copy.dispatch, /confirmed before dispatch/i)
})
