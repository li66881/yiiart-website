"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useWishlist } from "@/context/WishlistContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount } from "@/lib/pricing"
import type { StorefrontProduct } from "@/lib/storefront/product"
import { getProductSelection } from "@/lib/storefront/selection"
import styles from "./storefront.module.css"

type Props = {
  product: StorefrontProduct
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
}

export default function ProductPurchasePanel({
  product,
  directCheckoutAvailable,
  invoiceUrl,
  whatsappUrl,
}: Props) {
  const initialSize = product.sizes[0]?.id || ""
  const initialFinish = product.finishes[0]?.id || ""
  const [sizeId, setSizeId] = useState(initialSize)
  const [finishId, setFinishId] = useState(initialFinish)
  const [confirmation, setConfirmation] = useState("")
  const selection = useMemo(
    () => getProductSelection(product, sizeId, finishId),
    [finishId, product, sizeId],
  )
  const { addItem } = useCart()
  const { currency } = useCurrency()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const image = product.images[0]
  const saved = isInWishlist(product.id)

  const addSelection = () => {
    if (!selection || !image || !directCheckoutAvailable) return

    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      artist: product.artistName,
      price: selection.priceCny,
      image: image.src,
      quantity: 1,
      productionModel: product.productionModel,
      sizeId: selection.size.id,
      sizeLabel: selection.size.label,
      finishId: selection.finish.id,
      finishLabel: selection.finish.label,
    })
    trackMarketingEvent("AddToCart", {
      content_ids: product.id,
      content_name: product.title,
      content_type: "product",
      currency,
      value: convertCnyToStoreAmount(selection.priceCny, currency),
      size: selection.size.id,
      finish: selection.finish.id,
    })
    setConfirmation(`${product.title} was added to your cart.`)
  }

  const toggleSaved = () => {
    if (!selection || !image) return
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      title: product.title,
      artist: product.artistName,
      price: selection.priceCny,
      image: image.src,
    })
  }

  return (
    <section className={styles.purchasePanel} aria-labelledby="product-title">
      <div className={styles.kickerRow}>
        <p className={styles.eyebrow}>
          {product.productionModel === "hand_painted_to_order"
            ? "Hand-Painted to Order"
            : "Artist Collection"}
        </p>
        <button type="button" onClick={toggleSaved} className={styles.saveButton} aria-pressed={saved}>
          {saved ? "Saved" : "Save artwork"}
        </button>
      </div>

      <h1 id="product-title">{product.title}</h1>
      <p className={styles.artist}>By {product.artistName}</p>
      <p className={styles.description}>{product.shortDescription}</p>

      <div className={styles.priceBlock}>
        <p className={styles.price}><PriceText amountCny={selection?.priceCny} /></p>
        <p className={styles.disclosure}><PriceDisclosure /></p>
      </div>

      {product.sizes.length > 0 && (
        <fieldset className={styles.options}>
          <legend>Select a size</legend>
          <div className={styles.choiceGrid}>
            {product.sizes.map((size) => (
              <label key={size.id} className={styles.choice}>
                <input
                  type="radio"
                  name="product-size"
                  checked={selection?.size.id === size.id}
                  onChange={() => setSizeId(size.id)}
                />
                <span>{size.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.finishes.length > 0 && (
        <fieldset className={styles.options}>
          <legend>Select a finish</legend>
          <div className={styles.choiceGrid}>
            {product.finishes.map((finish) => (
              <label key={finish.id} className={styles.choice}>
                <input
                  type="radio"
                  name="product-finish"
                  checked={selection?.finish.id === finish.id}
                  onChange={() => setFinishId(finish.id)}
                />
                <span>{finish.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.creation}>
        <strong>{product.productionModel === "hand_painted_to_order" ? "Creation window" : "Availability"}</strong>
        <span>{product.creationWindow}</span>
      </div>

      {directCheckoutAvailable && selection ? (
        <button className={styles.primaryAction} type="button" onClick={addSelection}>
          Add to Cart
        </button>
      ) : (
        <a className={styles.primaryAction} href={invoiceUrl} target="_blank" rel="noopener noreferrer">
          Request invoice
        </a>
      )}

      <div className={styles.secondaryActions}>
        <Link href={`/custom-painting?artwork=${encodeURIComponent(product.slug)}`}>
          Request custom size or color
        </Link>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Ask a question
        </a>
      </div>

      <p className={styles.variation}>
        Each painting is created by hand. Natural variations in brushwork and color make every finished work unique.
      </p>
      <p className={styles.confirmation} role="status" aria-live="polite">{confirmation}</p>

      {directCheckoutAvailable && selection && (
        <div className={styles.mobilePurchaseBar}>
          <span>
            Selected price
            <strong><PriceText amountCny={selection.priceCny} /></strong>
          </span>
          <button type="button" onClick={addSelection}>Add to Cart</button>
        </div>
      )}
    </section>
  )
}
