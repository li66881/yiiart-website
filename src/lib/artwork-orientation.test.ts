import assert from "node:assert/strict"
import test from "node:test"
import { resolveArtworkOrientation } from "./artwork-orientation"

test("physical centimeters override stale labels and preserve width-by-height order", () => {
  assert.equal(resolveArtworkOrientation({ orientation: "Square", widthCm: 50, heightCm: 60 }), "Portrait")
  assert.equal(resolveArtworkOrientation({ orientation: "Square", dimensions: "75 x 50 cm" }), "Landscape")
})

test("square classification allows at most two percent relative difference", () => {
  assert.equal(resolveArtworkOrientation({ widthCm: 100, heightCm: 98 }), "Square")
  assert.equal(resolveArtworkOrientation({ widthCm: 100, heightCm: 97.9 }), "Landscape")
})

test("uses the saved orientation only when physical dimensions are unavailable", () => {
  assert.equal(resolveArtworkOrientation({ orientation: "Portrait", dimensions: "unknown" }), "Portrait")
  assert.equal(resolveArtworkOrientation({ dimensions: "unknown" }), null)
})
