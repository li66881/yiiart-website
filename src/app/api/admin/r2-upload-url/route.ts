import { NextRequest, NextResponse } from "next/server"
import { adminMutationError, stringField, validateAdminPublishing } from "@/lib/admin"
import { createR2DirectPut, isR2Configured } from "@/lib/r2"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const auth = validateAdminPublishing(stringField(form, "password"))
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    if (!isR2Configured()) {
      return NextResponse.json({
        success: false,
        error: "R2 is not configured on this deployment, so videos cannot be uploaded through the admin API.",
      }, { status: 503 })
    }

    const catalogCode = stringField(form, "catalogCode") || "video"
    const filename = stringField(form, "filename") || "hang-on-wall.mp4"
    const contentType = stringField(form, "contentType") || "video/mp4"
    const signed = await createR2DirectPut({
      namespace: `product-videos/${catalogCode.toLowerCase()}`,
      filename,
      contentType,
      expiresIn: 900,
    })

    return NextResponse.json({ success: true, ...signed })
  } catch (error: any) {
    console.error("R2 upload URL error:", error)
    const adminError = adminMutationError(error, "Could not create an upload URL.")
    return NextResponse.json({ success: false, error: adminError.error }, { status: adminError.status })
  }
}
