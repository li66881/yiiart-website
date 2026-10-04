import assert from "node:assert/strict"
import test from "node:test"
import { formatStoreAmount, formatStorePrice } from "./pricing"

test("formats structured prices to the visible currency precision without grouping", () => {
  assert.equal(formatStoreAmount(264.716, "USD"), "264.72")
  assert.equal(formatStoreAmount(3333.7, "JPY"), "3334")
  assert.equal(formatStoreAmount(2500.75, "KRW"), "2501")
})

test("formats checkout-currency prices to minor-unit precision", () => {
  const previousRate = process.env.NEXT_PUBLIC_CNY_PER_USD
  process.env.NEXT_PUBLIC_CNY_PER_USD = "7.2"

  try {
    assert.equal(formatStorePrice(1906, "USD"), "$264.72 USD")
  } finally {
    if (previousRate === undefined) delete process.env.NEXT_PUBLIC_CNY_PER_USD
    else process.env.NEXT_PUBLIC_CNY_PER_USD = previousRate
  }
})

test("keeps whole-unit CNY prices concise and zero-decimal currencies rounded", () => {
  assert.equal(formatStorePrice(1900, "CNY"), "¥1,900 CNY")
  assert.equal(formatStorePrice(1000, "JPY"), "¥20,000 JPY")
  assert.equal(formatStorePrice(1000, "KRW"), "₩192,308 KRW")
})

test("does not format missing or invalid prices as a numeric amount", () => {
  assert.equal(formatStorePrice(0, "USD"), "Price on request")
  assert.equal(formatStorePrice(Number.NaN, "USD"), "Price on request")
})
