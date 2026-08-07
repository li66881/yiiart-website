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

test("returns every approved portrait ladder entry", () => {
  assert.deepEqual(getCatalogSizes("square", "portrait"), [
    { id: "60x60", label: "60 x 60 cm", widthCm: 60, heightCm: 60 },
    { id: "70x70", label: "70 x 70 cm", widthCm: 70, heightCm: 70 },
    { id: "80x80", label: "80 x 80 cm", widthCm: 80, heightCm: 80 },
    { id: "90x90", label: "90 x 90 cm", widthCm: 90, heightCm: 90 },
    { id: "100x100", label: "100 x 100 cm", widthCm: 100, heightCm: 100 },
    { id: "120x120", label: "120 x 120 cm", widthCm: 120, heightCm: 120 },
    { id: "140x140", label: "140 x 140 cm", widthCm: 140, heightCm: 140 },
    { id: "160x160", label: "160 x 160 cm", widthCm: 160, heightCm: 160 },
    { id: "180x180", label: "180 x 180 cm", widthCm: 180, heightCm: 180 },
  ])

  assert.deepEqual(getCatalogSizes("two-three", "portrait"), [
    { id: "50x75", label: "50 x 75 cm", widthCm: 50, heightCm: 75 },
    { id: "60x90", label: "60 x 90 cm", widthCm: 60, heightCm: 90 },
    { id: "70x105", label: "70 x 105 cm", widthCm: 70, heightCm: 105 },
    { id: "80x120", label: "80 x 120 cm", widthCm: 80, heightCm: 120 },
    { id: "90x135", label: "90 x 135 cm", widthCm: 90, heightCm: 135 },
    { id: "100x150", label: "100 x 150 cm", widthCm: 100, heightCm: 150 },
    { id: "120x180", label: "120 x 180 cm", widthCm: 120, heightCm: 180 },
    { id: "140x210", label: "140 x 210 cm", widthCm: 140, heightCm: 210 },
  ])

  assert.deepEqual(getCatalogSizes("three-four", "portrait"), [
    { id: "45x60", label: "45 x 60 cm", widthCm: 45, heightCm: 60 },
    { id: "60x80", label: "60 x 80 cm", widthCm: 60, heightCm: 80 },
    { id: "75x100", label: "75 x 100 cm", widthCm: 75, heightCm: 100 },
    { id: "90x120", label: "90 x 120 cm", widthCm: 90, heightCm: 120 },
    { id: "105x140", label: "105 x 140 cm", widthCm: 105, heightCm: 140 },
    { id: "120x160", label: "120 x 160 cm", widthCm: 120, heightCm: 160 },
    { id: "135x180", label: "135 x 180 cm", widthCm: 135, heightCm: 180 },
    { id: "150x200", label: "150 x 200 cm", widthCm: 150, heightCm: 200 },
  ])

  assert.deepEqual(getCatalogSizes("near-square", "portrait"), [
    { id: "50x60", label: "50 x 60 cm", widthCm: 50, heightCm: 60 },
    { id: "60x70", label: "60 x 70 cm", widthCm: 60, heightCm: 70 },
    { id: "70x80", label: "70 x 80 cm", widthCm: 70, heightCm: 80 },
    { id: "80x90", label: "80 x 90 cm", widthCm: 80, heightCm: 90 },
    { id: "90x100", label: "90 x 100 cm", widthCm: 90, heightCm: 100 },
    { id: "100x120", label: "100 x 120 cm", widthCm: 100, heightCm: 120 },
    { id: "120x140", label: "120 x 140 cm", widthCm: 120, heightCm: 140 },
    { id: "140x160", label: "140 x 160 cm", widthCm: 140, heightCm: 160 },
  ])

  assert.deepEqual(getCatalogSizes("panoramic", "portrait"), [
    { id: "30x90", label: "30 x 90 cm", widthCm: 30, heightCm: 90 },
    { id: "40x120", label: "40 x 120 cm", widthCm: 40, heightCm: 120 },
    { id: "50x150", label: "50 x 150 cm", widthCm: 50, heightCm: 150 },
    { id: "60x180", label: "60 x 180 cm", widthCm: 60, heightCm: 180 },
    { id: "70x210", label: "70 x 210 cm", widthCm: 70, heightCm: 210 },
    { id: "80x240", label: "80 x 240 cm", widthCm: 80, heightCm: 240 },
  ])
})

test("returns the complete customer-facing id ladder for landscape profiles", () => {
  assert.deepEqual(getCatalogSizes("square", "landscape").map((size) => size.id), [
    "60x60", "70x70", "80x80", "90x90", "100x100", "120x120", "140x140", "160x160", "180x180",
  ])
  assert.deepEqual(getCatalogSizes("two-three", "landscape").map((size) => size.id), [
    "75x50", "90x60", "105x70", "120x80", "135x90", "150x100", "180x120", "210x140",
  ])
  assert.deepEqual(getCatalogSizes("three-four", "landscape").map((size) => size.id), [
    "60x45", "80x60", "100x75", "120x90", "140x105", "160x120", "180x135", "200x150",
  ])
  assert.deepEqual(getCatalogSizes("near-square", "landscape").map((size) => size.id), [
    "60x50", "70x60", "80x70", "90x80", "100x90", "120x100", "140x120", "160x140",
  ])
  assert.deepEqual(getCatalogSizes("panoramic", "landscape").map((size) => size.id), [
    "90x30", "120x40", "150x50", "180x60", "210x70", "240x80",
  ])
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
