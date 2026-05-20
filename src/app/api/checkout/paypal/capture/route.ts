import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/checkout"
import { capturePayPalOrder } from "@/lib/paypal"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const baseUrl = getBaseUrl()

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/cart?paypal_error=missing_token`)
  }

  try {
    await capturePayPalOrder(token)
    return NextResponse.redirect(`${baseUrl}/checkout/success?provider=paypal&paypal_order_id=${token}`)
  } catch (error) {
    console.error("PayPal capture error:", error)
    return NextResponse.redirect(`${baseUrl}/cart?paypal_error=capture_failed`)
  }
}
