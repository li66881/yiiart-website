import { NextResponse } from "next/server"
import {
  getOrderStorageProvider,
  isOrderStorageConfigured,
} from "@/lib/order-storage"
import {
  findOrderByProviderCheckout,
  markOrderPaid,
  markOrderPaymentFailed,
  markOrderRefunded,
  recordPaymentEvent,
} from "@/lib/orders"
import { verifyPayPalWebhookSignature } from "@/lib/paypal"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "paypal",
    endpoint: "/api/webhooks/paypal",
    accepts: "POST",
    configured: {
      clientId: Boolean(process.env.PAYPAL_CLIENT_ID),
      clientSecret: Boolean(process.env.PAYPAL_CLIENT_SECRET),
      webhookId: Boolean(process.env.PAYPAL_WEBHOOK_ID),
      orderStorage: isOrderStorageConfigured(),
      orderStorageProvider: getOrderStorageProvider(),
    },
  })
}

export async function POST(request: Request) {
  let event: PayPalWebhookEvent

  try {
    event = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid PayPal webhook payload." }, { status: 400 })
  }

  try {
    const verified = await verifyPayPalWebhookSignature(request.headers, event)
    if (!verified) {
      return NextResponse.json({ error: "Invalid PayPal webhook signature." }, { status: 400 })
    }

    await handlePayPalEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayPal webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 })
  }
}

async function handlePayPalEvent(event: PayPalWebhookEvent) {
  const providerCheckoutId = getPayPalOrderId(event)
  const order = providerCheckoutId
    ? await findOrderByProviderCheckout("paypal", providerCheckoutId)
    : null
  const orderId = order?.id || event.resource?.custom_id || null
  const eventId = event.id || `${event.event_type}-${providerCheckoutId || Date.now()}`

  const recorded = await recordPaymentEvent({
    provider: "paypal",
    eventId,
    eventType: event.event_type,
    orderId,
    payload: event,
  })

  if (!recorded || !orderId) return

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    await markOrderPaid({
      orderId,
      provider: "paypal",
      providerCheckoutId,
      providerPaymentId: event.resource?.id || null,
    })
    return
  }

  if (
    event.event_type === "PAYMENT.CAPTURE.DENIED"
    || event.event_type === "CHECKOUT.ORDER.VOIDED"
  ) {
    await markOrderPaymentFailed(orderId)
    return
  }

  if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
    await markOrderRefunded(orderId)
  }
}

function getPayPalOrderId(event: PayPalWebhookEvent) {
  return event.resource?.supplementary_data?.related_ids?.order_id
    || event.resource?.invoice_id
    || null
}

type PayPalWebhookEvent = {
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
