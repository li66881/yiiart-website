"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { PriceText } from "@/components/PriceText"
import styles from "./storefront.module.css"

export type ProductCardItem = {
  id: string
  href: string
  title: string
  priceCny?: number | null
  image?: string | null
  hoverImage?: string | null
  sku?: string | null
  badge?: string | null
}

type Props = {
  item: ProductCardItem
}

export default function ProductCard({ item }: Props) {
  const [hovered, setHovered] = useState(false)
  const showHover = Boolean(item.hoverImage && hovered)

  return (
    <article
      className={styles.productCard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={item.href} className={styles.productCardLink}>
        <div className={styles.productCardMedia}>
          {item.image ? (
            <>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 22vw, 50vw"
                className={`${styles.productCardImage} ${showHover ? styles.productCardImageDim : ""}`}
              />
              {item.hoverImage ? (
                <Image
                  src={item.hoverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, 50vw"
                  className={`${styles.productCardImage} ${styles.productCardImageHover} ${
                    showHover ? styles.productCardImageHoverVisible : ""
                  }`}
                />
              ) : null}
            </>
          ) : (
            <div className={styles.productCardEmpty}>Image on request</div>
          )}
          {item.badge ? (
            <span
              className={styles.productCardBadge}
              data-accent={/off|sale/i.test(item.badge) ? "sale" : undefined}
            >
              {item.badge}
            </span>
          ) : null}
          <span className={`${styles.chooseOptions} ${hovered ? styles.chooseOptionsVisible : ""}`}>
            Choose options
          </span>
        </div>
        <div className={styles.productCardMeta}>
          <h3 className={styles.productCardTitle}>
            {item.title}
            {item.sku ? <span className={styles.productCardSku}> #{item.sku}</span> : null}
          </h3>
          <p className={styles.productCardPrice}>
            {item.priceCny ? (
              <>
                From <PriceText amountCny={item.priceCny} />
              </>
            ) : (
              <PriceText amountCny={item.priceCny} />
            )}
          </p>
        </div>
      </Link>
    </article>
  )
}
