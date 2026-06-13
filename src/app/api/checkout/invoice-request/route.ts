import { NextResponse } from "next/server"
import {
  CheckoutValidationError,
  getCheckoutLineItems,
  normalizeCurrency,
} from "@/lib/checkout"
import { createPendingOrder } from "@/lib/orders"
import { getStoreCurrency } from "@/lib/pricing"
import { getWhatsAppUrl } from "@/lib/site"
import { isManualInvoiceEnabled } from "@/lib/payment-config"
import { isOrderStorageConfigured } from "@/lib/supabase-admin"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    if (!isManualInvoiceEnabled()) {
      return NextResponse.json(
        { success: false, error: "Invoice requests are not enabled." },
        { status: 503 }
      )
    }

    const { items, shippingAddress, displayCurrency } = await request.json()
    const currency = normalizeCurrency(
      process.env.PAYPAL_CURRENCY || process.env.STRIPE_CURRENCY,
      getStoreCurrency()
    ).toUpperCase()
    const checkoutItems = await getCheckoutLineItems(items, currency)

    let order: { id: string; orderNumber: string } | null = null

    if (isOrderStorageConfigured()) {
      order = await createPendingOrder({
        provider: "manual",
        items: checkoutItems,
        shippingAddress,
        currency,
        displayCurrency,
      })
    }

    return NextResponse.json({
      success: true,
      orderNumber: order?.orderNumber || null,
      url: getWhatsAppUrl(buildInvoiceMessage({
        orderNumber: order?.orderNumber,
        items: checkoutItems,
        currency,
        shippingAddress,
      })),
    })
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error("Invoice request error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Invoice request failed." },
      { status: 500 }
    )
  }
}

function buildInvoiceMessage({
  orderNumber,
  items,
  currency,
  shippingAddress,
}: {
  orderNumber?: string
  items: Array<{ title: string; artistName?: string; price: number; quantity: number }>
  currency: string
  shippingAddress: unknown
}) {
  const address = typeof shippingAddress === "object" && shippingAddress
    ? shippingAddress as Record<string, unknown>
    : {}
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const lines = [
    "Hello YiiArt, I would like to request an invoice for this order.",
    orderNumber ? `Order number: ${orderNumber}` : "",
    "",
    "Items:",
    ...items.map((item) => `- ${item.title}${item.artistName ? ` by ${item.artistName}` : ""} x ${item.quantity} (${currency} ${item.price.toFixed(2)})`),
    `Total before final confirmation: ${currency} ${total.toFixed(2)}`,
    "",
    `Name: ${stringValue(address.name)}`,
    `Email: ${stringValue(address.email)}`,
    `Country: ${stringValue(address.country)}`,
    `City: ${stringValue(address.city)}`,
    `Postal code: ${stringValue(address.postalCode)}`,
    `Address: ${stringValue(address.address)}`,
    stringValue(address.notes) ? `Notes: ${stringValue(address.notes)}` : "",
  ]

  return lines.filter(Boolean).join("\n")
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}
