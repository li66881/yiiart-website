import assert from "node:assert/strict"
import test from "node:test"
import { getMatchingPayPalCaptureId, isPayPalCaptureCompleted, isStripeCheckoutPaymentPaid } from "./payment-confirmation"

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

test("PayPal capture must match the stored checkout, amount and currency", () => {
  const response = {
    id: "sandbox-order",
    status: "COMPLETED",
    purchase_units: [{ payments: { captures: [{
      id: "sandbox-capture", status: "COMPLETED", amount: { value: "120.50", currency_code: "USD" },
    }] } }],
  }
  const order = { checkoutId: "sandbox-order", totalAmount: 120.5, currency: "USD" }
  assert.equal(getMatchingPayPalCaptureId(response, order), "sandbox-capture")
  assert.equal(getMatchingPayPalCaptureId(response, { ...order, checkoutId: "other" }), null)
  assert.equal(getMatchingPayPalCaptureId(response, { ...order, totalAmount: 125 }), null)
  assert.equal(getMatchingPayPalCaptureId(response, { ...order, currency: "AUD" }), null)
  response.purchase_units[0].payments.captures[0].status = "PENDING"
  assert.equal(getMatchingPayPalCaptureId(response, order), null)
})
