"use client"

import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, itemCount } = useCart()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f0e8] text-[#181613]">
      <Header />
      
      <main className="flex-1 pb-20 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[#75432f]">Your selected works</p>
          <h1 className="mb-12 text-5xl font-light leading-[.98] tracking-[-0.055em]">{t("cart.title")}</h1>
          
          {items.length === 0 ? (
            <div className="border-y border-black/15 py-20 text-center">
              <p className="text-gray-500 mb-6">{t("cart.empty")}</p>
              <Link href="/artworks" className="inline-flex min-h-12 items-center bg-[#26352c] px-7 text-sm font-medium text-white transition-colors hover:bg-[#1e2520]">
                {t("cart.continueShopping")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
              {/* Cart Items */}
              <div>
                <div className="border-t border-black/15">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-5 border-b border-black/15 py-6">
                      <div className="relative h-32 w-28 shrink-0 bg-[#e8e1d6]">
                        {item.image && <Image src={item.image} alt={item.title} fill sizes="112px" className="object-cover" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-stone-500">{item.artist}</p>
                            {item.sizeLabel && <p className="text-sm text-stone-500">Size: {item.sizeLabel}</p>}
                            {item.finishLabel && <p className="text-sm text-stone-500">Finish: {item.finishLabel}</p>}
                          </div>
                          <p className="font-medium"><PriceText amountCny={item.price} /></p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <span className="border border-black/15 bg-[#fffdf8] px-3 py-1 text-sm">
                              {item.productionModel === "hand_painted_to_order" || item.sizeId
                                ? "Hand-painted to order"
                                : "One original artwork"}
                            </span>
                            {(item.productionModel === "hand_painted_to_order" || item.sizeId) && (
                              <label className="flex items-center gap-2 text-sm">
                                Qty
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={item.quantity}
                                  onChange={(event) => updateQuantity(item.key, Number(event.target.value))}
                                  className="w-16 border border-black/20 bg-[#fffdf8] px-2 py-1"
                                />
                              </label>
                            )}
                            <button 
                              onClick={() => removeItem(item.key)}
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
              <div>
                <div className="sticky top-28 border border-black/15 bg-[#fffdf8] p-7">
                  <h2 className="text-lg font-medium mb-4">{t("cart.orderSummary") || "Order Summary"}</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">{t("cart.subtotal")} ({itemCount} items)</span>
                      <span><PriceText amountCny={subtotal} /></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{t("cart.shipping")}</span>
                      <span>{t("cart.free")}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-medium">
                      <span>{t("cart.total")}</span>
                      <span><PriceText amountCny={subtotal} /></span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="mt-6 block w-full bg-[#26352c] py-4 text-center text-sm font-medium text-white transition-colors hover:bg-[#1e2520]"
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
