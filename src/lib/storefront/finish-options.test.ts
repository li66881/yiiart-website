import assert from "node:assert/strict"
import test from "node:test"
import {
  buildNormalizedFinishOptions,
  resolveFinishDeltaCny,
  resolveFinishTotalCny,
} from "./finish-options"

test("builds seven ordered fallback presentation choices", () => {
  const finishes = buildNormalizedFinishOptions([], "hand_painted_to_order")

  assert.deepEqual(finishes.map((finish) => finish.id), [
    "rolled",
    "stretched",
    "black-frame",
    "white-frame",
    "natural-frame",
    "gold-frame",
    "silver-frame",
  ])
  assert.deepEqual(finishes.map((finish) => finish.assetSrc), [
    "/images/product-finishes/rolled-canvas.webp",
    "/images/product-finishes/stretched-canvas.webp",
    "/images/product-finishes/black-float-frame.webp",
    "/images/product-finishes/white-float-frame.webp",
    "/images/product-finishes/natural-wood-float-frame.webp",
    "/images/product-finishes/gold-float-frame.webp",
    "/images/product-finishes/silver-float-frame.webp",
  ])
})

test("resolves rolled, stretched, and framed totals from one base price", () => {
  const byId = new Map(
    buildNormalizedFinishOptions([], "hand_painted_to_order").map((finish) => [finish.id, finish]),
  )

  assert.equal(resolveFinishTotalCny(byId.get("rolled")!, 1730), 1730)
  assert.equal(resolveFinishTotalCny(byId.get("stretched")!, 1730), 2940)
  assert.equal(resolveFinishTotalCny(byId.get("black-frame")!, 1730), 3090)
  assert.equal(resolveFinishDeltaCny(byId.get("black-frame")!, 1730), 1360)
})

test("keeps originals as listed", () => {
  assert.deepEqual(
    buildNormalizedFinishOptions([], "original").map((finish) => finish.id),
    ["as-listed"],
  )
})

test("uses validated configured finishes instead of catalog fallback choices", () => {
  const finishes = buildNormalizedFinishOptions([
    { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
    { _key: "bad", label: "Invalid", priceDeltaCny: -1 },
  ], "hand_painted_to_order")

  assert.deepEqual(finishes.map((finish) => finish.id), ["rolled"])
  assert.equal(finishes[0].pricing.kind, "fixed_delta")
  assert.equal(resolveFinishTotalCny(finishes[0], 1730), 1730)
})
