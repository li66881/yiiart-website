import { productDetailNavigationItems } from "@/lib/storefront/product-detail-navigation"
import styles from "./storefront.module.css"

export default function ProductDetailNavigation() {
  return (
    <nav className={styles.productDetailNavigation} aria-label="Product information">
      <div className={styles.productDetailNavigationTrack}>
        {productDetailNavigationItems.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
