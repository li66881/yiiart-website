import assert from "node:assert/strict"
import test from "node:test"
import { getCatalogNavigationStateFromLoader } from "./catalog-navigation-loader"

test("fails closed when the inventory loader throws", async () => {
  const state = await getCatalogNavigationStateFromLoader(async () => {
    throw new Error("inventory unavailable")
  })

  assert.deepEqual(state, {
    visibleCollectionSlugs: [],
    visibleCategories: [],
  })
})

test("fails closed when the inventory loader returns a non-array", async () => {
  const state = await getCatalogNavigationStateFromLoader(async () => ({ invalid: true }))

  assert.deepEqual(state, {
    visibleCollectionSlugs: [],
    visibleCategories: [],
  })
})
