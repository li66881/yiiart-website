import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

async function extractDescription(path: string, pattern: RegExp) {
  const source = await readFile(path, "utf8")
  const match = source.match(pattern)
  assert.ok(match, `Expected a static meta description in ${path}`)
  return match[1]
}

test("keeps priority English meta descriptions concise", async () => {
  const descriptions = await Promise.all([
    extractDescription("src/app/page.tsx", /const homepageSeoDescription\s*=\s*"([^"]+)"/),
    extractDescription("src/app/trade/page.tsx", /description:\s*"([^"]+)"/),
    extractDescription("src/app/guides/hotel-restaurant-wall-art-planning/page.tsx", /const description\s*=\s*\n?\s*"([^"]+)"/),
  ])

  for (const description of descriptions) {
    assert.ok(description.length <= 160, `Description has ${description.length} characters`)
  }
})
