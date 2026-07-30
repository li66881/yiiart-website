"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useWishlist } from "@/context/WishlistContext"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { convertCnyToStoreAmount, formatStorePrice } from "@/lib/pricing"
import type { StorefrontProduct } from "@/lib/storefront/product"
import { getProductSelection } from "@/lib/storefront/selection"
import styles from "./storefront.module.css"

type Props = {
  product: StorefrontProduct
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
  saleEndsAt?: string | null
}

const SERVICE_BADGES = [
  {
    title: "Ship After You Are Satisfied",
    text: "Each piece is made just for you!",
    detail:
      "While your canvas is being painted, the studio can share progress photos. We dispatch after you are happy with the final look.",
    icon: "✦",
  },
  {
    title: "Free Shipping on All Orders",
    text: "5-7 days fast free shipping worldwide.",
    detail: "Insured express carriers such as DHL, UPS, or FedEx depending on destination. Shipping is included for most routes.",
    icon: "✈",
  },
  {
    title: "30 Days Easy Returns",
    text: "Learn more.",
    detail: "Ready-made works can be returned within 30 days. Made-to-order pieces follow the studio return guidance on the policy page.",
    icon: "↺",
  },
  {
    title: "Safe Payment Options",
    text: "100% money back guarantee.",
    detail: "Checkout uses encrypted payment providers. YiiArt does not store full card details on its servers.",
    icon: "◎",
  },
]

const SOCIAL_PROOF_PLACEHOLDER = {
  soldCount: 3,
  hours: 48,
  saves: 39,
  inCarts: 21,
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

function finishSwatchTone(label: string) {
  const value = label.toLowerCase()
  if (value.includes("rolled")) return "rolled"
  if (value.includes("frameless") || value.includes("gallery")) return "frameless"
  if (value.includes("gold")) return "gold"
  if (value.includes("silver")) return "silver"
  if (value.includes("white")) return "white"
  if (value.includes("wood") || value.includes("oak") || value.includes("natural")) return "wood"
  if (value.includes("black")) return "black"
  return "default"
}

export default function ProductPurchasePanel({
  product,
  directCheckoutAvailable,
  invoiceUrl,
  whatsappUrl,
  saleEndsAt = null,
}: Props) {
  const initialSize = product.sizes[0]?.id || ""
  const initialFinish = product.finishes[0]?.id || ""
  const [sizeId, setSizeId] = useState(initialSize)
  const [finishId, setFinishId] = useState(initialFinish)
  const [quantity, setQuantity] = useState(1)
  const [confirmation, setConfirmation] = useState("")
  const [openBadge, setOpenBadge] = useState<string | null>(null)
  const arrivalWindow = useMemo(() => estimateArrivalWindow(), [])
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
  const allowQty = product.productionModel === "hand_painted_to_order"
  const lineQty = allowQty ? Math.max(1, quantity) : 1
  const linePriceCny = selection ? selection.priceCny * lineQty : 0
  const installmentHint = selection
    ? formatStorePrice(selection.priceCny / 4, currency)
    : null

  const addSelection = () => {
    if (!selection || !image || !directCheckoutAvailable) return

    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      artist: product.artistName,
      price: selection.priceCny,
      image: image.src,
      quantity: lineQty,
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
      value: convertCnyToStoreAmount(linePriceCny, currency),
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
        <p className={styles.socialProofMeta}>
          <strong>{SOCIAL_PROOF_PLACEHOLDER.saves}</strong> saves · In{" "}
          <strong>{SOCIAL_PROOF_PLACEHOLDER.inCarts}</strong> carts now
        </p>
        <button type="button" onClick={toggleSaved} className={styles.saveButton} aria-pressed={saved}>
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <h1 id="product-title" className={styles.productTitle}>
        {product.title}
      </h1>

      <p className={styles.socialProof}>
        <span aria-hidden>🛒</span> {SOCIAL_PROOF_PLACEHOLDER.soldCount} sold in last{" "}
        {SOCIAL_PROOF_PLACEHOLDER.hours} hours
      </p>

      <div className={styles.priceBlock}>
        <p className={styles.price}>
          <PriceText amountCny={selection?.priceCny} />
        </p>
        <p className={styles.shippingNote}>Shipping and tariffs included for international delivery*</p>
        <p className={styles.disclosure}>
          <PriceDisclosure />
        </p>
      </div>

      {installmentHint ? (
        <div className={styles.installmentBox}>
          <span className={styles.installmentBrand}>Pay later</span>
          <p>
            From <strong>{installmentHint}</strong>/month with your preferred checkout plan.
          </p>
        </div>
      ) : null}

      {saleActive && (
        <p className={styles.saleCue}>
          Hurry up! Sale ends {new Date(saleEndsAt as string).toLocaleString()}
        </p>
      )}

      <div className={styles.promoBanner} aria-hidden={false}>
        <div>
          <p className={styles.promoEyebrow}>Studio offer</p>
          <p className={styles.promoTitle}>Selected canvases up to 40% off</p>
          <p className={styles.promoText}>Hand-painted to order · Free worldwide shipping</p>
        </div>
        <span className={styles.promoBadge}>40% OFF</span>
      </div>

      {product.sizes.length > 0 && (
        <div className={styles.optionBlock}>
          <label className={styles.optionLabel} htmlFor="product-size-select">
            Size
          </label>
          <select
            id="product-size-select"
            className={styles.sizeSelect}
            value={sizeId}
            onChange={(event) => setSizeId(event.target.value)}
          >
            <option value="" disabled>
              Select a Size
            </option>
            {product.sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {product.finishes.length > 0 && (
        <div className={styles.optionBlock}>
          <p className={styles.optionLabel}>
            Rolled Canvas/Frameless/Framed:{" "}
            <strong>{selection?.finish.label || product.finishes[0]?.label}</strong>
          </p>
          <div className={styles.finishSwatches}>
            {product.finishes.map((finish) => (
              <label
                key={finish.id}
                className={styles.finishSwatch}
                title={finish.label}
                data-active={selection?.finish.id === finish.id}
                data-finish={finishSwatchTone(finish.label)}
              >
                <input
                  type="radio"
                  name="product-finish"
                  checked={selection?.finish.id === finish.id}
                  onChange={() => setFinishId(finish.id)}
                />
                <span className={styles.finishSwatchFace} aria-hidden />
              </label>
            ))}
          </div>
        </div>
      )}

      <p className={styles.arrivalLine}>
        <span aria-hidden>✓</span> Arrives soon! Get it by <strong>{arrivalWindow}</strong> if you order
        today
      </p>

      {directCheckoutAvailable && selection ? (
        <div className={styles.cartRow}>
          {allowQty ? (
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
          ) : null}
          <button className={styles.primaryAction} type="button" onClick={addSelection}>
            Add To Cart — <PriceText amountCny={linePriceCny} />
          </button>
        </div>
      ) : (
        <a className={styles.primaryAction} href={invoiceUrl} target="_blank" rel="noopener noreferrer">
          Request invoice
        </a>
      )}

      <div className={styles.secondaryActions}>
        <a className={styles.buyNow} href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Buy It Now
        </a>
        <Link className={styles.sizeHelpLink} href={`/custom-painting?artwork=${encodeURIComponent(product.slug)}`}>
          Need help with size?
        </Link>
      </div>

      <ul className={styles.serviceBadges}>
        {SERVICE_BADGES.map((badge) => {
          const isOpen = openBadge === badge.title
          return (
            <li key={badge.title}>
              <button
                type="button"
                className={styles.serviceBadgeButton}
                aria-expanded={isOpen}
                onClick={() => setOpenBadge(isOpen ? null : badge.title)}
              >
                <span className={styles.serviceIcon} aria-hidden>
                  {badge.icon}
                </span>
                <span className={styles.serviceCopy}>
                  <strong>
                    {badge.title} <span className={styles.infoMark}>?</span>
                  </strong>
                  <span>{badge.text}</span>
                </span>
              </button>
              {isOpen ? <p className={styles.serviceBadgeDetail}>{badge.detail}</p> : null}
            </li>
          )
        })}
      </ul>

      <p className={styles.confirmation} role="status" aria-live="polite">
        {confirmation}
      </p>

      {directCheckoutAvailable && selection && (
        <div className={styles.mobilePurchaseBar}>
          <span>
            Selected price
            <strong>
              <PriceText amountCny={linePriceCny} />
            </strong>
          </span>
          <button type="button" onClick={addSelection}>
            Add to cart
          </button>
        </div>
      )}
    </section>
  )
}
