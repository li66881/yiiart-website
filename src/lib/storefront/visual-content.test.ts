import assert from "node:assert/strict"
import test from "node:test"
import { buildEditorialHomeEdit, handPaintedDisclosure, resolveVisualImage } from "./visual-content"

test("uses the first approved image as the visual lead", () => {
  assert.equal(resolveVisualImage(["hero.jpg", "detail.jpg"]), "hero.jpg")
  assert.equal(resolveVisualImage([], "fallback.jpg"), "fallback.jpg")
  assert.equal(resolveVisualImage([]), null)
})

test("only made-to-order works receive the variation disclosure", () => {
  assert.match(handPaintedDisclosure("hand_painted_to_order") || "", /hand-painted to order/i)
  assert.equal(handPaintedDisclosure("original"), null)
})

test("keeps artist collection works separate in the editorial home edit", () => {
  const edit = buildEditorialHomeEdit([
    { id: "new-1", collectionType: "new_collection" },
    { id: "artist-1", collectionType: "artist_collection" },
    { id: "new-2", collectionType: "new_collection" },
  ])

  assert.deepEqual(edit.featured.map((item) => item.id), ["new-1", "new-2"])
  assert.deepEqual(edit.artistCollection.map((item) => item.id), ["artist-1"])
})
