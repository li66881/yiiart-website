import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { isR2Configured, uploadR2Object } from "@/lib/r2"

export const runtime = "nodejs"

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function POST(request: NextRequest) {
  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json({ error: "Review submission is not configured." }, { status: 503 })
  }

  try {
    const form = await request.formData()
    const token = stringField(form, "token")

    if (token.length < 12) {
      return NextResponse.json({ error: "This review link is not valid." }, { status: 400 })
    }

    const invite = await writeClient.fetch(
      `*[_type == "reviewInvite" && token == $token][0]{
        _id,
        status,
        usedAt,
        expiresAt,
        orderIdInternal,
        customerEmailHash,
        artwork->{_id, title, artist->{_id}}
      }`,
      { token }
    )

    const inviteStatus = getInviteStatus(invite)
    if (inviteStatus !== "active") {
      return NextResponse.json({ error: reviewInviteError(inviteStatus) }, { status: 400 })
    }

    if (stringField(form, "realExperience") !== "on") {
      return NextResponse.json({ error: "Please confirm this reflects your real experience." }, { status: 400 })
    }

    const displayPermission = stringField(form, "displayPermission") === "on"
    if (!displayPermission) {
      return NextResponse.json({ error: "Display permission is required to submit a public review." }, { status: 400 })
    }

    const customerName = stringField(form, "customerName")
    const customerCountry = stringField(form, "customerCountry")
    const reviewTitle = stringField(form, "reviewTitle")
    const reviewText = stringField(form, "reviewText")

    if (!customerName || !customerCountry || !reviewTitle || reviewText.length < 20) {
      return NextResponse.json({ error: "Please complete the required review fields." }, { status: 400 })
    }

    const photoPermission = stringField(form, "photoPermission") === "on"
    const photos = []
    const cloudflarePhotos = []
    const useR2 = isR2Configured()
    const photoAlt = `Collector photo for ${pickInviteArtworkTitle(invite)}`

    for (const file of form.getAll("photos").filter(isUploadFile)) {
      const buffer = Buffer.from(await file.arrayBuffer())

      if (useR2) {
        const uploaded = await uploadR2Object({
          namespace: "reviews",
          filename: file.name,
          body: buffer,
          contentType: file.type || "application/octet-stream",
        })

        cloudflarePhotos.push({
          _type: "cloudflareAsset",
          _key: sanityKey(uploaded.key),
          url: uploaded.url,
          key: uploaded.key,
          alt: photoAlt,
          contentType: uploaded.contentType,
        })
      } else {
        const asset = await writeClient.assets.upload("image", buffer, {
          filename: cleanFilename(file.name),
        })
        photos.push({
          _type: "image",
          _key: asset._id.replace(/[^a-zA-Z0-9]/g, "").slice(-12),
          asset: { _type: "reference", _ref: asset._id },
          alt: photoAlt,
        })
      }
    }

    const now = new Date().toISOString()
    const reviewDoc = {
      _type: "review",
      artwork: { _type: "reference", _ref: invite.artwork._id },
      artist: invite.artwork.artist?._id ? { _type: "reference", _ref: invite.artwork.artist._id } : undefined,
      verifiedBuyer: true,
      orderIdInternal: invite.orderIdInternal,
      customerEmailHash: invite.customerEmailHash,
      reviewSource: "purchase_invite",
      customerName,
      customerCity: stringField(form, "customerCity"),
      customerCountry,
      overallRating: ratingField(form, "overallRating"),
      artworkQualityRating: ratingField(form, "artworkQualityRating"),
      textureColorAccuracyRating: ratingField(form, "textureColorAccuracyRating"),
      packagingDeliveryRating: ratingField(form, "packagingDeliveryRating"),
      customerSupportRating: ratingField(form, "customerSupportRating"),
      roomFitRating: ratingField(form, "roomFitRating"),
      reviewTitle,
      reviewText,
      roomType: stringField(form, "roomType") || "Other",
      photos: photos.length > 0 ? photos : undefined,
      cloudflarePhotos: cloudflarePhotos.length > 0 ? cloudflarePhotos : undefined,
      displayPermission,
      photoPermission,
      status: "pending",
      featured: false,
      featuredOnHome: false,
      featuredOnGallery: false,
      language: "en",
      submittedAt: now,
    }

    await writeClient.create(reviewDoc)
    await writeClient.patch(invite._id).set({ status: "used", usedAt: now }).commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review submit error:", error)
    return NextResponse.json({ error: "Review could not be submitted." }, { status: 500 })
  }
}

function stringField(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function ratingField(form: FormData, key: string) {
  const value = Number(stringField(form, key))
  if (!Number.isFinite(value)) return 5
  return Math.max(1, Math.min(5, value))
}

function getInviteStatus(invite: any) {
  if (!invite) return "missing"
  if (invite.status === "used" || invite.usedAt) return "used"
  if (invite.status === "expired") return "expired"
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) return "expired"
  if (invite.status !== "active") return "invalid"
  return "active"
}

function reviewInviteError(status: string) {
  if (status === "used") return "This review link has already been used."
  if (status === "expired") return "This review link has expired."
  return "This review link is not valid."
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
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(-12) || Date.now().toString(36)
}

function pickInviteArtworkTitle(invite: any) {
  return invite?.artwork?.title?.en || invite?.artwork?.title?.zh || "YiiArt artwork"
}
