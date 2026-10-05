import assert from "node:assert/strict"
import test from "node:test"
import { isEnquiryIntent, parseEnquiryIntent } from "./enquiry-intent"

test("accepts only supported enquiry intents", () => {
  assert.equal(isEnquiryIntent("size-advice"), true)
  assert.equal(isEnquiryIntent("project"), true)
  assert.equal(isEnquiryIntent("custom"), true)
  assert.equal(isEnquiryIntent("gift"), false)
  assert.equal(isEnquiryIntent(undefined), false)
})

test("unknown enquiry intents fall back to the standard custom flow", () => {
  assert.equal(parseEnquiryIntent("gift"), "custom")
  assert.equal(parseEnquiryIntent(undefined), "custom")
})
