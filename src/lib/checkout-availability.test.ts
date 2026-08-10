import assert from "node:assert/strict"
import test from "node:test"
import { isArtworkCheckoutAvailable } from "./checkout-availability"

test("requires rolled shipping for hand-painted-to-order direct checkout", () => {
  assert.equal(isArtworkCheckoutAvailable({
    productionModel: "hand_painted_to_order",
    allowCheckout: true,
    availability: "available",
    shippingProfile: "Ships rolled",
  }), true)
  assert.equal(isArtworkCheckoutAvailable({
    productionModel: "hand_painted_to_order",
    allowCheckout: true,
    availability: "available",
    shippingProfile: "Ships stretched",
  }), false)
})

test("keeps available original artworks compatible with their existing shipping fields", () => {
  assert.equal(isArtworkCheckoutAvailable({
    productionModel: "original",
    allowCheckout: true,
    availability: "available",
    shippingProfile: "",
  }), true)
})

test("blocks sold and actively reserved artworks regardless of shipping profile", () => {
  assert.equal(isArtworkCheckoutAvailable({
    productionModel: "hand_painted_to_order",
    allowCheckout: true,
    availability: "sold",
    shippingProfile: "Ships rolled",
  }), false)
  assert.equal(isArtworkCheckoutAvailable({
    productionModel: "hand_painted_to_order",
    allowCheckout: true,
    availability: "reserved",
    reservedUntil: "2099-01-01T00:00:00.000Z",
    shippingProfile: "Ships rolled",
  }, Date.parse("2026-08-10T00:00:00.000Z")), false)
})
