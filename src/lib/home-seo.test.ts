import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"

test("does not mark up homepage FAQs that are not visible on the page", async () => {
  const homePage = await readFile("src/app/page.tsx", "utf8")

  assert.doesNotMatch(homePage, /buildFaqJsonLd|FAQPage/)
})

test("homepage metadata leads with the core product and retains home and trade intent", async () => {
  const homePage = await readFile("src/app/page.tsx", "utf8")

  assert.match(homePage, /Hand-Painted Wall Art & Original Canvas Art \| YiiArt/)
  assert.match(homePage, /living rooms, bedrooms, and design projects/)
  assert.match(homePage, /abstract, textured, and large canvas paintings/)
})
