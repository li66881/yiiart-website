import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import {
  CheckoutValidationError,
  getBaseUrl,
  getCheckoutLineItems,
  normalizeCurrency,
} from "@/lib/checkout"
import { getStoreCurrency } from "@/lib/pricing"
import { createPendingOrder, attachStripeCheckoutToOrder } from "@/lib/orders"
import { isStripeCheckoutEnabled } from "@/lib/payment-config"

export async function POST(request: Request) {
  try {
    const { items, shippingAddress, displayCurrency } = await request.json()

    if (!isStripeCheckoutEnabled() || process.env.STRIPE_SECRET_KEY?.includes("your_stripe")) {
      return NextResponse.json(
        { success: false, error: "Card checkout is currently unavailable. Please request a PayPal invoice or contact YiiArt on WhatsApp." },
        { status: 503 }
      )
    }

    const currency = normalizeCurrency(process.env.STRIPE_CURRENCY, getStoreCurrency())
    const checkoutItems = await getCheckoutLineItems(items, currency)
    const order = await createPendingOrder({
      provider: "stripe",
      items: checkoutItems,
      shippingAddress,
      currency,
      displayCurrency,
    })
    const lineItems = checkoutItems.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.title,
          description: item.artistName ? `Artwork by ${item.artistName}` : undefined,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const baseUrl = getBaseUrl()
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: order.address.email,
      client_reference_id: order.id,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          provider: "stripe",
        },
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        artworkIds: checkoutItems.map((item) => item.id).join(",").slice(0, 500),
      },
    })

    await attachStripeCheckoutToOrder(order.id, session)

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error("Checkout error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
