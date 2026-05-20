import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { createSlug, stringField, validateAdminPublishing } from "@/lib/admin"

export const runtime = "nodejs"

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const password = stringField(form, "password")
    const auth = validateAdminPublishing(password)

    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const titleZh = stringField(form, "titleZh")
    const titleEn = stringField(form, "titleEn")
    const price = Number(stringField(form, "price"))
    const dimensions = stringField(form, "dimensions")
    const medium = stringField(form, "medium") || "Oil on Canvas"
    const category = stringField(form, "category") || "Abstract"
    const descriptionZh = stringField(form, "descriptionZh")
    const descriptionEn = stringField(form, "descriptionEn")
    const artistId = stringField(form, "artistId")
    const featured = stringField(form, "featured") === "true"
    const files = form.getAll("images").filter(isUploadFile)

    if (!titleZh && !titleEn) {
      return NextResponse.json({ success: false, error: "Artwork title is required." }, { status: 400 })
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ success: false, error: "A valid CNY price is required." }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "Please upload at least one artwork image." }, { status: 400 })
    }

    const baseSlug = createSlug(titleEn || titleZh)
    const existing = await writeClient.fetch<number>(
      `count(*[_type == "artwork" && slug.current == $slug])`,
      { slug: baseSlug }
    )
    const slug = existing > 0 ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug
    const images = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const asset = await writeClient.assets.upload("image", buffer, {
        filename: cleanFilename(file.name),
      })

      images.push({
        _type: "image",
        _key: asset._id.replace(/[^a-zA-Z0-9]/g, "").slice(-12),
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      })
    }

    const artworkDoc = {
      _type: "artwork",
      title: { zh: titleZh, en: titleEn },
      slug: { _type: "slug", current: slug },
      artist: artistId ? { _type: "reference", _ref: artistId } : undefined,
      price,
      dimensions,
      medium,
      category,
      images,
      description: { zh: descriptionZh, en: descriptionEn },
      featured,
    }

    const result = await writeClient.create(artworkDoc)

    return NextResponse.json({
      success: true,
      id: result._id,
      slug,
      message: "Artwork created successfully.",
    })
  } catch (error: any) {
    console.error("Create artwork error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Create artwork failed." },
      { status: 500 }
    )
  }
}

function isUploadFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object"
    && value !== null
    && "arrayBuffer" in value
    && "name" in value
    && "size" in value
    && Number((value as File).size) > 0
  )
}

function cleanFilename(filename: string) {
  return filename.replace(/[^\w.\-\u4e00-\u9fff]/g, "_")
}
