import { client, urlFor } from "@/lib/sanity"

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

    const price = Number(artwork.price)
    if (!Number.isFinite(price) || price <= 0) {
      throw new CheckoutValidationError("One or more artworks do not have a valid price.")
    }

    return {
      id: item.id,
      title: artwork.title?.zh || artwork.title?.en || "YiiArt artwork",
      artistName: artwork.artist?.name?.zh || artwork.artist?.name?.en,
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
