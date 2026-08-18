"use client"

import Link from "next/link"
import { Heart, LockKey, Package, PaintBrush, ShieldCheck } from "@phosphor-icons/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import ReviewStars from "@/components/ReviewStars"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useWishlist } from "@/context/WishlistContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount } from "@/lib/pricing"
import type { StorefrontProduct, StorefrontSize } from "@/lib/storefront/product"
import { bindPurchaseAction, purchaseTrustLabel } from "@/lib/storefront/purchase-action"
import { getProductSelection } from "@/lib/storefront/selection"
import ProductDescription from "./ProductDescription"
import { ProductFinishSelector } from "./ProductFinishSelector"
import { ProductStickyPurchaseBar } from "./ProductStickyPurchaseBar"
import styles from "./storefront.module.css"

type Props = {
  product: StorefrontProduct
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
  reviewRating?: number
  reviewCount?: number
}

function estimateArrivalWindow() {
  const start = new Date()
  start.setDate(start.getDate() + 12)
  const end = new Date()
  end.setDate(end.getDate() + 20)
  const fmt = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${fmt(start)}–${fmt(end)}`
}

function inchPart(cm: number) {
  const inches = Math.round((cm / 2.54) * 10) / 10
  return Number.isInteger(inches) ? String(inches) : inches.toFixed(1)
}

function sizeSelectLabel(size: StorefrontSize) {
  if (size.widthCm && size.heightCm) {
    return `${inchPart(size.heightCm)}''x ${inchPart(size.widthCm)}''/ ${Math.round(size.heightCm)}x ${Math.round(size.widthCm)} CM`
  }
  return size.label
}

export default function ProductPurchasePanel({
  product,
  directCheckoutAvailable,
  invoiceUrl,
  whatsappUrl,
  reviewRating = 0,
  reviewCount = 0,
}: Props) {
  const initialSize = product.sizes[0]?.id || ""
  const initialFinish = product.finishes[0]?.id || ""
  const [sizeId, setSizeId] = useState(initialSize)
  const [finishId, setFinishId] = useState(initialFinish)
  const [quantity, setQuantity] = useState(1)
  const [confirmation, setConfirmation] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [shareStatus, setShareStatus] = useState("")
  const [mainActionPassed, setMainActionPassed] = useState(false)
  const mainActionCleanupRef = useRef<() => void>(() => undefined)
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
  const arrivalWindow = useMemo(() => estimateArrivalWindow(), [])

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  const mainActionRef = useCallback((action: HTMLDivElement | null) => {
    mainActionCleanupRef.current()

    if (!action) {
      mainActionCleanupRef.current = () => undefined
      return
    }

    const updateMainActionPosition = () => {
      const rect = action.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const isIntersecting = rect.bottom > 0 && rect.top < viewportHeight
      setMainActionPassed((wasPassed) => {
        if (rect.bottom <= 0) return true
        if (isIntersecting) return false
        return wasPassed
      })
    }

    updateMainActionPosition()
    window.addEventListener("scroll", updateMainActionPosition, { passive: true })
    window.addEventListener("resize", updateMainActionPosition)
    mainActionCleanupRef.current = () => {
      window.removeEventListener("scroll", updateMainActionPosition)
      window.removeEventListener("resize", updateMainActionPosition)
    }
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
  const purchaseAction = bindPurchaseAction(addSelection)

  const copyShareLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareStatus("Link copied")
    } catch {
      setShareStatus("Copy the URL from the address bar")
    }
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
        <button
          type="button"
          onClick={toggleSaved}
          className={styles.saveButton}
          aria-pressed={saved}
          aria-label={saved ? "Saved" : "Save artwork"}
        >
          <Heart size={18} weight={saved ? "fill" : "regular"} aria-hidden="true" />
        </button>
      </div>

      <h1 id="product-title">{product.title}</h1>
      <p className={styles.artist}>By {product.artistName}</p>
      {reviewCount > 0 ? (
        <a className={styles.reviewSummaryLink} href="#reviews">
          <ReviewStars rating={reviewRating} size="sm" />
          <span>
            {reviewRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </a>
      ) : null}

      <div className={styles.priceBlock}>
        <p className={styles.price}><PriceText amountCny={selection?.priceCny} /></p>
        <p className={styles.disclosure}><PriceDisclosure /></p>
      </div>

      {product.sizes.length > 0 && (
        <fieldset className={styles.options}>
          <legend>Size</legend>
          <select
            className={styles.sizeSelect}
            aria-label="Size"
            value={selection?.size.id || sizeId}
            onChange={(event) => setSizeId(event.target.value)}
          >
            {product.sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {sizeSelectLabel(size)}
              </option>
            ))}
          </select>
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

      <p className={styles.arrivalLine}>
        <span aria-hidden>✓</span> Arrives soon! Get it by <strong>{arrivalWindow}</strong> if you order today.
      </p>
      {madeToOrder ? (
        <p className={styles.creationNote}>{product.creationWindow}</p>
      ) : (
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
          <button className={styles.primaryAction} type="button" onClick={purchaseAction.main}>
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
          Need help with size?
        </Link>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Ask about this piece
        </a>
      </div>

      <ul className={styles.purchaseTrust} aria-label="Purchase support">
        <li>
          <LockKey aria-hidden="true" size={18} />
          <span>
            <strong>Secure payment</strong>
            <span>Protected checkout</span>
          </span>
        </li>
        <li>
          <PaintBrush aria-hidden="true" size={18} />
          <span>
            <strong>{purchaseTrustLabel(madeToOrder)}</strong>
            <span>Each piece is made just for you</span>
          </span>
        </li>
        <li>
          <Package aria-hidden="true" size={18} />
          <span>
            <strong>Careful packing</strong>
            <span>Insured express worldwide</span>
          </span>
        </li>
        <li>
          <ShieldCheck aria-hidden="true" size={18} />
          <span>
            <strong>Damage support</strong>
            <span>Help if the artwork arrives damaged</span>
          </span>
        </li>
      </ul>

      <div className={styles.shareRow}>
        <span className={styles.shareLabel}>Share</span>
        <button type="button" onClick={copyShareLink}>Copy link</button>
        <a
          href={shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          href={shareUrl ? `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(image?.src || "")}&description=${encodeURIComponent(product.title)}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          Pinterest
        </a>
        {shareStatus ? <span className={styles.shareStatus}>{shareStatus}</span> : null}
      </div>

      <div className={styles.artAdvisory}>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Need help? Ask the studio</a>
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

      <ProductDescription description={product.shortDescription} />

      <p className={styles.confirmation} role="status" aria-live="polite">{confirmation}</p>

      {directCheckoutAvailable && (
        <ProductStickyPurchaseBar
          product={product}
          selection={selection}
          quantity={quantity}
          mainActionPassed={mainActionPassed}
          onAdd={purchaseAction.sticky}
        />
      )}
    </section>
  )
}
