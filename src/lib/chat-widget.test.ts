import assert from "node:assert/strict"
import test from "node:test"
import { shouldShowFloatingChatOnMobile } from "./chat-widget"

test("hides floating chat on artwork detail pages with in-page advisor actions", () => {
  assert.equal(shouldShowFloatingChatOnMobile("/artwork/garden-keeper"), false)
})

test("preserves floating chat on non-product mobile routes", () => {
  assert.equal(shouldShowFloatingChatOnMobile("/artworks"), true)
  assert.equal(shouldShowFloatingChatOnMobile("/cart"), true)
})
