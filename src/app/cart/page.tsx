"use client"

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"

export default function CartPage() {
  const { items, subtotal, removeItem, itemCount } = useCart()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">{t("cart.title")}</h1>
          
          {items.length === 0 ? (
            <div className="mx-auto max-w-4xl py-16">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.18em] text-stone-400">Collector path</p>
                <h2 className="mt-3 text-3xl font-light text-stone-950">{t("cart.empty")}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-stone-600">
                  Choose a ready-made painting, ask for room advice, or begin a custom canvas request when you need a
                  specific scale, palette, or wall fit.
                </p>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <EmptyCartAction
                  href="/artworks"
                  title="Shop curated artworks"
                  text="Browse original paintings selected for modern homes, feature walls, and calm interiors."
                  cta="View artworks"
                />
                <EmptyCartAction
                  href="/contact"
                  title="Request room advice"
                  text="Send wall size, room photos, and color direction before choosing the right piece."
                  cta="Get advice"
                />
                <EmptyCartAction
                  href="/custom-painting"
                  title="Start a custom painting"
                  text="Plan a handmade canvas around your room, dimensions, preferred palette, and mood."
                  cta="Start request"
                />
              </div>
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
                          <p className="font-medium"><PriceText amountCny={item.price} /></p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <span className="border px-3 py-1 text-sm">One original artwork</span>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="ml-4 text-sm text-red-500 hover:underline"
                            >
                              {t("cart.remove")}
                            </button>
                          </div>
                          <p className="font-medium"><PriceText amountCny={item.price * item.quantity} /></p>
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
                      <span><PriceText amountCny={subtotal} /></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("cart.shipping")}</span>
                      <span>{t("cart.free")}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-medium">
                      <span>{t("cart.total")}</span>
                      <span><PriceText amountCny={subtotal} /></span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="block w-full mt-6 py-3 bg-black text-white text-center hover:bg-gray-800"
                  >
                    {t("cart.proceedToCheckout")}
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Secure checkout powered by PayPal and YiiArt invoice support
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    <PriceDisclosure />
                  </p>
                  <div className="mt-5">
                    <ReviewTrustBadge />
                    <Link href="/reviews" className="mt-3 block text-center text-sm underline underline-offset-4">
                      Read verified collector reviews
                    </Link>
                  </div>
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

function EmptyCartAction({
  href,
  title,
  text,
  cta,
}: {
  href: string
  title: string
  text: string
  cta: string
}) {
  return (
    <Link href={href} className="group border border-stone-200 bg-white p-6 text-left transition hover:border-stone-950">
      <h3 className="text-lg font-medium text-stone-950">{title}</h3>
      <p className="mt-3 min-h-20 text-sm leading-6 text-stone-600">{text}</p>
      <span className="mt-5 inline-block text-sm font-medium underline underline-offset-4 group-hover:no-underline">
        {cta}
      </span>
    </Link>
  )
}
