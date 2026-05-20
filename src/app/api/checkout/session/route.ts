import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { client, urlFor } from "@/lib/sanity"

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

export async function POST(request: Request) {
  try {
    const { items, shippingAddress } = await request.json()

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("your_stripe")) {
      return NextResponse.json(
        { success: false, error: "Stripe key not configured" },
        { status: 500 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const requestedItems = normalizeItems(items)
    const ids = requestedItems.map((item) => item.id)
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

    const lineItems = requestedItems.map((item) => {
      const artwork = artworkById.get(item.id)

      if (!artwork) {
        throw new CheckoutValidationError("One or more artworks are no longer available.")
      }

      const price = Number(artwork.price)
      if (!Number.isFinite(price) || price <= 0) {
        throw new CheckoutValidationError("One or more artworks do not have a valid price.")
      }

      const title = artwork.title?.zh || artwork.title?.en || "YiiArt artwork"
      const artistName = artwork.artist?.name?.zh || artwork.artist?.name?.en
      const image = artwork.images?.[0] ? urlFor(artwork.images[0]).width(1000).url() : undefined

      return {
        price_data: {
          currency: process.env.STRIPE_CURRENCY || "cny",
          product_data: {
            name: title,
            description: artistName ? `Artwork by ${artistName}` : undefined,
            images: image ? [image] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CN", "GB", "DE", "FR", "JP", "AU", "CA", "SG", "HK", "TW"],
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        artworkIds: ids.join(",").slice(0, 500),
        shippingAddress: JSON.stringify(shippingAddress || {}).slice(0, 500),
      },
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

function normalizeItems(items: unknown[]): CheckoutItemInput[] {
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

class CheckoutValidationError extends Error {}
