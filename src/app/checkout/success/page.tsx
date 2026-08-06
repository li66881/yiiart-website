"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/context/CartContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount, getStoreCurrency } from "@/lib/pricing"

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart, items, subtotal } = useCart()
  const purchaseTrackedRef = useRef(false)
  const sessionId = searchParams.get("session_id")
  const paypalOrderId = searchParams.get("paypal_order_id")
  const [order, setOrder] = useState<SuccessOrder | null>(null)
  const [orderLoading, setOrderLoading] = useState(true)

  useEffect(() => {
    if (purchaseTrackedRef.current) return
    purchaseTrackedRef.current = true

    const storedItems = items.length > 0 ? items : readStoredCartItems()
    const trackedSubtotal =
      items.length > 0
        ? subtotal
        : storedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (storedItems.length > 0) {
      const currency = getStoreCurrency()
      trackMarketingEvent("Purchase", {
        transaction_id: sessionId || paypalOrderId || "unknown",
        currency,
        value: convertCnyToStoreAmount(trackedSubtotal, currency),
        num_items: storedItems.reduce((count, item) => count + item.quantity, 0),
      })
    }

    clearCart()
  }, [clearCart, items, paypalOrderId, sessionId, subtotal])

  useEffect(() => {
    const params = sessionId
      ? `session_id=${encodeURIComponent(sessionId)}`
      : paypalOrderId
        ? `paypal_order_id=${encodeURIComponent(paypalOrderId)}`
        : ""

    if (!params) {
      setOrderLoading(false)
      return
    }

    let cancelled = false
    fetch(`/api/orders?${params}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return
        const loadedOrder = data?.order || null
        setOrder(loadedOrder)
        if (loadedOrder?.customerEmail) {
          localStorage.setItem("yiiart-order-email", loadedOrder.customerEmail)
        }
      })
      .catch(() => {
        if (!cancelled) setOrder(null)
      })
      .finally(() => {
        if (!cancelled) setOrderLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [paypalOrderId, sessionId])

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-[#181613]">
      <Header />

      <main className="flex-1 pb-20 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="border border-stone-200 bg-white p-8 md:p-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Checkout</p>
            <h1 className="mb-4 text-4xl font-medium tracking-[-0.03em]">Order confirmed</h1>
            <p className="mb-8 text-stone-600">
              Thank you for your purchase. Your order has been received and will be prepared after payment confirmation.
            </p>

            {orderLoading && (
              <div className="mb-6 border border-stone-200 bg-[#f7f5f0] p-4 text-left text-sm text-stone-600">
                Loading order confirmation...
              </div>
            )}

            {order && (
              <div className="mb-6 border border-stone-200 bg-[#f7f5f0] p-4 text-left">
                <p className="text-sm text-stone-500">YiiArt order number</p>
                <p className="font-mono text-sm">{order.orderNumber}</p>
                <p className="mt-3 text-sm text-stone-500">Payment status</p>
                <p className="text-sm font-medium">{formatStatus(order.status)}</p>
                <p className="mt-3 text-sm text-stone-500">Total</p>
                <p className="text-sm font-medium">{formatMoney(order.totalAmount, order.currency)}</p>
              </div>
            )}

            {sessionId && (
              <div className="mb-6 border border-stone-200 bg-[#f7f5f0] p-4 text-left">
                <p className="text-sm text-stone-500">Stripe order reference</p>
                <p className="break-all font-mono text-sm">{sessionId}</p>
              </div>
            )}

            {paypalOrderId && (
              <div className="mb-6 border border-stone-200 bg-[#f7f5f0] p-4 text-left">
                <p className="text-sm text-stone-500">PayPal order reference</p>
                <p className="break-all font-mono text-sm">{paypalOrderId}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push("/orders")}
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#111] text-sm font-semibold tracking-[0.04em] text-white transition hover:bg-[#2a2a2a]"
              >
                View my orders
              </button>
              <button
                type="button"
                onClick={() => router.push("/artworks")}
                className="flex min-h-12 w-full items-center justify-center border border-stone-300 text-sm transition hover:border-black"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function readStoredCartItems() {
  try {
    const savedCart = localStorage.getItem("yiiart-cart")
    return savedCart ? (JSON.parse(savedCart) as Array<{ price: number; quantity: number }>) : []
  } catch {
    return []
  }
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount)
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

type SuccessOrder = {
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  customerEmail?: string
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] text-stone-500">Loading...</div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
