import { NextResponse } from "next/server"
import {
  CheckoutValidationError,
  formatProviderAmount,
  getBaseUrl,
  getCheckoutLineItems,
  normalizeCurrency,
} from "@/lib/checkout"
import { getPayPalAccessToken, getPayPalApiBase, isPayPalConfigured } from "@/lib/paypal"

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { success: false, error: "PayPal credentials are not configured" },
        { status: 500 }
      )
    }

    const { items } = await request.json()
    const checkoutItems = await getCheckoutLineItems(items)
    const currency = normalizeCurrency(
      process.env.PAYPAL_CURRENCY || process.env.STRIPE_CURRENCY,
      "cny"
    ).toUpperCase()
    const baseUrl = getBaseUrl()
    const total = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "YiiArt artwork order",
            custom_id: checkoutItems.map((item) => item.id).join(",").slice(0, 127),
            amount: {
              currency_code: currency,
              value: formatProviderAmount(total),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: formatProviderAmount(total),
                },
              },
            },
            items: checkoutItems.map((item) => ({
              name: item.title.slice(0, 127),
              description: item.artistName ? `Artwork by ${item.artistName}`.slice(0, 127) : undefined,
              quantity: String(item.quantity),
              unit_amount: {
                currency_code: currency,
                value: formatProviderAmount(item.price),
              },
              category: "PHYSICAL_GOODS",
            })),
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "YiiArt",
              landing_page: "LOGIN",
              shipping_preference: "GET_FROM_FILE",
              user_action: "PAY_NOW",
              return_url: `${baseUrl}/api/checkout/paypal/capture`,
              cancel_url: `${baseUrl}/cart`,
            },
          },
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("PayPal order error:", data)
      return NextResponse.json(
        { success: false, error: "Failed to create PayPal order" },
        { status: 500 }
      )
    }

    const approveLink = data.links?.find((link: { rel?: string }) => link.rel === "payer-action")
      || data.links?.find((link: { rel?: string }) => link.rel === "approve")

    if (!approveLink?.href) {
      return NextResponse.json(
        { success: false, error: "PayPal did not return an approval link" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id, url: approveLink.href })
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error("PayPal checkout error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to start PayPal checkout" },
      { status: 500 }
    )
  }
}
