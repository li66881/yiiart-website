import assert from "node:assert/strict"
import test from "node:test"
import {
  calculateFinishEstimateCny,
  calculateRolledPriceCny,
  getCatalogSizes,
  partitionRolledSizesForCheckout,
  quoteFinishOptions,
} from "./catalog-config"

test("uses the approved benchmark formula and CNY 10 rounding", () => {
  assert.equal(calculateRolledPriceCny(60, 60), 1730)
  assert.equal(calculateFinishEstimateCny("stretched", 1730), 2940)
  assert.equal(calculateFinishEstimateCny("black-frame", 1730), 3090)
})

test("returns the approved square profile with stable ids", () => {
  const sizes = getCatalogSizes("square", "portrait")
  assert.equal(sizes.length, 9)
  assert.deepEqual(sizes[0], { id: "60x60", label: "60 x 60 cm", widthCm: 60, heightCm: 60 })
  assert.deepEqual(sizes.at(-1), { id: "180x180", label: "180 x 180 cm", widthCm: 180, heightCm: 180 })
})

test("swaps two-to-three dimensions for landscape products", () => {
  assert.deepEqual(getCatalogSizes("two-three", "landscape")[0], {
    id: "75x50",
    label: "75 x 50 cm",
    widthCm: 75,
    heightCm: 50,
  })
})

test("keeps only rolled sizes with a longest side at most 210 cm checkout eligible", () => {
  const result = partitionRolledSizesForCheckout(getCatalogSizes("panoramic", "landscape"))
  assert.equal(result.direct.at(-1)?.id, "210x70")
  assert.deepEqual(result.quote.map((size) => size.id), ["240x80"])
})

test("publishes one stretched and five framed quote choices", () => {
  assert.deepEqual(quoteFinishOptions.map((finish) => finish.id), [
    "stretched",
    "black-frame",
    "white-frame",
    "natural-frame",
    "gold-frame",
    "silver-frame",
  ])
})
