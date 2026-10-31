import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("footer avoids the known low-contrast shade and skipped heading level", async () => {
  const footer = await readFile("src/components/FooterClient.tsx", "utf8")
  assert.doesNotMatch(footer, /\btext-stone-500\b/)
  assert.doesNotMatch(footer, /<\/?h4\b/)
  assert.match(footer, /<h2\b/)
  assert.match(footer, /\btext-stone-600\b/)
})

test("light payment badges avoid the low-contrast footer shade", async () => {
  const badges = await readFile("src/components/PaymentBadges.tsx", "utf8")
  assert.doesNotMatch(badges, /\btext-stone-500\b/)
  assert.match(badges, /\btext-stone-600\b/)
})
