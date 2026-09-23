import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { createClient } from "@sanity/client"
import { sanitizeEnquiryAttribution } from "@/lib/attribution"
import { enquirySourceLabel, parseEnquiryIntent } from "@/lib/enquiry-intent"
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

    const intent = parseEnquiryIntent(stringField(form, "intent"))
    const email = stringField(form, "email")
    const submittedName = stringField(form, "name")
    const name = submittedName || (intent === "size-advice" ? "Size advice enquiry" : "")
    const attribution = sanitizeEnquiryAttribution(form)
    const artworkSlug = stringField(form, "artworkSlug").slice(0, 120)
    const artworkTitle = stringField(form, "artworkTitle").slice(0, 160)
    const clientRole = stringField(form, "clientRole").slice(0, 80)
    const company = stringField(form, "company").slice(0, 160)
    const destinationCountry = stringField(form, "destinationCountry").slice(0, 120)
    const artworkQuantity = stringField(form, "artworkQuantity").slice(0, 120)
    const projectTiming = stringField(form, "projectTiming").slice(0, 120)
    const message = stringField(form, "message").slice(0, 5000)
    const submittedId = stringField(form, "requestId")
    const requestId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submittedId)
      ? submittedId.toLowerCase()
      : randomUUID()
    const documentId = `customRequest-${requestId}`

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 })
    }

    if (intent !== "size-advice" && !submittedName) {
      return NextResponse.json({ error: "Please provide your name and a valid email." }, { status: 400 })
    }

    if (intent === "project" && (!clientRole || !destinationCountry || !message)) {
      return NextResponse.json({ error: "Please add your role, delivery country, and a short project brief." }, { status: 400 })
    }

    if (await writeClient.getDocument(documentId)) {
      return NextResponse.json({ success: true, requestId })
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

    await writeClient.createIfNotExists({
      _id: documentId,
      _type: "customRequest",
      name,
      email,
      artworkSize: stringField(form, "artworkSize"),
      preferredColors: stringField(form, "preferredColors"),
      roomType: stringField(form, "roomType"),
      budget: stringField(form, "budget"),
      message,
      clientRole: intent === "project" ? clientRole : undefined,
      company: intent === "project" ? company || undefined : undefined,
      destinationCountry: intent === "project" ? destinationCountry : undefined,
      artworkQuantity: intent === "project" ? artworkQuantity || undefined : undefined,
      projectTiming: intent === "project" ? projectTiming || undefined : undefined,
      intent,
      artworkSlug: artworkSlug || undefined,
      artworkTitle: artworkTitle || undefined,
      photos: photos.length > 0 ? photos : undefined,
      cloudflarePhotos: cloudflarePhotos.length > 0 ? cloudflarePhotos : undefined,
      status: "new",
      submittedAt: new Date().toISOString(),
      source: enquirySourceLabel(intent, attribution.sourcePage),
      sourcePage: attribution.sourcePage || undefined,
      landingPath: attribution.landingPath || undefined,
      utmSource: attribution.utmSource || undefined,
      utmMedium: attribution.utmMedium || undefined,
      utmCampaign: attribution.utmCampaign || undefined,
      utmContent: attribution.utmContent || undefined,
    })

    if (intent === "project") {
      await notifyProjectEnquiry({ requestId, name, email, clientRole, company, destinationCountry, artworkQuantity, projectTiming, artworkTitle, message })
    }

    return NextResponse.json({ success: true, requestId })
  } catch (error) {
    console.error("Custom request submit error:", error)
    return NextResponse.json({ error: "Your request could not be submitted right now." }, { status: 500 })
  }
}

type ProjectNotification = {
  requestId: string
  name: string
  email: string
  clientRole: string
  company: string
  destinationCountry: string
  artworkQuantity: string
  projectTiming: string
  artworkTitle: string
  message: string
}

async function notifyProjectEnquiry(enquiry: ProjectNotification) {
  const from = process.env.PROJECT_ENQUIRY_FROM_EMAIL || process.env.NEWSLETTER_FROM_EMAIL
  const to = process.env.PROJECT_ENQUIRY_TO_EMAIL || process.env.CONTACT_EMAIL || process.env.NEWSLETTER_TO_EMAIL
  if (!from || !to) return

  const body = [
    `New YiiArt project enquiry: ${enquiry.requestId}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Role: ${enquiry.clientRole}`,
    `Company: ${enquiry.company || "Not provided"}`,
    `Destination: ${enquiry.destinationCountry}`,
    `Quantity: ${enquiry.artworkQuantity || "Not decided"}`,
    `Timing: ${enquiry.projectTiming || "Not decided"}`,
    `Artwork or project: ${enquiry.artworkTitle || "Not provided"}`,
    `Brief: ${enquiry.message}`,
  ].join("\n")

  try {
    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject: "New YiiArt project enquiry", text: body }),
      })
      if (!response.ok) throw new Error(`Resend notification returned ${response.status}`)
    } else if (process.env.SENDGRID_API_KEY) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject: "New YiiArt project enquiry",
          content: [{ type: "text/plain", value: body }],
        }),
      })
      if (!response.ok) throw new Error(`SendGrid notification returned ${response.status}`)
    }
  } catch (error) {
    // The enquiry is already stored. A mail provider failure must not invite a duplicate submission.
    console.error("Project enquiry notification error:", error)
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
