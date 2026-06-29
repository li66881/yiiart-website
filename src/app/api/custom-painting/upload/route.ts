import { NextRequest, NextResponse } from "next/server"
import { validateUploadFiles } from "@/lib/custom-painting-request"
import { createPresignedR2Upload, isR2Configured } from "@/lib/r2"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!isR2Configured()) {
    console.error("Custom painting upload requested without R2 configuration.")
    return NextResponse.json(
      { error: "Image upload is temporarily unavailable." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const validation = validateUploadFiles(body?.files)

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const uploads = await Promise.all(
      validation.value.map(async (file) => ({
        ...(await createPresignedR2Upload({
          namespace: "custom-requests",
          filename: file.name,
          contentType: file.type,
        })),
        size: file.size,
        originalName: file.name,
      }))
    )

    return NextResponse.json({ uploads })
  } catch (error) {
    console.error("Custom painting upload authorization error:", error)
    return NextResponse.json(
      { error: "Image upload could not be started. Please try again." },
      { status: 500 }
    )
  }
}
