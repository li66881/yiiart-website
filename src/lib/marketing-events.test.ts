import assert from "node:assert/strict"
import test from "node:test"
import { shouldTrackPageView } from "./marketing-events"

test("tracks a new full URL after client-side query navigation", () => {
  assert.equal(shouldTrackPageView(true, "/artworks?style=abstract", "/artworks?style=abstract"), false)
  assert.equal(shouldTrackPageView(true, "/artworks?style=abstract", "/artworks?style=modern"), true)
})

test("does not track page views without analytics consent", () => {
  assert.equal(shouldTrackPageView(false, null, "/artworks"), false)
})
