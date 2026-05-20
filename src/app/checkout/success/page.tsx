"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/context/CartContext"

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get("session_id")
  const paypalOrderId = searchParams.get("paypal_order_id")

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white p-8 border">
            <h1 className="text-3xl font-light mb-4">Order confirmed</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed and is being processed.
            </p>

            {sessionId && (
              <div className="bg-gray-50 p-4 mb-6 text-left">
                <p className="text-sm text-gray-500">Stripe order reference</p>
                <p className="font-mono text-sm break-all">{sessionId}</p>
              </div>
            )}

            {paypalOrderId && (
              <div className="bg-gray-50 p-4 mb-6 text-left">
                <p className="text-sm text-gray-500">PayPal order reference</p>
                <p className="font-mono text-sm break-all">{paypalOrderId}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push("/orders")}
                className="w-full py-3 bg-black text-white hover:bg-gray-800"
              >
                View my orders
              </button>
              <button
                onClick={() => router.push("/artworks")}
                className="w-full py-3 border hover:bg-gray-50"
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
