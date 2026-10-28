import assert from "node:assert/strict"
import test from "node:test"
import { customsMarketGuidance, faqItems, productionTime, shippingHighlights } from "./policy-content"

test("uses confirmed estimates while keeping production and carrier transit separate", () => {
  assert.match(productionTime.madeToOrder, /typically.*6–8 calendar days.*carrier handoff/i)
  assert.match(productionTime.shippingTransit, /3–5 calendar days to the United States/i)
  assert.match(productionTime.shippingTransit, /4–6 calendar days to Australia/i)
  assert.match(productionTime.shippingTransit, /may vary.*customs/i)
  assert.equal(productionTime.combined, `${productionTime.madeToOrder} ${productionTime.shippingTransit}`)
  assert.ok(shippingHighlights.some((item) => item.text.includes(productionTime.combined)))
  assert.ok(faqItems.find((item) => item.question === "How does shipping work?")?.answer.includes(productionTime.combined))
})

test("states that import tax is not collected at checkout", () => {
  const duties = faqItems.find((item) => item.question.includes("customs duties"))
  assert.ok(duties)
  assert.match(duties.answer, /Duties and local taxes may be charged by the destination country/)
  assert.match(duties.answer, /does not currently collect import VAT/i)
  assert.match(duties.answer, /United Kingdom/)
  assert.match(duties.answer, /Australia/)
})

test("separates US federal VAT from UK and Australian import tax", () => {
  const byRegion = Object.fromEntries(customsMarketGuidance.map((item) => [item.region, item.text]))
  assert.match(byRegion["United States"], /no federal import VAT/i)
  assert.match(byRegion["United States"], /classification, country of origin, additional trade measures/i)
  assert.match(byRegion["United Kingdom"], /5%/)
  assert.match(byRegion["Australia"], /10%/)
  assert.match(byRegion["Hong Kong"], /no GST\/VAT/i)
})
