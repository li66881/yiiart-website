import assert from "node:assert/strict"
import test from "node:test"
import { isPayPalCaptureCompleted, isStripeCheckoutPaymentPaid } from "./payment-confirmation"

test("PayPal capture is successful only after the provider reports COMPLETED", () => {
  assert.equal(isPayPalCaptureCompleted({ status: "COMPLETED" }), true)
  assert.equal(isPayPalCaptureCompleted({ status: "PENDING" }), false)
  assert.equal(isPayPalCaptureCompleted({ status: "DECLINED" }), false)
})

test("Stripe checkout is marked paid only when payment_status is paid", () => {
  assert.equal(isStripeCheckoutPaymentPaid({ payment_status: "paid" }), true)
  assert.equal(isStripeCheckoutPaymentPaid({ payment_status: "unpaid" }), false)
  assert.equal(isStripeCheckoutPaymentPaid({ payment_status: "no_payment_required" }), false)
})
