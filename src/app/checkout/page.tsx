"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useRouter } from "next/navigation"

type Step = "shipping" | "payment" | "confirm"

export default function CheckoutPage() {
  const { t } = useLanguage()
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>("shipping")
  const [loading, setLoading] = useState(false)
  
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("wechat")

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("confirm")
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          })),
          shippingAddress,
          paymentMethod,
        }),
      })

      const { url, sessionId, error } = await response.json()

      if (error) {
        alert("Payment failed: " + error)
        setLoading(false)
        return
      }

      // For demo: simulate successful payment without actual Stripe
      // In production, this would redirect to Stripe
      if (paymentMethod === "demo" || paymentMethod === "wechat" || paymentMethod === "alipay") {
        // Save order to localStorage
        const order = {
          id: Date.now().toString(),
          orderNumber: "YII" + Date.now().toString().slice(-10),
          date: new Date().toISOString().split("T")[0],
          status: "processing",
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          })),
          subtotal: subtotal,
          shipping: 0,
          total: subtotal,
          shippingAddress,
          paymentMethod,
        }

        const savedOrders = localStorage.getItem("yiiart-orders")
        const orders = savedOrders ? JSON.parse(savedOrders) : []
        orders.unshift(order)
        localStorage.setItem("yiiart-orders", JSON.stringify(orders))

        clearCart()
        router.push("/orders")
      } else if (url) {
        // Real Stripe redirect
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Checkout failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-light mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === "shipping" || step === "payment" || step === "confirm" ? "text-black" : "text-gray-400"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "shipping" || step === "payment" || step === "confirm" ? "bg-black text-white" : "bg-gray-200"}`}>1</span>
                <span>Shipping</span>
              </div>
              <div className="w-12 h-px bg-gray-300" />
              <div className={`flex items-center gap-2 ${step === "payment" || step === "confirm" ? "text-black" : "text-gray-400"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" || step === "confirm" ? "bg-black text-white" : "bg-gray-200"}`}>2</span>
                <span>Payment</span>
              </div>
              <div className="w-12 h-px bg-gray-300" />
              <div className={`flex items-center gap-2 ${step === "confirm" ? "text-black" : "text-gray-400"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "confirm" ? "bg-black text-white" : "bg-gray-200"}`}>3</span>
                <span>Confirm</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Step 1: Shipping */}
              {step === "shipping" && (
                <form onSubmit={handleShippingSubmit} className="bg-white p-6 border">
                  <h2 className="text-xl font-medium mb-6">Shipping Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Address *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Order Notes (optional)</label>
                      <textarea
                        value={shippingAddress.notes}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
                        className="w-full px-3 py-2 border focus:outline-none focus:ring-1 h-20"
                        placeholder="Special instructions for delivery or artwork..."
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-6 py-3 bg-black text-white hover:bg-gray-800">
                    Continue to Payment →
                  </button>
                </form>
              )}

              {/* Step 2: Payment */}
              {step === "payment" && (
                <form onSubmit={handlePaymentSubmit} className="bg-white p-6 border">
                  <h2 className="text-xl font-medium mb-6">Payment Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 ${paymentMethod === "wechat" ? "border-black" : ""}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="wechat"
                        checked={paymentMethod === "wechat"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-medium">WeChat Pay</p>
                        <p className="text-sm text-gray-500">Pay with WeChat</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 ${paymentMethod === "alipay" ? "border-black" : ""}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="alipay"
                        checked={paymentMethod === "alipay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="font-medium">Alipay</p>
                        <p className="text-sm text-gray-500">Pay with Alipay</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 ${paymentMethod === "paypal" ? "border-black" : ""}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-2xl">🅿️</span>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-gray-500">Pay with PayPal</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 ${paymentMethod === "card" ? "border-black" : ""}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 ${paymentMethod === "demo" ? "border-black" : ""}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="demo"
                        checked={paymentMethod === "demo"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-2xl">🎭</span>
                      <div>
                        <p className="font-medium">Demo (No Real Payment)</p>
                        <p className="text-sm text-gray-500">For testing purposes only</p>
                      </div>
                    </label>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setStep("shipping")} className="flex-1 py-3 border hover:bg-gray-50">
                      ← Back
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-black text-white hover:bg-gray-800">
                      Review Order →
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Confirm */}
              {step === "confirm" && (
                <div className="bg-white p-6 border">
                  <h2 className="text-xl font-medium mb-6">Review Your Order</h2>
                  
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="font-medium">Shipping Address</h3>
                    <p>{shippingAddress.name}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  </div>

                  <div className="space-y-4 border-b pb-4 mt-4">
                    <h3 className="font-medium">Payment Method</h3>
                    <p>{paymentMethod === "wechat" ? "WeChat Pay" : paymentMethod === "alipay" ? "Alipay" : paymentMethod === "paypal" ? "PayPal" : paymentMethod === "card" ? "Credit/Debit Card" : "Demo"}</p>
                  </div>

                  <div className="space-y-4 mt-4">
                    <h3 className="font-medium">Items</h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-100">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">by {item.artist}</p>
                        </div>
                        <p>¥{item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setStep("payment")} className="flex-1 py-3 border hover:bg-gray-50">
                      ← Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 border sticky top-24">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">× {item.quantity}</p>
                      </div>
                      <p className="text-sm">¥{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
