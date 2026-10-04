import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { marketingCollections } from "./collections"

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
