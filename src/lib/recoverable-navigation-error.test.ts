import assert from "node:assert/strict"
import test from "node:test"
import { isRecoverableNavigationError } from "./recoverable-navigation-error"

test("treats Next.js stale-chunk failures as recoverable", () => {
  assert.equal(
    isRecoverableNavigationError(new Error("ChunkLoadError: Loading chunk 123 failed")),
    true
  )
  assert.equal(
    isRecoverableNavigationError("Failed to fetch RSC payload for /artworks"),
    true
  )
  assert.equal(
    isRecoverableNavigationError("error loading dynamically imported module"),
    true
  )
})

test("does not reload on ordinary application errors", () => {
  assert.equal(isRecoverableNavigationError(new Error("useWishlist must be used within WishlistProvider")), false)
  assert.equal(isRecoverableNavigationError("Failed to fetch"), false)
})
