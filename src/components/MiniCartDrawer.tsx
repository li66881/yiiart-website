"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { PriceText } from "@/components/PriceText"
import { useCart } from "@/context/CartContext"

export default function MiniCartDrawer() {
  const { items, itemCount, subtotal, cartOpen, closeCart, removeItem } = useCart()

  useEffect(() => {
    if (!cartOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [cartOpen, closeCart])

  if (!cartOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" className="absolute inset-0 bg-[#171717]/40" aria-label="Close cart" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-[min(100%,400px)] flex-col bg-white text-[#171717]" aria-label="Shopping bag">
        <div className="flex h-14 items-center justify-between border-b border-[#e5e5e5] px-5">
          <h2 className="text-[15px] font-medium">Bag ({itemCount})</h2>
          <button type="button" className="text-sm text-[#a4a4a4] hover:text-black" onClick={closeCart}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-sm text-[#a4a4a4]">Your bag is empty.</p>
          ) : (
            <ul className="grid gap-5">
              {items.map((item) => (
                <li key={item.key} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f4f0]">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{item.title}</p>
                    <p className="mt-1 text-[12px] text-[#a4a4a4]">
                      {[item.sizeLabel, item.finishLabel].filter(Boolean).join(" / ") || item.artist}
                    </p>
                    <p className="mt-1 text-[13px]">
                      Qty {item.quantity} · <PriceText amountCny={item.price * item.quantity} />
                    </p>
                    <button type="button" className="mt-2 text-[12px] underline underline-offset-2" onClick={() => removeItem(item.key)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-[#e5e5e5] px-5 py-4">
          {items.length > 0 ? (
            <>
              <p className="mb-3 flex justify-between text-[14px]">
                <span>Subtotal</span>
                <strong className="font-medium"><PriceText amountCny={subtotal} /></strong>
              </p>
              <Link href="/checkout" className="yii-btn-primary w-full" onClick={closeCart}>
                Checkout
              </Link>
              <Link href="/cart" className="mt-2 block text-center text-[13px] underline underline-offset-4" onClick={closeCart}>
                View bag
              </Link>
            </>
          ) : (
            <Link href="/artworks" className="yii-btn-primary w-full" onClick={closeCart}>
              Shop all art
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}
