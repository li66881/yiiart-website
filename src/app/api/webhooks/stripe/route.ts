import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { getOrderStorageProvider, isOrderStorageConfigured } from "@/lib/order-storage"
import {
  findOrderByProviderPayment,
  markOrderDisputed,
  markOrderPaid,
  markOrderPaymentFailed,
  markOrderRefunded,
  recordPaymentEvent,
} from "@/lib/orders"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "stripe",
    endpoint: "/api/webhooks/stripe",
    accepts: "POST",
    configured: {
      secretKey: Boolean(process.env.STRIPE_SECRET_KEY),
      webhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      orderStorage: isOrderStorageConfigured(),
      orderStorageProvider: getOrderStorageProvider(),
    },
  })
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await request.text()
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error("Stripe webhook signature error:", error)
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  try {
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 })
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  const orderId = getStripeOrderId(event)
  const recorded = await recordPaymentEvent({
    provider: "stripe",
    eventId: event.id,
    eventType: event.type,
    orderId,
    payload: event,
  })

  if (!recorded) return

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const sessionOrderId = session.metadata?.orderId || session.client_reference_id
    if (!sessionOrderId) throw new Error("Stripe session missing orderId metadata.")

    await markOrderPaid({
      orderId: sessionOrderId,
      provider: "stripe",
      providerCheckoutId: session.id,
      providerPaymentId: getStripeId(session.payment_intent),
    })
    return
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent
    const intentOrderId = intent.metadata?.orderId
    if (intentOrderId) await markOrderPaymentFailed(intentOrderId)
    return
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge
    const paymentIntentId = getStripeId(charge.payment_intent)
    if (!paymentIntentId) return
    const order = await findOrderByProviderPayment("stripe", paymentIntentId)
    if (order) await markOrderRefunded(order.id)
    return
  }

  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute
    const chargeId = getStripeId(dispute.charge)
    if (!chargeId) return
    const charge = await getStripe().charges.retrieve(chargeId)
    const paymentIntentId = getStripeId(charge.payment_intent)
    if (!paymentIntentId) return
    const order = await findOrderByProviderPayment("stripe", paymentIntentId)
    if (order) await markOrderDisputed(order.id)
  }
}

function getStripeOrderId(event: Stripe.Event) {
  const object = event.data.object as { metadata?: Record<string, string>; client_reference_id?: string | null }
  return object.metadata?.orderId || object.client_reference_id || null
}

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (!value) return null
  return typeof value === "string" ? value : value.id || null
}
