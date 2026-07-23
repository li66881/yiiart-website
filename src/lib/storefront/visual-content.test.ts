import assert from "node:assert/strict"
import test from "node:test"
import { handPaintedDisclosure, resolveVisualImage } from "./visual-content"

test("uses the first approved image as the visual lead", () => {
  assert.equal(resolveVisualImage(["hero.jpg", "detail.jpg"]), "hero.jpg")
  assert.equal(resolveVisualImage([], "fallback.jpg"), "fallback.jpg")
  assert.equal(resolveVisualImage([]), null)
})

test("only made-to-order works receive the variation disclosure", () => {
  assert.match(handPaintedDisclosure("hand_painted_to_order") || "", /hand-painted to order/i)
  assert.equal(handPaintedDisclosure("original"), null)
})
