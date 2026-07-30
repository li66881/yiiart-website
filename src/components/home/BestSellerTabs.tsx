"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import ProductCard, { type ProductCardItem } from "@/components/storefront/ProductCard"
import { PriceDisclosure } from "@/components/PriceText"
import styles from "./editorial-home.module.css"

export type BestSellerTab = {
  id: string
  label: string
  href: string
  items: ProductCardItem[]
}

type Props = {
  tabs: BestSellerTab[]
}

export default function BestSellerTabs({ tabs }: Props) {
  const available = useMemo(() => tabs.filter((tab) => tab.items.length > 0), [tabs])
  const [activeId, setActiveId] = useState(available[0]?.id || "")
  const active = available.find((tab) => tab.id === activeId) || available[0]

  if (!active) {
    return <div className={styles.emptyState}>Explore the current collection or contact the studio for a custom canvas.</div>
  }

  return (
    <div>
      <div className={styles.bestSellerTabs} role="tablist" aria-label="Best seller styles">
        {available.map((tab) => {
          const selected = tab.id === active.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`${styles.bestSellerTab} ${selected ? styles.bestSellerTabActive : ""}`}
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
        <Link href={active.href} className={styles.bestSellerViewAll}>
          View all
        </Link>
      </div>

      <div className={styles.productRailScroll} role="tabpanel">
        {active.items.map((item) => (
          <div key={item.id} className={styles.productRailCard}>
            <ProductCard item={item} />
          </div>
        ))}
      </div>
      <p className={styles.priceDisclosure}>
        <PriceDisclosure />
      </p>
    </div>
  )
}
