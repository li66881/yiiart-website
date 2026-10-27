import assert from "node:assert/strict"
import test from "node:test"
import { getPayPalCurrency, getStripeCurrency } from "./payment-config"

test("payment currencies use the configured provider currency and fall back only to supported codes", () => {
  const original = {
    paypal: process.env.PAYPAL_CURRENCY,
    stripe: process.env.STRIPE_CURRENCY,
    store: process.env.NEXT_PUBLIC_STORE_CURRENCY,
  }

  try {
    process.env.PAYPAL_CURRENCY = "EUR"
    process.env.STRIPE_CURRENCY = "GBP"
    process.env.NEXT_PUBLIC_STORE_CURRENCY = "CAD"
    assert.equal(getPayPalCurrency(), "EUR")
    assert.equal(getStripeCurrency(), "GBP")

    process.env.STRIPE_CURRENCY = "NOT_A_CURRENCY"
    assert.equal(getStripeCurrency(), "USD")
  } finally {
    restoreEnv("PAYPAL_CURRENCY", original.paypal)
    restoreEnv("STRIPE_CURRENCY", original.stripe)
    restoreEnv("NEXT_PUBLIC_STORE_CURRENCY", original.store)
  }
})

function restoreEnv(name: string, value?: string) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}
