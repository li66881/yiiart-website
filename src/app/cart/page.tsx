"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

// Cart item type
interface CartItem {
  id: string
  title: string
  artist: string
  price: number
  image: string
  quantity: number
  size?: string
}

// Demo cart items
const demoCartItems: CartItem[] = [
  {
    id: "1",
    title: "Sunset in Provence",
    artist: "Li Wei",
    price: 12800,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
    quantity: 1,
    size: "80x100cm"
  },
  {
    id: "2",
    title: "Mountain Morning",
    artist: "Zhang Ming",
    price: 15800,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80",
    quantity: 1,
    size: "60x80cm"
  }
]

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(demoCartItems)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping: number = subtotal > 0 ? 0 : 0 // Free shipping
  const total: number = subtotal + shipping

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta)
        return newQty === 0 ? item : { ...item, quantity: newQty }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleCheckout = () => {
    alert("Checkout functionality coming soon!")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">Shopping Cart</h1>
          
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">Your cart is empty</p>
              <Link href="/artworks" className="px-8 py-3 bg-black text-white">
                Browse Artworks
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="border-t">
                  {items.map((item) => (
                    <div key={item.id} className="py-6 border-b flex gap-4">
                      <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.artist}</p>
                            {item.size && <p className="text-sm text-gray-400">{item.size}</p>}
                          </div>
                          <p className="font-medium">¥{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 border hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 border hover:bg-gray-50"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="ml-4 text-sm text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="font-medium">¥{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6">
                  <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span>{shipping === 0 ? "Free" : `¥${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-medium">
                      <span>Total</span>
                      <span>¥{total.toLocaleString()}</span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="block w-full mt-6 py-3 bg-black text-white text-center hover:bg-gray-800"
                  >
                    Proceed to Checkout
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Secure checkout powered by Stripe/PayPal
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
