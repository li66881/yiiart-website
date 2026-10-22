import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { validateAdminPublishing } from "@/lib/admin"

export const runtime = "nodejs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function POST(request: Request) {
  let body: { password?: string; action?: string; artworkId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const auth = validateAdminPublishing(body.password)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } })

  try {
    if (body.action === "list") {
      const artworks = await client.fetch(`*[_type == "artwork" && productionModel == "original"] | order(_updatedAt desc)[0...500]{_id, "title": coalesce(title.en, title.zh), catalogCode, availability, allowCheckout, soldAt, soldOrderNumber, "slug": slug.current}`)
      return NextResponse.json({ artworks }, { headers: { "Cache-Control": "no-store" } })
    }

    if (body.action === "sold_in_store" && body.artworkId) {
      const artwork = await client.getDocument(body.artworkId)
      if (!artwork || artwork._type !== "artwork" || artwork.productionModel !== "original") {
        return NextResponse.json({ error: "Original artwork not found." }, { status: 404 })
      }
      if (artwork.availability !== "available" || artwork.allowCheckout === false) {
        return NextResponse.json({ error: "Artwork is not available; refresh the inventory before updating." }, { status: 409 })
      }
      await client.patch(artwork._id).ifRevisionId(artwork._rev).set({
        availability: "sold",
        allowCheckout: false,
        soldAt: new Date().toISOString(),
        soldOrderNumber: "IN-STORE",
      }).commit()
      return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } })
    }

    return NextResponse.json({ error: "Unsupported inventory action." }, { status: 400 })
  } catch (error) {
    console.error("Inventory operation failed:", error)
    return NextResponse.json({ error: "Inventory changed or is temporarily unavailable. Refresh and try again." }, { status: 409, headers: { "Cache-Control": "no-store" } })
  }
}
