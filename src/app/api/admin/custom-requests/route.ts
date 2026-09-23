import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { validateAdminPublishing } from "@/lib/admin"

export const runtime = "nodejs"

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const auth = validateAdminPublishing(body?.password)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } })

    const enquiries = await readClient.fetch(`*[_type == "customRequest"] | order(submittedAt desc, _createdAt desc)[0...100]{
      _id, name, email, intent, clientRole, company, destinationCountry, artworkQuantity,
      projectTiming, artworkTitle, artworkSlug, artworkSize, preferredColors, roomType,
      budget, message, status, submittedAt, source, sourcePage, utmSource, utmMedium,
      utmCampaign, utmContent
    }`)
    return NextResponse.json({ enquiries }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Admin enquiry read error:", error)
    return NextResponse.json({ error: "Unable to load enquiries right now." }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}
