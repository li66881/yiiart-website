import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { adminMutationError, stringField, validateAdminPublishing } from "@/lib/admin"

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

    const artistId = stringField(form, "artistId")
    if (!artistId) {
      return NextResponse.json({ success: false, error: "artistId is required." }, { status: 400 })
    }

    const existing = await writeClient.fetch<{ _id: string; _type: string } | null>(
      `*[_id == $id && _type == "artist"][0]{ _id, _type }`,
      { id: artistId },
    )
    if (!existing?._id) {
      return NextResponse.json({ success: false, error: "Artist was not found." }, { status: 404 })
    }

    const patch: Record<string, unknown> = {}
    const photo = form.get("photo")
    if (isUploadFile(photo)) {
      const buffer = Buffer.from(await photo.arrayBuffer())
      const asset = await writeClient.assets.upload("image", buffer, {
        filename: cleanFilename(photo.name || "artist-photo.jpg"),
        contentType: photo.type || "image/jpeg",
      })
      patch.image = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      }
    }

    if (stringField(form, "featured") === "true") patch.featured = true
    if (stringField(form, "featured") === "false") patch.featured = false

    if (Object.keys(patch).length === 0 && stringField(form, "promoteCollection") !== "new_collection") {
      return NextResponse.json({ success: false, error: "Nothing to update." }, { status: 400 })
    }

    if (Object.keys(patch).length > 0) {
      await writeClient.patch(artistId).set(patch).commit()
    }

    let promoted = 0
    if (stringField(form, "promoteCollection") === "new_collection") {
      const ids = await writeClient.fetch<string[]>(
        `*[_type == "artwork" && artist._ref == $artistId]._id`,
        { artistId },
      )
      if (ids.length > 0) {
        const transaction = writeClient.transaction()
        for (const id of ids) {
          transaction.patch(id, (p) => p.set({
            collectionType: "new_collection",
            rightsStatus: "approved",
            migrationStatus: "ready",
          }))
        }
        await transaction.commit()
        promoted = ids.length
      }
    }

    return NextResponse.json({
      success: true,
      id: artistId,
      photoUpdated: Boolean(patch.image),
      promoted,
      message: "Artist updated.",
    })
  } catch (error: any) {
    console.error("Update artist error:", error)
    const adminError = adminMutationError(error, "Update artist failed.")
    return NextResponse.json({ success: false, error: adminError.error }, { status: adminError.status })
  }
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
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
