import assert from "node:assert/strict"
import test from "node:test"
import { parseArtworkCatalogFields } from "./artwork-input"

test("uses safe legacy defaults when catalog fields are absent", () => {
  const fields = parseArtworkCatalogFields(new FormData())

  assert.equal(fields.collectionType, "artist_collection")
  assert.equal(fields.productionModel, "original")
  assert.equal(fields.rightsStatus, "needs_review")
  assert.equal(fields.migrationStatus, "needs_rights_review")
  assert.deepEqual(fields.standardSizes, [])
})

test("parses approved made-to-order sizes and finishes", () => {
  const form = new FormData()
  form.set("collectionType", "new_collection")
  form.set("productionModel", "hand_painted_to_order")
  form.set("rightsStatus", "approved")
  form.set("migrationStatus", "ready")
  form.set("shortDescription", "A calm blue composition painted to order.")
  form.set("creationWindow", "Painted in 7-12 business days.")
  form.set("standardSizes", JSON.stringify([
    { id: "80x100", label: "80 x 100 cm", widthCm: 80, heightCm: 100, priceCny: 2600 },
  ]))
  form.set("frameOptions", JSON.stringify([
    { id: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
    { id: "black", label: "Black float frame", priceDeltaCny: 600 },
  ]))

  const fields = parseArtworkCatalogFields(form)

  assert.equal(fields.productionModel, "hand_painted_to_order")
  assert.deepEqual(fields.standardSizes, [{
    _key: "80x100",
    label: "80 x 100 cm",
    widthCm: 80,
    heightCm: 100,
    priceCny: 2600,
  }])
  assert.equal(fields.frameOptions[1].priceDeltaCny, 600)
})

test("rejects made-to-order products without a valid standard size", () => {
  const form = new FormData()
  form.set("productionModel", "hand_painted_to_order")
  form.set("standardSizes", JSON.stringify([{ id: "bad", label: "Bad", priceCny: -1 }]))

  assert.throws(
    () => parseArtworkCatalogFields(form),
    /at least one valid standard size/i,
  )
})
