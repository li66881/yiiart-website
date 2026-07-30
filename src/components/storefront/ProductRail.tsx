import Link from "next/link"
import ProductCard, { type ProductCardItem } from "@/components/storefront/ProductCard"
import styles from "./storefront.module.css"

type Props = {
  title: string
  subtitle?: string
  items: ProductCardItem[]
  viewAllHref?: string
  viewAllLabel?: string
}

export default function ProductRail({
  title,
  subtitle,
  items,
  viewAllHref = "/artworks",
  viewAllLabel = "View all",
}: Props) {
  if (!items.length) return null

  return (
    <section className={styles.productRail}>
      <div className={styles.productRailHeader}>
        <div>
          <h2 className={styles.productRailTitle}>{title}</h2>
          {subtitle ? <p className={styles.productRailSubtitle}>{subtitle}</p> : null}
        </div>
        <Link href={viewAllHref} className={styles.productRailLink}>
          {viewAllLabel}
        </Link>
      </div>
      <div className={styles.productRailTrack}>
        {items.map((item) => (
          <div key={item.id} className={styles.productRailItem}>
            <ProductCard item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}
