import assert from "node:assert/strict"
import test from "node:test"
import { resolveCompareAtCny, saleOffPercent } from "./sale"

test("prefers CMS compare-at when higher than selling price", () => {
  assert.equal(resolveCompareAtCny(600, 1000, false), 1000)
  assert.equal(resolveCompareAtCny(600, 600, true), Math.round(600 / 0.6))
})

test("synthesizes compare-at during studio sale without CMS value", () => {
  assert.equal(resolveCompareAtCny(600, null, true), 1000)
  assert.equal(resolveCompareAtCny(600, null, false), null)
})

test("computes sale off percent", () => {
  assert.equal(saleOffPercent(600, 1000), 40)
  assert.equal(saleOffPercent(1000, 1000), null)
})
