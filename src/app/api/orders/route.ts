import { NextResponse } from "next/server"
import {
  findOrderByNumber,
  findOrderByProviderCheckout,
} from "@/lib/orders"
import { isOrderStorageConfigured } from "@/lib/order-storage"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!isOrderStorageConfigured()) {
    return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 })
  }

  const url = new URL(request.url)
  const sessionId = url.searchParams.get("session_id")
  const paypalOrderId = url.searchParams.get("paypal_order_id")
  const orderNumber = url.searchParams.get("order_number")
  const email = url.searchParams.get("email")

  try {
    if (sessionId) {
      const order = await findOrderByProviderCheckout("stripe", sessionId)
      return NextResponse.json({ order: order ? toConfirmation(order) : null })
    }

    if (paypalOrderId) {
      const order = await findOrderByProviderCheckout("paypal", paypalOrderId)
      return NextResponse.json({ order: order ? toConfirmation(order) : null })
    }

    if (orderNumber) {
      if (!email) {
        return NextResponse.json({ error: "Email is required to look up an order number." }, { status: 400 })
      }
      const order = await findOrderByNumber(orderNumber, email)
      return NextResponse.json({ order })
    }

    return NextResponse.json({ error: "Provide an order lookup parameter." }, { status: 400 })
  } catch (error) {
    console.error("Order lookup error:", error)
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 })
  }
}

function toConfirmation(order: Awaited<ReturnType<typeof findOrderByProviderCheckout>>) {
  if (!order) return null
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    currency: order.currency,
    items: order.items.map(({ quantity }) => ({ quantity })),
  }
}
