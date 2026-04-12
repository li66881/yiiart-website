"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useLanguage } from "@/context/LanguageContext"

interface OrderItem {
  id: string
  title: string
  artist: string
  price: number
  image: string
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  paymentMethod: string
}

export default function OrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    // Load orders from localStorage (in real app, this would be API call)
    const saved = localStorage.getItem("yiiart-orders")
    if (saved) {
      setOrders(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "processing": return "bg-blue-100 text-blue-700"
      case "shipped": return "bg-purple-100 text-purple-700"
      case "delivered": return "bg-green-100 text-green-700"
      case "cancelled": return "bg-red-100 text-red-700"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "Pending"
      case "processing": return "Processing"
      case "shipped": return "Shipped"
      case "delivered": return "Delivered"
      case "cancelled": return "Cancelled"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50">
              <p className="text-gray-500 mb-4">No orders yet</p>
              <Link href="/artworks" className="px-6 py-2 bg-black text-white hover:bg-gray-800">
                Browse Artworks
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border">
                  <div 
                    className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="font-mono">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p>{order.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium">¥{order.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm">{selectedOrder?.id === order.id ? "▲" : "▼"}</span>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="p-4 border-t">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-2">Items</h3>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-100">
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-sm text-gray-500">by {item.artist}</p>
                                  <p className="text-sm">¥{item.price.toLocaleString()} × {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Shipping Address</h3>
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.phone}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          
                          <h3 className="font-medium mt-4 mb-2">Payment Method</h3>
                          <p>{order.paymentMethod}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <button className="px-4 py-2 border hover:bg-gray-50">
                          Track Shipment →
                        </button>
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
