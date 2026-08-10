import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("optimized storefront keeps current catalog and checkout boundaries", async () => {
  const home = await readFile("src/app/page.tsx", "utf8")
  const product = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")
  const checkout = await readFile("src/lib/checkout.ts", "utf8")
  assert.match(home, /PUBLIC_ARTWORK_GROQ_FILTER/)
  assert.match(product, /isArtworkCheckoutAvailable/)
  assert.match(checkout, /resolveCheckoutSelection/)
  assert.match(checkout, /shippingProfile/)
})

test("optimized storefront contains no stale hard-coded promotion", async () => {
  const sources = await Promise.all([
    "src/components/HeroSection.tsx",
    "src/components/home/EditorialHome.tsx",
    "src/components/storefront/ProductPurchasePanel.tsx",
  ].map((file) => readFile(file, "utf8")))
  assert.doesNotMatch(sources.join("\n"), /40% off|sale ends in|only \d+ left/i)
})

test("public copy validation rejects stale optimized-branch claims", async () => {
  const copyCheck = await readFile("scripts/check-public-copy.mjs", "utf8")
  assert.match(copyCheck, /40% off/)
  assert.match(copyCheck, /free replacement or a full refund/)
  assert.match(copyCheck, /arrive 5-10 business days later/)
})
