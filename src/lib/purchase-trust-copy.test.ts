import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import assert from "node:assert/strict"

test("artwork page shows purchase reassurance near buying actions", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "app", "artwork", "[slug]", "page.tsx"), "utf8")

  assert.match(source, /PayPal secure checkout/)
  assert.match(source, /Free worldwide shipping/)
  assert.match(source, /30-day return window/)
  assert.match(source, /Extra photos before purchase/)
})

test("empty cart offers recovery paths for browsing advice and custom work", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "app", "cart", "page.tsx"), "utf8")

  assert.match(source, /Shop curated artworks/)
  assert.match(source, /Request room advice/)
  assert.match(source, /Start a custom painting/)
  assert.match(source, /href="\/artworks"/)
  assert.match(source, /href="\/contact"/)
  assert.match(source, /href="\/custom-painting"/)
})
