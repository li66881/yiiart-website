import assert from "node:assert/strict"
import test from "node:test"
import artworkSchema from "./artwork"

function field(name: string) {
  return artworkSchema.fields.find((item: any) => item.name === name) as any
}

test("new artwork records default to the made-to-order catalog", () => {
  assert.equal(field("collectionType").initialValue, "new_collection")
  assert.equal(field("productionModel").initialValue, "hand_painted_to_order")
})

test("supports series merchandising and explicit size profiles", () => {
  assert.equal(field("seriesSlug").type, "string")
  assert.equal(field("seriesRank").type, "number")
  assert.deepEqual(field("sizeProfile").options.list.map((item: any) => item.value), [
    "square",
    "two-three",
    "three-four",
    "near-square",
    "panoramic",
  ])
})

test("keeps figurative artwork as a real category", () => {
  assert.ok(field("category").options.list.includes("Figurative"))
})
