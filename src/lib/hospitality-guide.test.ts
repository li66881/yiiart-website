import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("publishes a distinct hotel and restaurant artwork planning guide", async () => {
  const page = await readFile("src/app/guides/hotel-restaurant-wall-art-planning/page.tsx", "utf8")
  const index = await readFile("src/app/guides/page.tsx", "utf8")
  const sitemap = await readFile("src/app/sitemap.ts", "utf8")

  assert.match(page, /How to Plan Wall Art for Hotels and Restaurants/)
  assert.match(page, /Map the guest experience/)
  assert.match(page, /abstract-art-for-living-room/)
  assert.match(page, /custom-painting\?intent=project/)
  assert.match(index, /hotel-restaurant-wall-art-planning/)
  assert.match(sitemap, /hotel-restaurant-wall-art-planning/)
})

test("organizes the guide directory around hospitality, abstract art, and sizing journeys", async () => {
  const index = await readFile("src/app/guides/page.tsx", "utf8")

  assert.match(index, /Wall Art Guides for Homes, Hotels & Restaurants/)
  assert.match(index, /Find the right starting point/)
  assert.match(index, /Planning art for a hotel or restaurant/)
  assert.match(index, /Choosing abstract art for a room/)
  assert.match(index, /Checking scale before you buy/)
  assert.match(index, /\/trade/)
  assert.match(index, /\/custom-painting/)
  assert.match(index, /\/size-guide/)
})

test("qualifies U.S. artwork duty guidance by classification and origin", async () => {
  const policy = await readFile("src/lib/policy-content.ts", "utf8")

  assert.match(policy, /certain original paintings executed entirely by hand may qualify/i)
  assert.match(policy, /country of origin, additional trade measures/i)
  assert.doesNotMatch(policy, /duty is typically not charged on accepted original paintings/i)
})
