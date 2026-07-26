import assert from "node:assert/strict"
import test from "node:test"
import { tileCollectionCue, visibleFilterOptions } from "./editorial-presentation"

test("keeps active zero-count filters while hiding inactive empty filters", () => {
  const counts = new Map([
    ["Abstract", 35],
    ["Texture", 0],
  ])

  assert.deepEqual(visibleFilterOptions(["Abstract", "Texture"], counts, []), ["Abstract"])
  assert.deepEqual(visibleFilterOptions(["Abstract", "Texture"], counts, ["Texture"]), ["Abstract", "Texture"])
})

test("uses one collection cue instead of stacking product badges", () => {
  assert.equal(
    tileCollectionCue({ collectionType: "new_collection", productionModel: "hand_painted_to_order" }),
    "Hand-painted to order",
  )
  assert.equal(
    tileCollectionCue({ collectionType: "artist_collection", productionModel: "original" }),
    "Artist collection",
  )
})
