import { client } from "@/lib/sanity"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { pickEnglish } from "@/lib/artwork-display"
import { convertCnyToStoreAmount, getStoreCurrency } from "@/lib/pricing"
import { normalizePresentationOptions, validatePresentationOption } from "@/features/artwork-detail/model"

export type CheckoutLineItem = {
  id: string
  title: string
  artistName?: string
  image?: string
  price: number
  quantity: number
  presentationOption?: string
}

type CheckoutItemInput = {
  id: string
  quantity: number
  presentationOption?: string
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
  availability?: "available" | "reserved" | "sold"
  allowCheckout?: boolean
  reservedUntil?: string
  presentationOptions?: string[]
  cloudflareImages?: unknown[]
  images?: unknown[]
}

export class CheckoutValidationError extends Error {}

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
      availability,
      allowCheckout,
      reservedUntil,
      presentationOptions,
      cloudflareImages,
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

    const basePriceCny = Number(artwork.price)
    if (!Number.isFinite(basePriceCny) || basePriceCny <= 0) {
      throw new CheckoutValidationError("One or more artworks do not have a valid price.")
    }

    const currency = getStoreCurrency(checkoutCurrency || process.env.STRIPE_CURRENCY || process.env.NEXT_PUBLIC_STORE_CURRENCY)
    const price = convertCnyToStoreAmount(basePriceCny, currency)
    const presentationOption = resolveCheckoutPresentation(
      item.presentationOption,
      artwork.presentationOptions,
    )
    const baseTitle = pickEnglish(artwork.title, "YiiArt artwork")

    return {
      id: item.id,
      title: presentationOption ? `${baseTitle} - ${presentationOption}` : baseTitle,
      artistName: pickEnglish(artwork.artist?.name, ""),
      image: getArtworkImageUrl(artwork, { width: 1000 }),
      price,
      quantity: item.quantity,
      presentationOption,
    }
  })
}

export function normalizeCurrency(value: string | undefined, fallback: string) {
  return (value || fallback).trim().toLowerCase()
}

export function formatProviderAmount(amount: number) {
  return amount.toFixed(2)
}

export function normalizeCheckoutItems(items: unknown): CheckoutItemInput[] {
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
    const presentationOption = typeof input.presentationOption === "string"
      ? input.presentationOption.trim()
      : undefined

    if (!id || !Number.isInteger(quantity) || quantity !== 1) {
      throw new CheckoutValidationError("Invalid cart item.")
    }

    return { id, quantity, presentationOption: presentationOption || undefined }
  })
}

export function resolveCheckoutPresentation(requested: unknown, configured: unknown) {
  const allowed = normalizePresentationOptions(configured)
  if (allowed.length === 0) return undefined
  const requestedLabel = typeof requested === "string" ? requested.trim() : ""
  if (!requestedLabel) {
    throw new CheckoutValidationError("Select a presentation option before checkout.")
  }
  const selected = validatePresentationOption(requestedLabel, allowed)
  if (!selected) {
    throw new CheckoutValidationError("Selected presentation option is not available.")
  }
  return selected
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
