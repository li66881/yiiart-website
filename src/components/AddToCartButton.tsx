"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import type { CartItemInput, CartProductionModel } from "@/lib/cart/cart"
import { useCurrency } from "@/context/CurrencyContext"
import { useLanguage } from "@/context/LanguageContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount } from "@/lib/pricing"

type AddToCartButtonProps = {
  item: Omit<CartItemInput, "quantity" | "productionModel"> & {
    productionModel?: CartProductionModel
  }
}

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { currency } = useCurrency()
  const { t } = useLanguage()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem({
      ...item,
      productionModel: item.productionModel || "original",
      quantity: 1,
    })
    trackMarketingEvent("AddToCart", {
      content_ids: item.id,
      content_name: item.title,
      content_type: "product",
      currency,
      value: convertCnyToStoreAmount(item.price, currency),
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex min-h-14 w-full items-center justify-center rounded-[3.75rem] border-2 border-[#171717] bg-[#171717] px-6 text-[15px] font-normal text-white transition hover:bg-black"
    >
      {added ? t("cart.addedToCart") : t("artwork.addToCart")}
    </button>
  )
}
