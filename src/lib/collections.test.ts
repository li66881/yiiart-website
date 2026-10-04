import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { marketingCollections } from "./collections"
import { buildCollectionHeroCopy } from "./collection-hero-copy"

test("marketing collections have concise, unique, page-specific search descriptions", () => {
  const descriptions = marketingCollections.map((collection) => collection.metaDescription)

  assert.equal(descriptions.length, 6)
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
