import { client, urlFor } from "@/lib/sanity"
import { pickEnglish } from "@/lib/artwork-display"
import { convertCnyToStoreAmount, getStoreCurrency } from "@/lib/pricing"

export type CheckoutLineItem = {
  id: string
  title: string
  artistName?: string
  image?: string
  price: number
  quantity: number
}

type CheckoutItemInput = {
  id: string
  quantity: number
}

type ArtworkForCheckout = {
  _id: string
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
  images?: unknown[]
}

export class CheckoutValidationError extends Error {}

export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")
}

export async function getCheckoutLineItems(items: unknown): Promise<CheckoutLineItem[]> {
  const requestedItems = normalizeCheckoutItems(items)
  const ids = [...new Set(requestedItems.map((item) => item.id))]

  const artworks = await client.fetch<ArtworkForCheckout[]>(
    `*[_type == "artwork" && _id in $ids]{
      _id,
      title,
      artist->{name},
      price,
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

    const basePriceCny = Number(artwork.price)
    if (!Number.isFinite(basePriceCny) || basePriceCny <= 0) {
      throw new CheckoutValidationError("One or more artworks do not have a valid price.")
    }

    const currency = getStoreCurrency(process.env.STRIPE_CURRENCY || process.env.NEXT_PUBLIC_STORE_CURRENCY)
    const price = convertCnyToStoreAmount(basePriceCny, currency)

    return {
      id: item.id,
      title: pickEnglish(artwork.title, "YiiArt artwork"),
      artistName: pickEnglish(artwork.artist?.name, ""),
      image: artwork.images?.[0] ? urlFor(artwork.images[0]).width(1000).url() : undefined,
      price,
      quantity: item.quantity,
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

    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new CheckoutValidationError("Invalid cart item.")
    }

    return { id, quantity }
  })
}
