import assert from "node:assert/strict"
import test from "node:test"
import { normalizeCheckoutAddress } from "./orders"

const baseAddress = {
  email: "buyer@example.com",
  name: "A Buyer",
  phone: "+1 415 555 0100",
  address: "1 Market Street",
  city: "San Francisco",
  postalCode: "94105",
  country: "US",
}

test("US checkout addresses require and preserve the state for PayPal and order records", () => {
  assert.throws(() => normalizeCheckoutAddress(baseAddress), /state is required/i)
  assert.equal(normalizeCheckoutAddress({ ...baseAddress, state: "CA" }).state, "CA")
})

test("non-US checkout addresses do not require a state or province", () => {
  assert.equal(normalizeCheckoutAddress({ ...baseAddress, country: "GB" }).state, "")
})
