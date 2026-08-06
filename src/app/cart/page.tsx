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
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-[#181613]">
      <Header />

      <main className="flex-1 pb-20 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Shopping cart</p>
          <h1 className="mb-10 text-4xl font-medium tracking-[-0.03em] md:text-5xl">{t("cart.title")}</h1>

          {items.length === 0 ? (
            <div className="border-y border-stone-200 py-20 text-center">
              <p className="mb-6 text-stone-500">{t("cart.empty")}</p>
              <Link
                href="/artworks?sort=featured"
                className="inline-flex min-h-12 items-center rounded-full bg-[#111] px-8 text-sm font-semibold tracking-[0.04em] text-white transition hover:bg-[#2a2a2a]"
              >
                {t("cart.continueShopping")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
              <div className="border-t border-stone-200">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-5 border-b border-stone-200 py-6">
                    <Link href={item.slug ? `/artwork/${item.slug}` : "/artworks"} className="relative h-32 w-28 shrink-0 overflow-hidden bg-[#ebe6dc]">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="112px" className="object-cover" />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-medium">
                            <Link href={item.slug ? `/artwork/${item.slug}` : "/artworks"} className="hover:underline">
                              {item.title}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-stone-500">{item.artist}</p>
                          {item.sizeLabel ? <p className="mt-1 text-sm text-stone-500">Size: {item.sizeLabel}</p> : null}
                          {item.finishLabel ? <p className="text-sm text-stone-500">Finish: {item.finishLabel}</p> : null}
                          <p className="mt-2 text-xs uppercase tracking-[0.08em] text-stone-500">
                            {item.productionModel === "hand_painted_to_order" || item.sizeId
                              ? "Hand-painted to order"
                              : "One original artwork"}
                          </p>
                        </div>
                        <p className="font-medium">
                          <PriceText amountCny={item.price} />
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          {(item.productionModel === "hand_painted_to_order" || item.sizeId) ? (
                            <div className="inline-flex items-center gap-1 border border-stone-300 bg-white px-1">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                className="grid h-9 w-9 place-items-center text-lg"
                                onClick={() => updateQuantity(item.key, Math.max(1, item.quantity - 1))}
                              >
                                -
                              </button>
                              <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                className="grid h-9 w-9 place-items-center text-lg"
                                onClick={() => updateQuantity(item.key, Math.min(99, item.quantity + 1))}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-stone-500">Qty 1</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="text-sm text-stone-500 underline underline-offset-4 hover:text-black"
                          >
                            {t("cart.remove")}
                          </button>
                        </div>
                        <p className="font-medium">
                          <PriceText amountCny={item.price * item.quantity} />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside>
                <div className="sticky top-[calc(var(--ya-header-offset-lg)+0.75rem)] border border-stone-200 bg-white p-6 md:p-7">
                  <h2 className="text-lg font-medium">{t("cart.orderSummary") || "Order Summary"}</h2>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">
                        {t("cart.subtotal")} ({itemCount} items)
                      </span>
                      <span>
                        <PriceText amountCny={subtotal} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{t("cart.shipping")}</span>
                      <span className="font-medium text-[#2f5d46]">{t("cart.free")}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-medium">
                      <span>{t("cart.total")}</span>
                      <span>
                        <PriceText amountCny={subtotal} />
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-[#111] text-sm font-semibold tracking-[0.04em] text-white transition hover:bg-[#2a2a2a]"
                  >
                    {t("cart.proceedToCheckout")}
                  </Link>
                  <p className="mt-4 text-center text-xs leading-5 text-stone-500">
                    Free worldwide shipping · Secure PayPal checkout
                  </p>
                  <p className="mt-2 text-center text-xs text-stone-500">
                    <PriceDisclosure />
                  </p>
                  <div className="mt-5 border-t border-stone-200 pt-5">
                    <ReviewTrustBadge />
                    <Link href="/reviews" className="mt-3 block text-center text-sm underline underline-offset-4">
                      Read verified collector reviews
                    </Link>
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
