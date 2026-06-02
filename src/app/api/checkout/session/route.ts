import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import {
  CheckoutValidationError,
  getBaseUrl,
  getCheckoutLineItems,
  normalizeCurrency,
} from "@/lib/checkout"
import { getStoreCurrency } from "@/lib/pricing"

export async function POST(request: Request) {
  try {
    const { items, shippingAddress } = await request.json()

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("your_stripe")) {
      return NextResponse.json(
        { success: false, error: "Stripe key not configured" },
        { status: 500 }
      )
    }

    const checkoutItems = await getCheckoutLineItems(items)
    const currency = normalizeCurrency(process.env.STRIPE_CURRENCY, getStoreCurrency())
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
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "DE", "FR", "NL", "ES", "IT", "AU", "NZ", "SG", "JP", "KR", "CN", "HK", "TW"],
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        artworkIds: checkoutItems.map((item) => item.id).join(",").slice(0, 500),
        shippingAddress: JSON.stringify(shippingAddress || {}).slice(0, 500),
      },
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error("Checkout error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
