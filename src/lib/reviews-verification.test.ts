import assert from "node:assert/strict"
import test from "node:test"
import { isVerifiedCollector } from "./reviews"

test("review cards only mark verified purchases when the public query confirms order evidence", () => {
  assert.equal(isVerifiedCollector({ _id: "unverified", reviewSource: "manual_verified" }), false)
  assert.equal(isVerifiedCollector({ _id: "verified", verifiedBuyer: true }), true)
})
