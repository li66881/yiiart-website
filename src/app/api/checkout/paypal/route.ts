import { NextResponse } from "next/server"
import {
  CheckoutValidationError,
  formatProviderAmount,
  getBaseUrl,
  getCheckoutLineItems,
  normalizeCurrency,
} from "@/lib/checkout"
import { getPayPalAccessToken, getPayPalApiBase, isPayPalConfigured } from "@/lib/paypal"
import { getStoreCurrency } from "@/lib/pricing"
import {
  attachPayPalOrderToOrder,
  createPendingOrder,
  markOrderCancelled,
} from "@/lib/orders"

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { success: false, error: "PayPal credentials are not configured" },
        { status: 500 }
      )
    }

    const { items, shippingAddress, displayCurrency } = await request.json()
    const checkoutItems = await getCheckoutLineItems(items)
    const currency = normalizeCurrency(
      process.env.PAYPAL_CURRENCY || process.env.STRIPE_CURRENCY,
      getStoreCurrency()
    ).toUpperCase()
    const order = await createPendingOrder({
      provider: "paypal",
      items: checkoutItems,
      shippingAddress,
      currency,
      displayCurrency,
    })
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
            custom_id: order.id,
            invoice_id: order.orderNumber,
            soft_descriptor: "YIIART",
            shipping: {
              name: {
                full_name: order.address.name.slice(0, 300),
              },
              address: {
                address_line_1: order.address.address.slice(0, 300),
                admin_area_2: order.address.city.slice(0, 120),
                postal_code: order.address.postalCode.slice(0, 60),
                country_code: order.address.country,
              },
            },
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
              shipping_preference: "SET_PROVIDED_ADDRESS",
              user_action: "PAY_NOW",
              return_url: `${baseUrl}/api/checkout/paypal/capture?internal_order_id=${encodeURIComponent(order.id)}`,
              cancel_url: `${baseUrl}/cart`,
            },
          },
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("PayPal order error:", data)
      await markOrderCancelled(order.id)
      return NextResponse.json(
        { success: false, error: "Failed to create PayPal order" },
        { status: 500 }
      )
    }

    const approveLink = data.links?.find((link: { rel?: string }) => link.rel === "payer-action")
      || data.links?.find((link: { rel?: string }) => link.rel === "approve")

    if (!approveLink?.href) {
      await markOrderCancelled(order.id)
      return NextResponse.json(
        { success: false, error: "PayPal did not return an approval link" },
        { status: 500 }
      )
    }

    await attachPayPalOrderToOrder(order.id, data.id)

    return NextResponse.json({ success: true, id: data.id, url: approveLink.href })
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error("PayPal checkout error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to start PayPal checkout" },
      { status: 500 }
    )
  }
}
