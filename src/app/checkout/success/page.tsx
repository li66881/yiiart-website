"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("session_id")
    setSessionId(id)
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white p-8 border">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-light mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed and is being processed.
            </p>
            
            {sessionId && (
              <div className="bg-gray-50 p-4 mb-6 text-left">
                <p className="text-sm text-gray-500">Order Reference</p>
                <p className="font-mono text-sm">{sessionId}</p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => router.push("/orders")}
                className="w-full py-3 bg-black text-white hover:bg-gray-800"
              >
                View My Orders
              </button>
              <button 
                onClick={() => router.push("/artworks")}
                className="w-full py-3 border hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
