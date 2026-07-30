import assert from "node:assert/strict"
import test from "node:test"
import { buildStorefrontProduct } from "./product"

test("defaults legacy artwork to the artist collection and original model", () => {
  const product = buildStorefrontProduct({
    _id: "legacy-1",
    title: { en: "Quiet Field" },
    slug: { current: "quiet-field" },
    price: 7200,
    dimensions: "80 x 100 cm",
    artist: { name: { en: "Studio Artist" } },
  }, [{
    src: "https://cdn.example/quiet-field.jpg",
    alt: "Quiet Field",
    width: 1400,
    height: 1750,
  }])

  assert.equal(product.collectionType, "artist_collection")
  assert.equal(product.productionModel, "original")
  assert.equal(product.rightsStatus, "needs_review")
  assert.equal(product.sizes.length, 1)
  assert.equal(product.sizes[0].priceCny, 7200)
  assert.equal(product.sizes[0].label, "80 x 100 cm")
  assert.equal(product.images[0].src, "https://cdn.example/quiet-field.jpg")
})

test("maps made-to-order sizes and finishes without accepting invalid prices", () => {
  const product = buildStorefrontProduct({
    _id: "catalog-1",
    title: { en: "Soft Horizon" },
    slug: { current: "soft-horizon" },
    productionModel: "hand_painted_to_order",
    collectionType: "new_collection",
    rightsStatus: "approved",
    migrationStatus: "ready",
    standardSizes: [
      { _key: "80x100", label: "80 x 100 cm", widthCm: 80, heightCm: 100, priceCny: 2600 },
      { _key: "bad", label: "Bad", priceCny: -1 },
    ],
    frameOptions: [
      { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
      { _key: "bad", label: "Invalid finish", priceDeltaCny: -100 },
    ],
  }, [])

  assert.equal(product.collectionType, "new_collection")
  assert.equal(product.productionModel, "hand_painted_to_order")
  assert.deepEqual(product.sizes.map((size) => size.id), ["80x100"])
  assert.deepEqual(product.finishes.map((finish) => finish.id), ["rolled"])
})

test("uses safe made-to-order copy and normalized discovery facets", () => {
  const product = buildStorefrontProduct({
    _id: "catalog-2",
    title: { zh: "静水" },
    slug: { current: "still-water" },
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "60x80", label: "60 x 80 cm", widthCm: 60, heightCm: 80, priceCny: 1800 }],
    category: "Abstract",
    roomTypes: ["Living room", "Office"],
    colorFamilies: ["Blue", "Neutral"],
    orientation: "Portrait",
  }, [])

  assert.equal(product.title, "静水")
  assert.deepEqual(product.styleTags, ["Abstract"])
  assert.deepEqual(product.roomTags, ["Living room", "Office"])
  assert.deepEqual(product.colorTags, ["Blue", "Neutral"])
  assert.match(product.creationWindow, /confirmed/i)
})
