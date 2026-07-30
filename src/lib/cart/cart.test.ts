import assert from "node:assert/strict"
import test from "node:test"
import {
  addCartItem,
  cartLineKey,
  normalizeStoredCart,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
} from "./cart"

const small: CartItem = {
  key: "art-1:60x80:rolled",
  id: "art-1",
  slug: "soft-horizon",
  title: "Soft Horizon",
  artist: "YiiArt Studio",
  price: 1800,
  image: "https://cdn.example/soft-horizon.jpg",
  quantity: 1,
  productionModel: "hand_painted_to_order",
  sizeId: "60x80",
  sizeLabel: "60 x 80 cm",
  finishId: "rolled",
  finishLabel: "Rolled canvas",
}

const large: CartItem = {
  ...small,
  key: "art-1:100x120:rolled",
  price: 3200,
  sizeId: "100x120",
  sizeLabel: "100 x 120 cm",
}

test("creates distinct keys for different size and finish selections", () => {
  assert.notEqual(
    cartLineKey({ id: "art-1", sizeId: "60x80", finishId: "rolled" }),
    cartLineKey({ id: "art-1", sizeId: "100x120", finishId: "rolled" }),
  )
})

test("normalizes a legacy stored item without losing compatibility", () => {
  const items = normalizeStoredCart([{
    id: "legacy-id",
    title: "Legacy Work",
    artist: "Artist",
    price: 7200,
    image: "https://cdn.example/legacy.jpg",
    quantity: 4,
    size: "80 x 100 cm",
  }])

  assert.equal(items[0].key, "legacy-id")
  assert.equal(items[0].productionModel, "original")
  assert.equal(items[0].quantity, 1)
  assert.equal(items[0].sizeLabel, "80 x 100 cm")
})

test("keeps different variants as separate cart lines", () => {
  const items = addCartItem(addCartItem([], small), large)
  assert.equal(items.length, 2)
})

test("increments a repeated made-to-order selection and caps quantity", () => {
  const twice = addCartItem([small], small)
  const capped = updateCartQuantity(twice, small.key, 200)
  assert.equal(twice[0].quantity, 2)
  assert.equal(capped[0].quantity, 99)
})

test("never increments original artwork above one", () => {
  const original: CartItem = {
    ...small,
    key: "original-1",
    id: "original-1",
    productionModel: "original",
  }

  assert.equal(addCartItem([original], original)[0].quantity, 1)
  assert.equal(updateCartQuantity([original], original.key, 3)[0].quantity, 1)
})

test("removes a line by its variant key", () => {
  assert.deepEqual(removeCartItem([small, large], small.key), [large])
})
