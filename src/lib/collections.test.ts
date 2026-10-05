import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { marketingCollections } from "./collections"
import { buildCollectionHeroCopy } from "./collection-hero-copy"

test("marketing collections have concise, unique, page-specific search descriptions", () => {
  const descriptions = marketingCollections.map((collection) => collection.metaDescription)

  assert.deepEqual(marketingCollections.map(({ slug }) => slug).sort(), [
    "abstract-art-for-living-room",
    "bedroom-wall-art",
    "dining-room-wall-art",
    "large-canvas-art",
    "neutral-canvas-art",
    "office-wall-art",
    "textured-wall-art",
    "wabi-sabi-wall-art",
  ])
  assert.ok(descriptions.every((description) => typeof description === "string" && description.length >= 100 && description.length <= 160))
  assert.equal(new Set(descriptions).size, descriptions.length)
  assert.ok(descriptions.every((description) => !/ for .+ for /i.test(description)))

  for (const collection of marketingCollections) {
    assert.ok(collection.metaDescription.toLowerCase().includes(collection.shortTitle.split(" ")[0].toLowerCase()))
  }
})

test("collection page metadata uses each collection's authored search description", async () => {
  const page = await readFile("src/app/collections/[slug]/page.tsx", "utf8")

  assert.match(page, /description:\s*collection\.metaDescription/)
  assert.match(page, /title:\s*collection\.title/)
  assert.doesNotMatch(page, /collection\.title\}\s*for Modern Interiors/)
})

test("room collections have authored buying guidance and explicit room tags", () => {
  const roomCollections = marketingCollections.filter((collection) => collection.group === "room")
  assert.deepEqual(roomCollections.map(({ slug }) => slug).sort(), [
    "abstract-art-for-living-room",
    "bedroom-wall-art",
    "dining-room-wall-art",
    "office-wall-art",
  ])
  for (const collection of roomCollections) {
    assert.ok(collection.roomTypes?.length, `${collection.slug} needs explicit room tags`)
    assert.ok(collection.intro.trim())
    assert.ok(collection.buyerGuide.length >= 3)
    assert.ok(collection.sizeAdvice.trim())
    assert.ok(collection.faqs.length >= 3)
  }
})

test("public collection inventory query projects explicit room tags", async () => {
  const source = await readFile("src/lib/storefront/collection-catalog.ts", "utf8")
  assert.match(source, /const publicCollectionInventoryQuery[\s\S]*?roomTypes/)
})

test("room guides link dining and office intent to their curated collections", async () => {
  const pairingGuide = await readFile("src/app/guides/home-wall-art-pairing-guide/page.tsx", "utf8")
  const sizeGuide = await readFile("src/app/size-guide/page.tsx", "utf8")
  assert.match(pairingGuide, /title: "Dining Room Art"[\s\S]*?link: "\/collections\/dining-room-wall-art"/)
  assert.match(pairingGuide, /title: "Office Wall Art"[\s\S]*?link: "\/collections\/office-wall-art"/)
  assert.match(sizeGuide, /title: "Dining Room Art", href: "\/collections\/dining-room-wall-art"/)
  assert.match(sizeGuide, /title: "Office Wall Art", href: "\/collections\/office-wall-art"/)
})

test("collection hero summaries do not repeat the separate buying-guide or custom sections", async () => {
  const page = await readFile("src/app/collections/[slug]/page.tsx", "utf8")
  const summaries = marketingCollections.map((collection) => buildCollectionHeroCopy(collection))

  assert.equal(new Set(summaries).size, marketingCollections.length)
  for (const [index, collection] of marketingCollections.entries()) {
    assert.equal(summaries[index], collection.intro)
    assert.doesNotMatch(summaries[index], new RegExp(collection.sizeAdvice.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    assert.doesNotMatch(summaries[index], new RegExp(collection.customPrompt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }

  assert.match(page, /buildCollectionHeroCopy\(collection\)/)
  assert.doesNotMatch(page, /function buildCollectionHeroCopy\(/)
})
