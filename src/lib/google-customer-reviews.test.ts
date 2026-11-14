import { strict as assert } from "node:assert"
import { test } from "node:test"
import { buildGoogleReviewOptIn } from "./google-customer-reviews"

const now = new Date("2026-11-14T08:00:00Z")
const order = {
  orderNumber: "TEST-ONLY", status: "paid", paymentStatus: "paid",
  customerEmail: "buyer@example.com", paidAt: "2026-11-14T08:00:00Z",
  shippingAddress: { country: "US" },
  items: [{ productionModel: "hand_painted_to_order", finishId: "rolled" }],
}

test("uses confirmed calendar-day upper estimates for US and AU", () => {
  assert.deepEqual(buildGoogleReviewOptIn(order, now), {
    merchant_id: 5900598967, order_id: "TEST-ONLY", email: "buyer@example.com",
    delivery_country: "US", estimated_delivery_date: "2026-11-27",
  })
  assert.equal(buildGoogleReviewOptIn({ ...order, shippingAddress: { country: "AU" } }, now)?.estimated_delivery_date, "2026-11-28")
})

test("rejects unpaid, refunded, missing and unsupported order information", () => {
  for (const patch of [
    { status: "pending_payment" }, { paymentStatus: "pending" }, { status: "refunded" },
    { paidAt: null }, { paidAt: "invalid" }, { customerEmail: "" }, { orderNumber: "" },
    { shippingAddress: { country: "GB" } }, { items: [] },
    { items: [{ productionModel: "original", finishId: "rolled" }] },
    { items: [{ productionModel: "hand_painted_to_order", finishId: "stretched" }] },
  ]) assert.equal(buildGoogleReviewOptIn({ ...order, ...patch }, now), null)
})

test("handles month boundaries and excludes stale or future payment dates", () => {
  assert.equal(buildGoogleReviewOptIn({ ...order, paidAt: "2026-11-30T23:00:00Z" }, new Date("2026-12-01T00:00:00Z"))?.estimated_delivery_date, "2026-12-13")
  assert.equal(buildGoogleReviewOptIn({ ...order, paidAt: "2026-10-01T00:00:00Z" }, now), null)
  assert.equal(buildGoogleReviewOptIn({ ...order, paidAt: "2026-11-15T00:00:00Z" }, now), null)
})
