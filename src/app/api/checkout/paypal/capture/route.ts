import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/checkout"
import { capturePayPalOrder } from "@/lib/paypal"
import { isPayPalCaptureCompleted } from "@/lib/payment-confirmation"
import { findOrderByProviderCheckout, markOrderPaid } from "@/lib/orders"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const internalOrderId = url.searchParams.get("internal_order_id")
  const baseUrl = getBaseUrl()

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/cart?paypal_error=missing_token`)
  }

  try {
    const order = await findOrderByProviderCheckout("paypal", token)
    if (!order || (internalOrderId && order.id !== internalOrderId)) {
      throw new Error("PayPal order does not match the pending YiiArt order.")
    }

    const capture = await capturePayPalOrder(token)
    if (!isPayPalCaptureCompleted(capture)) {
      return NextResponse.redirect(`${baseUrl}/cart?paypal_error=capture_not_completed`)
    }

    await markOrderPaid({
      orderId: order.id,
      provider: "paypal",
      providerCheckoutId: token,
      providerPaymentId: getPayPalCaptureId(capture),
    })

    return NextResponse.redirect(`${baseUrl}/checkout/success?provider=paypal&paypal_order_id=${token}`)
  } catch (error) {
    console.error("PayPal capture error:", error)
    return NextResponse.redirect(`${baseUrl}/cart?paypal_error=capture_failed`)
  }
}

function getPayPalCaptureId(capture: any) {
  return capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null
}
