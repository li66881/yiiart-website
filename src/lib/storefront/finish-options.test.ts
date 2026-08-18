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
    "gold-frame",
    "silver-frame",
    "black-frame",
    "white-frame",
    "natural-frame",
  ])
  assert.deepEqual(finishes.map((finish) => finish.assetSrc), [
    "/images/product-finishes/rolled-canvas.webp",
    "/images/product-finishes/stretched-canvas.webp",
    "/images/product-finishes/gold-float-frame.webp",
    "/images/product-finishes/silver-float-frame.webp",
    "/images/product-finishes/black-float-frame.webp",
    "/images/product-finishes/white-float-frame.webp",
    "/images/product-finishes/natural-wood-float-frame.webp",
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

const invalidConfiguredPriceDeltas: Array<{
  name: string
  value?: unknown
  omit?: boolean
}> = [
  { name: "an absent value", omit: true },
  { name: "null", value: null },
  { name: "a blank string", value: "" },
  { name: "whitespace", value: "   " },
  { name: "NaN", value: Number.NaN },
  { name: "positive infinity", value: Number.POSITIVE_INFINITY },
  { name: "negative infinity", value: Number.NEGATIVE_INFINITY },
  { name: "a numeric string", value: "0" },
  { name: "a non-number string", value: "free" },
  { name: "a boolean", value: false },
]

test("rejects malformed configured price deltas without activating catalog fallback", async (t) => {
  for (const invalid of invalidConfiguredPriceDeltas) {
    await t.test(invalid.name, () => {
      const configured = {
        _key: "rolled",
        label: "Rolled canvas",
        ...(!invalid.omit ? { priceDeltaCny: invalid.value } : {}),
      }

      assert.deepEqual(
        buildNormalizedFinishOptions([configured], "hand_painted_to_order"),
        [],
      )
    })
  }
})

test("preserves a numeric zero configured price delta", () => {
  const finishes = buildNormalizedFinishOptions([
    { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
  ], "hand_painted_to_order")

  assert.deepEqual(finishes.map((finish) => finish.id), ["rolled"])
  assert.equal(resolveFinishDeltaCny(finishes[0], 1730), 0)
})

test("rejects every configured finish whose normalized id is duplicated", () => {
  const finishes = buildNormalizedFinishOptions([
    { _key: " rolled ", label: "Rolled canvas", priceDeltaCny: 0 },
    { _key: "rolled", label: "Rolled duplicate", priceDeltaCny: 200 },
    { _key: "black", label: "Black float frame", priceDeltaCny: 600 },
  ], "hand_painted_to_order")

  assert.deepEqual(finishes.map((finish) => finish.id), ["black"])
})
