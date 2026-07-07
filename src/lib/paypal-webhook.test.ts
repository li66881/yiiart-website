import assert from "node:assert/strict"
import test from "node:test"
import { getPayPalWebhookOrderIdentifiers } from "@/lib/paypal-webhook"

test("keeps PayPal order ID separate from YiiArt invoice order number", () => {
  const identifiers = getPayPalWebhookOrderIdentifiers({
    id: "WH-123",
    event_type: "PAYMENT.CAPTURE.COMPLETED",
    resource: {
      id: "CAPTURE-123",
      custom_id: "internal-order-uuid",
      invoice_id: "YA-20260707-ABC123",
      supplementary_data: {
        related_ids: {
          order_id: "PAYPAL-ORDER-123",
        },
      },
    },
  })

  assert.deepEqual(identifiers, {
    providerCheckoutId: "PAYPAL-ORDER-123",
    orderNumber: "YA-20260707-ABC123",
    internalOrderId: "internal-order-uuid",
  })
})

test("uses invoice_id as the YiiArt order number when PayPal omits related order ID", () => {
  const identifiers = getPayPalWebhookOrderIdentifiers({
    event_type: "PAYMENT.CAPTURE.REFUNDED",
    resource: {
      id: "REFUND-123",
      invoice_id: "YA-20260707-ABC123",
    },
  })

  assert.equal(identifiers.providerCheckoutId, null)
  assert.equal(identifiers.orderNumber, "YA-20260707-ABC123")
  assert.equal(identifiers.internalOrderId, null)
})
