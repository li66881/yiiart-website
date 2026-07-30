import assert from "node:assert/strict"
import test from "node:test"
import { shouldShowFloatingChatOnMobile } from "./chat-widget"

test("shows floating chat on artwork detail pages for mobile buying support", () => {
  assert.equal(shouldShowFloatingChatOnMobile("/artwork/garden-keeper"), true)
})

test("keeps mobile catalogue controls free from the floating chat button", () => {
  assert.equal(shouldShowFloatingChatOnMobile("/artworks"), false)
  assert.equal(shouldShowFloatingChatOnMobile("/cart"), false)
})
