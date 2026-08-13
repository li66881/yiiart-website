"use client"

import Link from "next/link"
import { LockKey, Package, PaintBrush, ShieldCheck } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useWishlist } from "@/context/WishlistContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount } from "@/lib/pricing"
import type { StorefrontProduct } from "@/lib/storefront/product"
import { getProductSelection } from "@/lib/storefront/selection"
import { mainActionBlocksSticky } from "@/lib/storefront/sticky-purchase"
import { ProductFinishSelector } from "./ProductFinishSelector"
import { ProductStickyPurchaseBar } from "./ProductStickyPurchaseBar"
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
  const [quantity, setQuantity] = useState(1)
  const [confirmation, setConfirmation] = useState("")
  const [mainActionVisible, setMainActionVisible] = useState(true)
  const mainActionRef = useRef<HTMLDivElement>(null)
  const selection = useMemo(
    () => getProductSelection(product, sizeId, finishId),
    [finishId, product, sizeId],
  )
  const { addItem } = useCart()
  const { currency } = useCurrency()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const image = product.images[0]
  const saved = isInWishlist(product.id)
  const madeToOrder = product.productionModel === "hand_painted_to_order"

  useEffect(() => {
    const action = mainActionRef.current
    if (!action || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(([entry]) => {
      setMainActionVisible(mainActionBlocksSticky({
        isIntersecting: entry.isIntersecting,
        top: entry.boundingClientRect.top,
      }))
    })
    observer.observe(action)
    return () => observer.disconnect()
  }, [])

  const addSelection = () => {
    if (!selection || !image || !directCheckoutAvailable) return

    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      artist: product.artistName,
      price: selection.priceCny,
      image: image.src,
      quantity,
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
      value: convertCnyToStoreAmount(selection.priceCny * quantity, currency),
      quantity,
      size: selection.size.id,
      finish: selection.finish.id,
    })
    setConfirmation(`${quantity} x ${product.title} was added to your cart.`)
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
    <section className={`${styles.purchasePanel} optimized-purchase-panel meson-purchase-stack`} aria-labelledby="product-title">
      <div className={styles.kickerRow}>
        <p className={styles.eyebrow}>
          {madeToOrder
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
            {product.sizes.map((size, index) => (
              <label key={size.id} className={styles.choice}>
                <input
                  type="radio"
                  name="product-size"
                  checked={selection?.size.id === size.id}
                  onChange={() => setSizeId(size.id)}
                />
                <span>
                  {size.label}
                  {index === 0 && product.sizes.length > 1 ? <em className={styles.popularBadge}>Popular</em> : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.finishes.length > 0 && (
        <ProductFinishSelector
          finishes={product.finishes}
          rolledPriceCny={selection?.size.priceCny ?? product.sizes[0]?.priceCny ?? 0}
          selectedId={selection?.finish.id ?? finishId}
          onChange={setFinishId}
        />
      )}

      <div className={styles.creation}>
        <strong>{madeToOrder ? "Creation window" : "Availability"}</strong>
        <span>{product.creationWindow}</span>
      </div>

      {!madeToOrder && (
        <p className={styles.originalQuantity}>Original artwork quantity is fixed at one.</p>
      )}

      <div className={styles.purchaseActionRow} ref={mainActionRef}>
        {madeToOrder && (
          <div className={styles.quantityPicker}>
            <strong>Quantity</strong>
            <div className={styles.quantityControl} aria-label="Artwork quantity">
              <button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" aria-label="Increase quantity" disabled={quantity === 10} onClick={() => setQuantity((current) => Math.min(10, current + 1))}>+</button>
            </div>
          </div>
        )}

        {directCheckoutAvailable && selection ? (
          <button className={styles.primaryAction} type="button" onClick={addSelection}>
            Add to Cart — <PriceText amountCny={selection.priceCny * quantity} />
          </button>
        ) : (
          <a className={styles.primaryAction} href={invoiceUrl} target="_blank" rel="noopener noreferrer">
            Request invoice
          </a>
        )}
      </div>

      <div className={styles.secondaryActions}>
        <Link href={`/custom-painting?artwork=${encodeURIComponent(product.slug)}`}>
          Request custom size or color
        </Link>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Ask an art advisor
        </a>
      </div>

      <div className={styles.purchaseTrust} aria-label="Purchase support">
        <span><LockKey aria-hidden="true" size={18} />Secure payment</span>
        <span><PaintBrush aria-hidden="true" size={18} />Hand-painted to order</span>
        <span><Package aria-hidden="true" size={18} />Careful packing</span>
        <span><ShieldCheck aria-hidden="true" size={18} />Damage support</span>
      </div>

      <div className={styles.artAdvisory}>
        <strong>Complimentary art advisory</strong>
        <p>Send a room photo and wall measurement. The studio will help confirm scale before you order.</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
      </div>

      <div className={styles.purchaseDetails}>
        <details>
          <summary>Hand-painted finish <span>+</span></summary>
          <p>{madeToOrder ? "The composition and palette follow the listing, with natural variation in brushwork and small details." : "This listing is for the physical artwork shown, subject to the stated availability."}</p>
        </details>
        <details>
          <summary>Size and delivery planning <span>+</span></summary>
          <p>Delivery format and timing depend on the selected size, finish, destination, and carrier route.</p>
        </details>
      </div>

      <p className={styles.confirmation} role="status" aria-live="polite">{confirmation}</p>

      {directCheckoutAvailable && (
        <ProductStickyPurchaseBar
          product={product}
          selection={selection}
          quantity={quantity}
          actionVisible={mainActionVisible}
          onAdd={addSelection}
        />
      )}
    </section>
  )
}
