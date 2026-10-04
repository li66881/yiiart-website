import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"

test("does not mark up homepage FAQs that are not visible on the page", async () => {
  const homePage = await readFile("src/app/page.tsx", "utf8")

  assert.doesNotMatch(homePage, /buildFaqJsonLd|FAQPage/)
})
