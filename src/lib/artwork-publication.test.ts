import assert from "node:assert/strict"
import test from "node:test"
import { isArtworkPubliclyVisible } from "./artwork-publication"

test("keeps legacy and Artist Collection records public", () => {
  assert.equal(isArtworkPubliclyVisible({}), true)
  assert.equal(isArtworkPubliclyVisible({ collectionType: "artist_collection" }), true)
})

test("publishes New Collection records only after rights and migration approval", () => {
  assert.equal(isArtworkPubliclyVisible({ collectionType: "new_collection" }), false)
  assert.equal(
    isArtworkPubliclyVisible({
      collectionType: "new_collection",
      rightsStatus: "approved",
      migrationStatus: "ready",
    }),
    true,
  )
  assert.equal(
    isArtworkPubliclyVisible({
      collectionType: "new_collection",
      rightsStatus: "needs_review",
      migrationStatus: "ready",
    }),
    false,
  )
})
