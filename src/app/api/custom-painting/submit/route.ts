import crypto from "crypto"
import { createClient } from "@sanity/client"
import { NextRequest, NextResponse } from "next/server"
import {
  CUSTOM_PAINTING_MAX_FILE_SIZE,
  buildCustomPaintingDocument,
  buildCustomPaintingNotification,
  createCustomPaintingReference,
  validateCustomPaintingRequest,
} from "@/lib/custom-painting-request"
import { inspectR2Object } from "@/lib/r2"

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
    const body = await request.json()
    const validation = validateCustomPaintingRequest(body, {
      assetBaseUrl:
        process.env.CLOUDFLARE_R2_PUBLIC_URL
        || process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
        || "https://assets.yiiart.com",
      r2Prefix: process.env.CLOUDFLARE_R2_PREFIX || "uploads",
    })

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!process.env.SANITY_WRITE_TOKEN) {
      console.error("Custom painting submission requested without SANITY_WRITE_TOKEN.")
      return NextResponse.json(
        { error: "Custom requests are temporarily unavailable." },
        { status: 503 }
      )
    }

    for (const asset of validation.value.assets) {
      const stored = await inspectR2Object(asset.key)
      if (
        stored.size !== asset.size
        || stored.size > CUSTOM_PAINTING_MAX_FILE_SIZE
        || stored.contentType !== asset.contentType
      ) {
        return NextResponse.json(
          { error: "One or more uploaded images could not be verified." },
          { status: 400 }
        )
      }
    }

    const reference = createCustomPaintingReference()
    const id = `customPaintingRequest-${crypto.randomUUID()}`
    const submittedAt = new Date().toISOString()
    const document = buildCustomPaintingDocument(validation.value, {
      id,
      reference,
      submittedAt,
    })

    await writeClient.create(document)

    let notificationStatus = "skipped"
    try {
      notificationStatus = await sendNotification(
        buildCustomPaintingNotification(validation.value, reference),
        reference
      )
    } catch (error) {
      notificationStatus = "failed"
      console.error(`Custom painting notification failed for ${reference}:`, error)
    }

    try {
      await writeClient.patch(id).set({ notificationStatus }).commit()
    } catch (error) {
      console.error(`Custom painting notification status could not be updated for ${reference}:`, error)
    }

    return NextResponse.json({ success: true, reference })
  } catch (error) {
    console.error("Custom painting submission error:", error)
    return NextResponse.json(
      { error: "Your request could not be submitted. Please try again." },
      { status: 500 }
    )
  }
}

async function sendNotification(text: string, reference: string) {
  const from = process.env.CUSTOM_REQUEST_FROM_EMAIL || process.env.NEWSLETTER_FROM_EMAIL
  const to =
    process.env.CUSTOM_REQUEST_TO_EMAIL
    || process.env.CONTACT_EMAIL
    || process.env.NEWSLETTER_TO_EMAIL

  if (!from || !to) {
    console.warn(`Custom painting notification skipped for ${reference}: email addresses are not configured.`)
    return "skipped"
  }

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: extractReplyTo(text),
        subject: `New custom painting request ${reference}`,
        text,
      }),
    })

    if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}.`)
    return "sent"
  }

  if (process.env.SENDGRID_API_KEY) {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        reply_to: { email: extractReplyTo(text) },
        subject: `New custom painting request ${reference}`,
        content: [{ type: "text/plain", value: text }],
      }),
    })

    if (!response.ok) throw new Error(`SendGrid returned HTTP ${response.status}.`)
    return "sent"
  }

  return "skipped"
}

function extractReplyTo(text: string) {
  return text.match(/^Email:\s*(.+)$/m)?.[1]?.trim() || process.env.CONTACT_EMAIL || ""
}
