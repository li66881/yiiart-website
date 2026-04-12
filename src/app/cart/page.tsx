"use client"

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, itemCount } = useCart()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">{t("cart.title")}</h1>
          
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">{t("cart.empty")}</p>
              <Link href="/artworks" className="px-8 py-3 bg-black text-white">
                {t("cart.continueShopping")}
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
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 border hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border hover:bg-gray-50"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="ml-4 text-sm text-red-500 hover:underline"
                            >
                              {t("cart.remove")}
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
                  <h2 className="text-lg font-medium mb-4">{t("cart.orderSummary") || "Order Summary"}</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("cart.subtotal")} ({itemCount} items)</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("cart.shipping")}</span>
                      <span>{t("cart.free")}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-medium">
                      <span>{t("cart.total")}</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="block w-full mt-6 py-3 bg-black text-white text-center hover:bg-gray-800"
                  >
                    {t("cart.proceedToCheckout")}
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Secure checkout powered by Stripe
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
