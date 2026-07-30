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
  assert.ok(product.sizes.length >= 4)
  assert.equal(product.sizes[0].priceCny, 7200)
  assert.equal(product.sizes[0].id, "original")
  assert.ok(product.finishes.length >= 3)
  assert.equal(product.sku, "QUIET-FIELD")
  assert.equal(product.images[0].src, "https://cdn.example/quiet-field.jpg")
})

test("prefers white-bg artwork images over room scenes when both exist", () => {
  const product = buildStorefrontProduct({
    _id: "img-1",
    title: { en: "Field" },
    slug: { current: "field" },
    price: 2000,
  }, [
    { src: "https://cdn.example/room.jpg", kind: "room", width: 1400, height: 1000 },
    { src: "https://cdn.example/white.jpg", kind: "artwork", width: 1400, height: 1750 },
  ])

  assert.equal(product.images[0].src, "https://cdn.example/white.jpg")
  assert.equal(product.images[1].src, "https://cdn.example/room.jpg")
})

test("falls back to room scene when no white-bg artwork image exists", () => {
  const product = buildStorefrontProduct({
    _id: "img-2",
    title: { en: "Field Room" },
    slug: { current: "field-room" },
    price: 2000,
  }, [
    { src: "https://cdn.example/detail.jpg", kind: "detail", width: 1400, height: 1000 },
    { src: "https://cdn.example/room.jpg", kind: "room", width: 1400, height: 1000 },
  ])

  assert.equal(product.images[0].src, "https://cdn.example/room.jpg")
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
  assert.ok(product.sizes.length >= 4)
  assert.equal(product.sizes[0].id, "80x100")
  assert.ok(product.finishes.length >= 3)
  assert.equal(product.finishes[0].id, "rolled")
})

test("uses safe made-to-order copy and normalized discovery facets", () => {
  const product = buildStorefrontProduct({
    _id: "catalog-2",
    title: { zh: "静水" },
    slug: { current: "still-water" },
    sku: "YA-210",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "60x80", label: "60 x 80 cm", widthCm: 60, heightCm: 80, priceCny: 1800 }],
    category: "Abstract",
    roomTypes: ["Living room", "Office"],
    colorFamilies: ["Blue", "Neutral"],
    orientation: "Portrait",
  }, [])

  assert.equal(product.title, "静水")
  assert.equal(product.sku, "YA-210")
  assert.deepEqual(product.styleTags, ["Abstract"])
  assert.deepEqual(product.roomTags, ["Living room", "Office"])
  assert.deepEqual(product.colorTags, ["Blue", "Neutral"])
  assert.match(product.creationWindow, /confirmed/i)
})
