import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/checkout"
import { capturePayPalOrder } from "@/lib/paypal"
import { findOrderByProviderCheckout, markOrderPaid } from "@/lib/orders"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const baseUrl = getBaseUrl()

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/cart?paypal_error=missing_token`)
  }

  try {
    const order = await findOrderByProviderCheckout("paypal", token)
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/cart?paypal_error=order_not_found`)
    }
    if (order.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/checkout/success?provider=paypal&paypal_order_id=${encodeURIComponent(token)}`)
    }
    const capture = await capturePayPalOrder(token)
    const payment = capture?.purchase_units?.[0]?.payments?.captures?.[0]
    if (
      capture?.status !== "COMPLETED"
      || payment?.status !== "COMPLETED"
      || payment?.amount?.currency_code !== order.currency
      || Number(payment?.amount?.value) !== order.totalAmount
    ) {
      throw new Error("PayPal capture does not match the pending order.")
    }
    await markOrderPaid({
      orderId: order.id,
      provider: "paypal",
      providerCheckoutId: token,
      providerPaymentId: payment.id,
    })

    return NextResponse.redirect(`${baseUrl}/checkout/success?provider=paypal&paypal_order_id=${token}`)
  } catch (error) {
    console.error("PayPal capture error:", error)
    return NextResponse.redirect(`${baseUrl}/cart?paypal_error=capture_failed`)
  }
}
