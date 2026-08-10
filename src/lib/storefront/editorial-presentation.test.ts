import assert from "node:assert/strict"
import test from "node:test"
import { headerNavigationGroups, productDetailGroups, tileCollectionCue, visibleFilterOptions } from "./editorial-presentation"

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

test("keeps browse links ahead of collector information in the gallery header", () => {
  const groups = headerNavigationGroups([
    "Shop Art",
    "Large Wall Art",
    "Custom Painting",
    "Size Guide",
    "Reviews",
    "Artists",
  ])

  assert.deepEqual(groups.primary, ["Shop Art", "Large Wall Art", "Custom Painting", "Size Guide"])
  assert.deepEqual(groups.secondary, ["Reviews", "Artists"])
})

test("keeps the first four remaining links primary after empty collections are removed", () => {
  const groups = headerNavigationGroups([
    "Shop Art",
    "Custom Painting",
    "Size Guide",
    "Reviews",
    "Artists",
  ])

  assert.deepEqual(groups.primary, ["Shop Art", "Custom Painting", "Size Guide", "Reviews"])
  assert.deepEqual(groups.secondary, ["Artists"])
})

test("keeps handmade support in a single product confidence group", () => {
  assert.deepEqual(productDetailGroups().map((group) => group.id), ["artwork", "room", "care"])
})
