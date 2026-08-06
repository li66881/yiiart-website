"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import ReviewStars from "@/components/ReviewStars"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useWishlist } from "@/context/WishlistContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount, formatStorePrice } from "@/lib/pricing"
import type { StorefrontProduct } from "@/lib/storefront/product"
import { formatSaleCountdown, resolveCompareAtCny, saleOffPercent } from "@/lib/storefront/sale"
import { getProductSelection } from "@/lib/storefront/selection"
import styles from "./storefront.module.css"

type Props = {
  product: StorefrontProduct
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
  saleEndsAt?: string | null
  reviewRating?: number
  reviewCount?: number
}

const TRUST_ICONS = [
  { title: "Ship when you're happy", icon: "◎" },
  { title: "Free shipping on all orders", icon: "▣" },
  { title: "30-day easy returns", icon: "↺" },
  { title: "Safe payment options", icon: "✦" },
] as const

function socialProofForProduct(productId: string) {
  let hash = 0
  for (let i = 0; i < productId.length; i += 1) {
    hash = (hash * 31 + productId.charCodeAt(i)) >>> 0
  }
  return {
    soldCount: 2 + (hash % 6),
    hours: 24 + (hash % 3) * 12,
    saves: 18 + (hash % 40),
    inCarts: 8 + (hash % 28),
  }
}

function estimateArrivalWindow() {
  const start = new Date()
  start.setDate(start.getDate() + 12)
  const end = new Date()
  end.setDate(end.getDate() + 20)
  const fmt = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${fmt(start)}-${fmt(end)}`
}

function finishIconKey(id: string, label: string) {
  const value = `${id} ${label}`.toLowerCase()
  if (value.includes("rolled")) return "rolled"
  if (value.includes("frameless") || value.includes("gallery")) return "frameless"
  if (value.includes("wood") || value.includes("oak") || value.includes("natural")) return "wood"
  if (value.includes("white")) return "white"
  if (value.includes("black")) return "black"
  return "frameless"
}

function finishSectionLabel(label: string) {
  const key = finishIconKey("", label)
  if (key === "rolled" || key === "frameless") return "Finish"
  return "Floating Frame"
}

export default function ProductPurchasePanel({
  product,
  directCheckoutAvailable,
  invoiceUrl,
  whatsappUrl,
  saleEndsAt = null,
  reviewRating = 0,
  reviewCount = 0,
}: Props) {
  const router = useRouter()
  const buyActionsRef = useRef<HTMLDivElement>(null)
  const initialSize = product.sizes[0]?.id || ""
  const initialFinish = product.finishes[0]?.id || ""
  const [sizeId, setSizeId] = useState(initialSize)
  const [finishId, setFinishId] = useState(initialFinish)
  const [quantity, setQuantity] = useState(1)
  const [confirmation, setConfirmation] = useState("")
  const [shareStatus, setShareStatus] = useState("")
  const [stickyVisible, setStickyVisible] = useState(false)
  const [saleCountdown, setSaleCountdown] = useState<string | null>(
    saleEndsAt ? formatSaleCountdown(saleEndsAt) : null,
  )
  const arrivalWindow = useMemo(() => estimateArrivalWindow(), [])
  const socialProof = useMemo(() => socialProofForProduct(product.id), [product.id])
  const selection = useMemo(
    () => getProductSelection(product, sizeId, finishId),
    [finishId, product, sizeId],
  )
  const { addItem } = useCart()
  const { currency } = useCurrency()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const image = product.images[0]
  const saved = isInWishlist(product.id)
  const saleActive =
    Boolean(saleEndsAt) && new Date(saleEndsAt as string).getTime() > Date.now()
  const lineQty = Math.max(1, quantity)
  const unitPriceCny = selection?.priceCny || 0
  const compareAtCny = resolveCompareAtCny(unitPriceCny, product.compareAtPriceCny, saleActive)
  const linePriceCny = unitPriceCny * lineQty
  const offPercent = compareAtCny ? saleOffPercent(unitPriceCny, compareAtCny) : null
  const installmentHint = selection
    ? formatStorePrice(selection.priceCny / 4, currency)
    : null

  useEffect(() => {
    if (!saleEndsAt) {
      setSaleCountdown(null)
      return
    }
    const tick = () => {
      setSaleCountdown(formatSaleCountdown(saleEndsAt))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [saleEndsAt])

  useEffect(() => {
    const target = buyActionsRef.current
    if (!target || !directCheckoutAvailable) {
      setStickyVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyVisible(!entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-72px 0px 0px 0px",
      },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [directCheckoutAvailable, selection?.size.id, selection?.finish.id])

  const addSelection = () => {
    if (!selection || !image || !directCheckoutAvailable) return false

    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      artist: product.artistName,
      price: selection.priceCny,
      image: image.src,
      quantity: lineQty,
      productionModel: product.sizes.length > 0 ? "hand_painted_to_order" : product.productionModel,
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
      value: convertCnyToStoreAmount(linePriceCny, currency),
      size: selection.size.id,
      finish: selection.finish.id,
    })
    setConfirmation(`${product.title} was added to your cart.`)
    return true
  }

  const buyNow = () => {
    if (!addSelection()) return
    router.push("/checkout")
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

  const shareUrl = `https://www.yiiart.com/artwork/${product.slug}`

  const copyShareLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : shareUrl
    try {
      await navigator.clipboard.writeText(url)
      setShareStatus("Link copied")
    } catch {
      setShareStatus("Copy failed")
    }
    window.setTimeout(() => setShareStatus(""), 2000)
  }

  const styleKicker = product.styleTags.filter(Boolean).slice(0, 2).join(" · ") || "Hand-painted canvas"

  return (
    <section className={styles.purchasePanel} aria-labelledby="product-title">
      <div className={styles.kickerRow}>
        <p className={styles.collectionKicker}>{styleKicker}</p>
        <button type="button" onClick={toggleSaved} className={styles.saveButton} aria-pressed={saved}>
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <p className={styles.socialProofMeta}>
        <strong>{socialProof.saves}</strong> people saved this ·{" "}
        <strong>{socialProof.inCarts}</strong> in carts
      </p>

      <h1 id="product-title" className={styles.productTitle}>
        {product.title}
        {product.sku ? <span className={styles.productSku}> #{product.sku}</span> : null}
      </h1>

      {reviewCount > 0 ? (
        <a className={styles.reviewSummaryLink} href="#artwork-reviews">
          <ReviewStars rating={reviewRating} size="sm" />
          <span>
            {reviewRating.toFixed(1)} · {reviewCount}{" "}
            {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </a>
      ) : null}

      <p className={styles.socialProof}>
        {socialProof.soldCount} sold in last {socialProof.hours} hours
      </p>

      <div className={styles.priceBlock}>
        <p className={styles.priceRow}>
          {saleActive ? (
            <span className={styles.saleBadge}>{offPercent ? `${offPercent}% OFF` : "SALE"}</span>
          ) : null}
          <span className={styles.price}>
            <PriceText amountCny={unitPriceCny || undefined} />
          </span>
          {compareAtCny ? (
            <span className={styles.compareAt}>
              <PriceText amountCny={compareAtCny} />
            </span>
          ) : null}
        </p>
        <p className={styles.shippingNote}>Shipping and tariffs included for international delivery*</p>
        <p className={styles.disclosure}>
          <PriceDisclosure />
        </p>
      </div>

      {installmentHint ? (
        <div className={styles.installmentBox}>
          <span className={styles.installmentBrand} aria-hidden>
            Pay later
          </span>
          <p>
            From <strong>{installmentHint}</strong>/mo · 4 interest-free payments available at checkout.
          </p>
        </div>
      ) : null}

      {saleActive && saleCountdown ? (
        <p className={styles.saleCue}>
          Hurry up! Sale ends in <strong>{saleCountdown}</strong>
        </p>
      ) : null}

      <p className={styles.multiBuyCue}>Free worldwide shipping · Hand-painted to order</p>

      {product.sizes.length > 0 && (
        <div className={styles.optionBlock}>
          <p className={styles.optionLabel}>
            Canvas Size: <strong>{selection?.size.label || "Select a size"}</strong>
          </p>
          <div className={styles.sizeChips} role="radiogroup" aria-label="Canvas sizes">
            {product.sizes.map((size) => {
              const active = selection?.size.id === size.id
              return (
                <label key={size.id} className={styles.sizeChip} data-active={active} title={size.label}>
                  <input
                    type="radio"
                    name="product-size"
                    checked={active}
                    onChange={() => setSizeId(size.id)}
                  />
                  <span>{size.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {product.finishes.length > 0 && (
        <div className={styles.optionBlock}>
          <p className={styles.optionLabel}>
            {finishSectionLabel(selection?.finish.label || product.finishes[0]?.label || "")}:{" "}
            <strong>{selection?.finish.label || product.finishes[0]?.label}</strong>
          </p>
          <div className={styles.finishChips} role="radiogroup" aria-label="Framing options">
            {product.finishes.map((finish) => {
              const icon = finishIconKey(finish.id, finish.label)
              const active = selection?.finish.id === finish.id
              return (
                <label
                  key={finish.id}
                  className={styles.finishChip}
                  data-active={active}
                  title={finish.label}
                >
                  <input
                    type="radio"
                    name="product-finish"
                    checked={active}
                    onChange={() => setFinishId(finish.id)}
                  />
                  <span className={styles.finishChipIcon}>
                    <Image
                      src={`/finishes/${icon}.webp`}
                      alt=""
                      width={40}
                      height={40}
                      className={styles.finishChipImage}
                    />
                  </span>
                  <span className={styles.finishChipLabel}>{finish.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      <p className={styles.arrivalLine}>
        <span aria-hidden>✓</span> Order today, get it by <strong>{arrivalWindow}</strong>
      </p>

      {directCheckoutAvailable && selection ? (
        <div ref={buyActionsRef} className={styles.buyActions}>
          <div className={styles.qtyRow}>
            <div className={styles.qtyControl}>
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
              >
                +
              </button>
            </div>
          </div>
          <button className={styles.primaryAction} type="button" onClick={addSelection}>
            ADD TO CART
          </button>
        </div>
      ) : (
        <a className={styles.primaryAction} href={invoiceUrl} target="_blank" rel="noopener noreferrer">
          Request invoice
        </a>
      )}

      <div className={styles.secondaryActions}>
        {directCheckoutAvailable && selection ? (
          <button className={styles.buyNow} type="button" onClick={buyNow}>
            BUY IT NOW
          </button>
        ) : null}
        <a className={styles.whatsappLink} href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Chat on WhatsApp
        </a>
        <Link className={styles.sizeHelpLink} href={`/custom-painting?artwork=${encodeURIComponent(product.slug)}`}>
          Need help with size?
        </Link>
      </div>

      <ul className={styles.trustIconRow}>
        {TRUST_ICONS.map((item) => (
          <li key={item.title}>
            <span className={styles.trustIconGlyph} aria-hidden>
              {item.icon}
            </span>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>

      <div className={styles.shareRow}>
        <span className={styles.shareLabel}>Share</span>
        <button type="button" onClick={copyShareLink}>
          Copy link
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${product.title} ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(product.title)}&body=${encodeURIComponent(shareUrl)}`}>
          Email
        </a>
        {shareStatus ? <span className={styles.shareStatus}>{shareStatus}</span> : null}
      </div>

      <p className={styles.confirmation} role="status" aria-live="polite">
        {confirmation}
      </p>

      {directCheckoutAvailable && selection && image ? (
        <div className={styles.stickyPurchaseBar} data-visible={stickyVisible}>
          <div className={styles.stickyPurchaseMeta}>
            <span className={styles.stickyPurchaseThumb}>
              <Image src={image.src} alt="" width={48} height={48} />
            </span>
            <span className={styles.stickyPurchaseCopy}>
              <strong>{product.title}</strong>
              <span>
                <PriceText amountCny={linePriceCny} />
              </span>
            </span>
          </div>
          <button type="button" onClick={addSelection}>
            ADD TO CART
          </button>
        </div>
      ) : null}
    </section>
  )
}
