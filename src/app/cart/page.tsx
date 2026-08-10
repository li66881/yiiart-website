"use client"

import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import ReviewTrustBadge from "@/components/ReviewTrustBadge"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, itemCount, ready } = useCart()
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f0e8] text-[#181613]">
      <Header />

      <main className="optimized-cart-layout flex-1 pb-20 pt-[calc(var(--yiiart-header-offset)+48px)]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-black/15 pb-7">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-[#75432f]">Your selected works</p>
              <h1 className="text-4xl font-light leading-none md:text-6xl">{t("cart.title")}</h1>
            </div>
            {ready && items.length > 0 ? <p className="pb-1 text-sm text-stone-500">{itemCount} {itemCount === 1 ? "item" : "items"}</p> : null}
          </div>

          {!ready ? (
            <div className="h-64 animate-pulse border-y border-black/10 bg-white/30" aria-label="Loading cart" />
          ) : items.length === 0 ? (
            <div className="border-y border-black/15 py-24 text-center">
              <p className="mb-7 text-stone-500">{t("cart.empty")}</p>
              <Link href="/artworks" className="inline-flex min-h-12 items-center bg-[#26352c] px-7 text-sm font-medium text-white transition-colors hover:bg-[#1e2520]">
                {t("cart.continueShopping")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-16">
              <section aria-label="Cart items">
                <div className="border-t border-black/15">
                  {items.map((item) => {
                    const madeToOrder = item.productionModel === "hand_painted_to_order"
                    return (
                      <article key={item.key} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-black/15 py-6 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                        <Link href={`/artwork/${item.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#e8e1d6]">
                          {item.image ? <Image src={item.image} alt={item.title} fill sizes="150px" className="object-cover" /> : null}
                        </Link>

                        <div className="flex min-w-0 flex-col justify-between gap-5">
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                            <div className="min-w-0">
                              <p className="mb-2 text-[0.68rem] font-semibold uppercase text-[#75432f]">
                                {madeToOrder ? "Hand-painted to order" : "Original artwork"}
                              </p>
                              <Link href={`/artwork/${item.slug}`} className="font-medium hover:underline">{item.title}</Link>
                              <p className="mt-1 text-sm text-stone-500">{item.artist}</p>
                              <div className="mt-3 grid gap-1 text-xs leading-5 text-stone-500 sm:text-sm">
                                {item.sizeLabel ? <p>Size: {item.sizeLabel}</p> : null}
                                {item.finishLabel ? <p>Finish: {item.finishLabel}</p> : null}
                              </div>
                            </div>
                            <p className="font-semibold"><PriceText amountCny={item.price * item.quantity} /></p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {madeToOrder ? (
                                <div className="grid h-10 grid-cols-[36px_38px_36px] border border-black/20 bg-[#fffdf8]" aria-label={`Quantity for ${item.title}`}>
                                  <button type="button" aria-label={`Decrease ${item.title} quantity`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.key, item.quantity - 1)} className="disabled:text-stone-300">-</button>
                                  <output className="flex items-center justify-center border-x border-black/10 text-sm">{item.quantity}</output>
                                  <button type="button" aria-label={`Increase ${item.title} quantity`} disabled={item.quantity >= 99} onClick={() => updateQuantity(item.key, item.quantity + 1)} className="disabled:text-stone-300">+</button>
                                </div>
                              ) : (
                                <span className="text-xs text-stone-500">Quantity 1</span>
                              )}
                              <button type="button" onClick={() => removeItem(item.key)} className="min-h-10 text-sm text-stone-500 underline underline-offset-4 hover:text-red-700">
                                {t("cart.remove")}
                              </button>
                            </div>
                            <p className="text-xs text-stone-500">Unit price <PriceText amountCny={item.price} /></p>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
                <Link href="/artworks" className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Continue shopping</Link>
              </section>

              <aside>
                <div className="sticky top-[calc(var(--yiiart-header-offset)+24px)] border border-black/15 bg-[#fffdf8] p-6 sm:p-7">
                  <h2 className="mb-5 text-xl font-medium">{t("cart.orderSummary") || "Order Summary"}</h2>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">{t("cart.subtotal")} ({itemCount} items)</span>
                      <span><PriceText amountCny={subtotal} /></span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">{t("cart.shipping")}</span>
                      <span>Confirmed at checkout</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-black/15 pt-4 text-base font-semibold">
                      <span>Current subtotal</span>
                      <span><PriceText amountCny={subtotal} /></span>
                    </div>
                  </div>
                  <Link href="/checkout" className="mt-6 flex min-h-14 w-full items-center justify-center bg-[#26352c] px-5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1e2520]">
                    {t("cart.proceedToCheckout")}
                  </Link>
                  <p className="mt-4 text-center text-xs leading-5 text-stone-500">Secure checkout through the current YiiArt payment flow.</p>
                  <p className="mt-2 text-center text-xs leading-5 text-stone-500"><PriceDisclosure /></p>
                  <div className="mt-6 border-t border-black/10 pt-5">
                    <ReviewTrustBadge />
                    <Link href="/reviews" className="mt-3 block text-center text-sm underline underline-offset-4">Read verified collector reviews</Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
