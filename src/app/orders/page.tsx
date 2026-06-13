"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useLanguage } from "@/context/LanguageContext"

type Order = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  paymentProvider?: string | null
  currency: string
  totalAmount: number
  customerEmail: string
  customerName: string
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
    notes?: string | null
  }
  items: Array<{
    artworkId: string
    title: string
    artistName?: string | null
    imageUrl?: string | null
    quantity: number
    unitAmount: number
    totalAmount: number
    currency: string
  }>
  createdAt: string
  paidAt?: string | null
}

export default function OrdersPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const savedEmail = localStorage.getItem("yiiart-order-email")
    if (savedEmail) {
      setEmail(savedEmail)
      void loadOrders(savedEmail)
    }
  }, [])

  async function loadOrders(lookupEmail: string) {
    const normalizedEmail = lookupEmail.trim().toLowerCase()
    if (!normalizedEmail) return

    setLoading(true)
    setError("")
    setSearched(true)

    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(normalizedEmail)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load orders.")
      setOrders(data.orders || [])
      localStorage.setItem("yiiart-order-email", normalizedEmail)
    } catch (loadError) {
      setOrders([])
      setError(loadError instanceof Error ? loadError.message : "Could not load orders.")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void loadOrders(email)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">My Orders</h1>

          <form onSubmit={handleSubmit} className="mb-8 border bg-white p-5">
            <label className="block text-sm font-medium mb-2">Email used at checkout</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="you@example.com"
              />
              <button type="submit" disabled={loading} className="bg-black px-6 py-2 text-white disabled:opacity-50">
                {loading ? t("common.loading") : "Find orders"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </form>

          {loading ? (
            <div className="text-center py-20 bg-gray-50">
              <p>{t("common.loading")}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50">
              <p className="text-gray-500 mb-4">{searched ? "No orders found for this email" : "Enter your checkout email to view orders"}</p>
              <Link href="/artworks" className="px-6 py-2 bg-black text-white hover:bg-gray-800">
                Browse Artworks
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border">
                  <button
                    type="button"
                    className="w-full p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-4 text-left hover:bg-gray-100"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <div className="flex flex-wrap gap-6">
                      <OrderStat label="Order Number" value={order.orderNumber} mono />
                      <OrderStat label="Date" value={new Date(order.createdAt).toLocaleDateString()} />
                      <OrderStat label="Total" value={formatMoney(order.totalAmount, order.currency)} />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-2 py-1 text-xs ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm">{selectedOrder?.id === order.id ? "Close" : "Details"}</span>
                  </button>

                  {selectedOrder?.id === order.id && (
                    <div className="p-4 border-t">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-2">Items</h3>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.artworkId} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-100">
                                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  {item.artistName && <p className="text-sm text-gray-500">by {item.artistName}</p>}
                                  <p className="text-sm">{formatMoney(item.unitAmount, item.currency)} x {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Shipping Address</h3>
                          <p>{order.customerName}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>

                          <h3 className="font-medium mt-4 mb-2">Payment</h3>
                          <p>{order.paymentProvider === "paypal" ? "PayPal" : "Card"}</p>
                          <p className="text-sm text-gray-500">{formatStatus(order.paymentStatus)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function OrderStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={mono ? "font-mono" : "font-medium"}>{value}</p>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "fulfilled":
      return "bg-green-100 text-green-700"
    case "payment_processing":
    case "pending_payment":
      return "bg-yellow-100 text-yellow-700"
    case "refunded":
    case "cancelled":
    case "payment_failed":
    case "disputed":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount)
}
