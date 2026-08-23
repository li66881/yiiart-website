import assert from "node:assert/strict"
import test from "node:test"
import { customsMarketGuidance, faqItems } from "./policy-content"

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
  assert.match(byRegion["United Kingdom"], /5%/)
  assert.match(byRegion["Australia"], /10%/)
  assert.match(byRegion["Hong Kong"], /no GST\/VAT/i)
})
