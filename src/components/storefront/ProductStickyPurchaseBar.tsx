"use client"

import { useEffect, useState } from "react"
import { PriceText } from "@/components/PriceText"
import type { StorefrontProduct } from "@/lib/storefront/product"
import type { getProductSelection } from "@/lib/storefront/selection"
import {
  applyStickyPurchaseBodyState,
  clearStickyPurchaseBodyState,
  shouldShowStickyPurchase,
} from "@/lib/storefront/sticky-purchase"
import styles from "./storefront.module.css"

type ProductSelection = ReturnType<typeof getProductSelection>

type Props = {
  product: StorefrontProduct
  selection: ProductSelection
  quantity: number
  actionVisible: boolean
  onAdd: () => void
}

export function ProductStickyPurchaseBar({
  product,
  selection,
  quantity,
  actionVisible,
  onAdd,
}: Props) {
  const [footerVisible, setFooterVisible] = useState(false)

  useEffect(() => {
    const footer = document.querySelector("footer")
    if (!footer || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting)
    })
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const visible = shouldShowStickyPurchase({
    hasSelection: Boolean(selection),
    actionVisible,
    footerVisible,
  })

  useEffect(() => {
    if (!visible) {
      clearStickyPurchaseBodyState(document.body)
      return
    }

    return applyStickyPurchaseBodyState(document.body)
  }, [visible])

  if (!visible || !selection) return null

  const image = product.images[0]

  return (
    <aside className={styles.stickyPurchaseShell} aria-label="Selected artwork purchase">
      <div className={styles.stickyPurchaseBar}>
        <div className={styles.stickyProductIdentity}>
          {image ? <img src={image.src} alt="" /> : null}
          <strong>{product.title}</strong>
        </div>
        <div className={styles.stickySelectionSummary}>
          <span>{selection.size.label} · {selection.finish.label}</span>
          <strong><PriceText amountCny={selection.priceCny * quantity} /></strong>
        </div>
        <button type="button" onClick={onAdd}>Add to Cart</button>
      </div>
    </aside>
  )
}
