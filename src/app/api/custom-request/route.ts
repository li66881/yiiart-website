import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { isR2Configured, uploadR2Object } from "@/lib/r2"

export const runtime = "nodejs"

const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 10 * 1024 * 1024

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function POST(request: NextRequest) {
  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json({ error: "Custom request submission is not configured." }, { status: 503 })
  }

  try {
    const form = await request.formData()

    const name = stringField(form, "name")
    const email = stringField(form, "email")

    if (!name || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide your name and a valid email." }, { status: 400 })
    }

    const photos = []
    const cloudflarePhotos = []
    const useR2 = isR2Configured()
    const files = form.getAll("photos").filter(isUploadFile).slice(0, MAX_PHOTOS)

    for (const file of files) {
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: "Each photo must be under 10MB." }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())

      if (useR2) {
        const uploaded = await uploadR2Object({
          namespace: "custom-requests",
          filename: file.name,
          body: buffer,
          contentType: file.type || "application/octet-stream",
        })

        cloudflarePhotos.push({
          _type: "cloudflareAsset",
          _key: sanityKey(uploaded.key),
          url: uploaded.url,
          key: uploaded.key,
          alt: `Custom request photo from ${name}`,
          contentType: uploaded.contentType,
        })
      } else {
        const asset = await writeClient.assets.upload("image", buffer, {
          filename: cleanFilename(file.name),
        })
        photos.push({
          _type: "image",
          _key: sanityKey(asset._id),
          asset: { _type: "reference", _ref: asset._id },
        })
      }
    }

    await writeClient.create({
      _type: "customRequest",
      name,
      email,
      artworkSize: stringField(form, "artworkSize"),
      preferredColors: stringField(form, "preferredColors"),
      roomType: stringField(form, "roomType"),
      budget: stringField(form, "budget"),
      message: stringField(form, "message"),
      photos: photos.length > 0 ? photos : undefined,
      cloudflarePhotos: cloudflarePhotos.length > 0 ? cloudflarePhotos : undefined,
      status: "new",
      submittedAt: new Date().toISOString(),
      source: "custom-painting-page",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Custom request submit error:", error)
    return NextResponse.json({ error: "Your request could not be submitted right now." }, { status: 500 })
  }
}

function stringField(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

function sanityKey(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(-12) || Math.random().toString(36).slice(2, 14)
}
