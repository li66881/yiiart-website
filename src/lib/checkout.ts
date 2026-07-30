import { client } from "@/lib/sanity"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { pickEnglish } from "@/lib/artwork-display"
import { convertCnyToStoreAmount, getStoreCurrency } from "@/lib/pricing"
import {
  CheckoutValidationError,
  resolveCheckoutSelection,
  type CheckoutSelectionArtwork,
} from "@/lib/checkout-selection"

export { CheckoutValidationError } from "@/lib/checkout-selection"

export type CheckoutLineItem = {
  id: string
  title: string
  artistName?: string
  image?: string
  price: number
  quantity: number
  productionModel: "hand_painted_to_order" | "original"
  sizeId: string
  sizeLabel: string
  finishId: string
  finishLabel: string
}

type CheckoutItemInput = {
  id: string
  quantity: number
  sizeId?: string
  finishId?: string
}

type ArtworkForCheckout = CheckoutSelectionArtwork & {
  title?: {
    zh?: string
    en?: string
  }
  artist?: {
    name?: {
      zh?: string
      en?: string
    }
  }
  price?: number
  availability?: "available" | "reserved" | "sold"
  allowCheckout?: boolean
  reservedUntil?: string
  cloudflareImages?: unknown[]
  images?: unknown[]
}

export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")
}

export async function getCheckoutLineItems(items: unknown, checkoutCurrency?: string): Promise<CheckoutLineItem[]> {
  const requestedItems = normalizeCheckoutItems(items)
  const ids = [...new Set(requestedItems.map((item) => item.id))]

  const artworks = await client.fetch<ArtworkForCheckout[]>(
    `*[_type == "artwork" && _id in $ids]{
      _id,
      title,
      artist->{name},
      price,
      dimensions,
      productionModel,
      standardSizes,
      frameOptions,
      availability,
      allowCheckout,
      reservedUntil,
      cloudflareImages,
      productMedia,
      images
    }`,
    { ids }
  )

  const artworkById = new Map(artworks.map((artwork) => [artwork._id, artwork]))

  return requestedItems.map((item) => {
    const artwork = artworkById.get(item.id)

    if (!artwork) {
      throw new CheckoutValidationError("One or more artworks are no longer available.")
    }

    if (!isArtworkAvailableForCheckout(artwork)) {
      throw new CheckoutValidationError(`${pickEnglish(artwork.title, "This artwork")} is not available for checkout.`)
    }

    const selection = resolveCheckoutSelection(artwork, item)

    const currency = getStoreCurrency(checkoutCurrency || process.env.STRIPE_CURRENCY || process.env.NEXT_PUBLIC_STORE_CURRENCY)
    const price = convertCnyToStoreAmount(selection.priceCny, currency)

    return {
      id: item.id,
      title: pickEnglish(artwork.title, "YiiArt artwork"),
      artistName: pickEnglish(artwork.artist?.name, ""),
      image: getArtworkImageUrl(artwork, { width: 1000 }),
      price,
      quantity: selection.quantity,
      productionModel: selection.productionModel,
      sizeId: selection.sizeId,
      sizeLabel: selection.sizeLabel,
      finishId: selection.finishId,
      finishLabel: selection.finishLabel,
    }
  })
}

export function normalizeCurrency(value: string | undefined, fallback: string) {
  return (value || fallback).trim().toLowerCase()
}

export function formatProviderAmount(amount: number) {
  return amount.toFixed(2)
}

function normalizeCheckoutItems(items: unknown): CheckoutItemInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutValidationError("Cart is empty.")
  }

  return items.map((item) => {
    if (!item || typeof item !== "object") {
      throw new CheckoutValidationError("Invalid cart item.")
    }

    const input = item as Partial<CheckoutItemInput>
    const id = typeof input.id === "string" ? input.id : ""
    const quantity = Number(input.quantity)
    const sizeId = typeof input.sizeId === "string" ? input.sizeId.trim() : undefined
    const finishId = typeof input.finishId === "string" ? input.finishId.trim() : undefined

    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new CheckoutValidationError("Invalid cart item.")
    }

    return { id, quantity, sizeId, finishId }
  })
}

function isArtworkAvailableForCheckout(artwork: ArtworkForCheckout) {
  if (artwork.allowCheckout === false) return false
  if (artwork.availability === "sold") return false
  if (artwork.availability === "reserved") {
    if (!artwork.reservedUntil) return false
    return new Date(artwork.reservedUntil).getTime() < Date.now()
  }
  return true
}
