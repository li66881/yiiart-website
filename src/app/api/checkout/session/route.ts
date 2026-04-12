import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const { items, shippingAddress } = await request.json()

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("your_stripe")) {
      return NextResponse.json({ 
        success: false, 
        error: "Stripe key not configured" 
      }, { status: 500 })
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: item.currency || "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100), // price in cents
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: ["US", "CN", "GB", "DE", "FR", "JP", "AU", "CA", "SG", "HK", "TW"],
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
      },
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
