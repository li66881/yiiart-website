import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { createSlug, validateAdminPublishing } from "@/lib/admin"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nameZh, nameEn, location, style, bioZh, bioEn, password } = body
    const auth = validateAdminPublishing(password)

    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    if (!nameZh || typeof nameZh !== "string") {
      return NextResponse.json({ success: false, error: "Chinese artist name is required." }, { status: 400 })
    }

    const slug = createSlug(nameEn || nameZh)
    const artistDoc = {
      _type: "artist",
      _id: `artist-${slug}-${Date.now()}`,
      name: { zh: nameZh, en: nameEn || "" },
      slug: { _type: "slug", current: slug },
      location: location || "",
      bio: { zh: bioZh || "", en: bioEn || "" },
      style: style
        ? String(style)
            .replace(/\uFF0C/g, ",")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      featured: false,
    }

    const result = await client.create(artistDoc)

    return NextResponse.json({
      success: true,
      id: result._id,
      slug,
      message: "Artist created successfully.",
    })
  } catch (error: any) {
    console.error("Create artist error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Create failed." },
      { status: 500 }
    )
  }
}
