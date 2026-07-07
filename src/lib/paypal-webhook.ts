export type PayPalWebhookEvent = {
  id?: string
  event_type: string
  resource?: {
    id?: string
    custom_id?: string
    invoice_id?: string
    supplementary_data?: {
      related_ids?: {
        order_id?: string
      }
    }
  }
}

export function getPayPalWebhookOrderIdentifiers(event: PayPalWebhookEvent) {
  return {
    providerCheckoutId: cleanIdentifier(event.resource?.supplementary_data?.related_ids?.order_id),
    orderNumber: cleanIdentifier(event.resource?.invoice_id),
    internalOrderId: cleanIdentifier(event.resource?.custom_id),
  }
}

function cleanIdentifier(value?: string | null) {
  const clean = String(value || "").trim()
  return clean || null
}

