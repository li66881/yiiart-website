"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { ATTRIBUTION_STORAGE_KEY, parseEnquiryAttribution, type EnquiryAttribution } from "@/lib/attribution"
import { parseEnquiryIntent, type EnquiryIntent } from "@/lib/enquiry-intent"
import { trackMarketingEvent } from "@/lib/marketing-events"

type CustomPaintingRequestFormProps = {
  contactEmail: string
  whatsappNumber: string
  intent?: string
  artworkSlug?: string
  artworkTitle?: string
}

const roomTypes = ["Living room", "Bedroom", "Dining room", "Office", "Entryway", "Hospitality space"]
const budgets = ["Under $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000 - $5,000", "$5,000+"]
const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 10 * 1024 * 1024

export default function CustomPaintingRequestForm({
  contactEmail,
  whatsappNumber,
  intent: intentProp,
  artworkSlug = "",
  artworkTitle = "",
}: CustomPaintingRequestFormProps) {
  const intent = parseEnquiryIntent(intentProp)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [photoNames, setPhotoNames] = useState<string[]>([])
  const [attribution, setAttribution] = useState<EnquiryAttribution | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const whatsappBaseUrl = useMemo(() => `https://wa.me/${whatsappNumber}`, [whatsappNumber])
  const compact = intent === "size-advice"

  useEffect(() => {
    try {
      const storedRaw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
      const stored = storedRaw ? JSON.parse(storedRaw) : null
      setAttribution(parseEnquiryAttribution({
        currentPath: `${window.location.pathname}${window.location.search}`,
        search: window.location.search,
        stored,
      }))
    } catch {
      setAttribution(parseEnquiryAttribution({
        currentPath: window.location.pathname,
        search: window.location.search,
      }))
    }
  }, [])

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError("")
    const files = Array.from(event.target.files || [])

    if (files.length > MAX_PHOTOS) {
      setError(`Please choose up to ${MAX_PHOTOS} photos.`)
      event.target.value = ""
      setPhotoNames([])
      return
    }

    const oversized = files.find((file) => file.size > MAX_PHOTO_BYTES)
    if (oversized) {
      setError("Each photo must be under 10MB.")
      event.target.value = ""
      setPhotoNames([])
      return
    }

    setPhotoNames(files.map((file) => file.name))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setStatus("")

    const formElement = event.currentTarget
    const form = new FormData(formElement)

    setSubmitting(true)

    try {
      const response = await fetch("/api/custom-request", {
        method: "POST",
        body: form,
      })

      if (response.ok) {
        setSubmitted(true)
        setStatus(compact
          ? "Request received. YiiArt will reply with a size recommendation when the studio has reviewed your details."
          : "Request received. YiiArt replies as soon as practical with sizing, palette, and pricing guidance.")
        trackMarketingEvent("Lead", {
          lead_type: "form_submit",
          intent,
          content_name: artworkSlug || artworkTitle || undefined,
        })
        formElement.reset()
        setPhotoNames([])
        return
      }

      if (response.status === 503) {
        openMailFallback(form)
        return
      }

      const data = await response.json().catch(() => null)
      setError(data?.error || "Your request could not be submitted right now. Please try again or use WhatsApp.")
    } catch {
      openMailFallback(form)
    } finally {
      setSubmitting(false)
    }
  }

  const openMailFallback = (form: FormData) => {
    const message = buildRequestMessage(form, intent)
    const subject = encodeURIComponent(intent === "project" ? "YiiArt project art enquiry" : compact ? "YiiArt size advice request" : "YiiArt custom painting request")
    const body = encodeURIComponent(message)

    setStatus("Opening your email app with the request details. Please attach your room photos in the email.")
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  const handleWhatsApp = () => {
    const form = document.getElementById("custom-painting-form") as HTMLFormElement | null
    const formData = form ? new FormData(form) : new FormData()
    const message = encodeURIComponent(buildRequestMessage(formData, intent))
    trackMarketingEvent("WhatsAppClick", {
      location: "custom_request_form",
      intent,
      content_name: artworkSlug || undefined,
    })
    window.open(`${whatsappBaseUrl}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  return (
    <form id="custom-painting-form" onSubmit={handleSubmit} className="border border-stone-200 bg-[#fbfaf6] p-6 md:p-8">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="artworkSlug" value={artworkSlug} />
      <input type="hidden" name="sourcePage" value={attribution?.sourcePage || ""} />
      <input type="hidden" name="landingPath" value={attribution?.landingPath || ""} />
      <input type="hidden" name="utmSource" value={attribution?.utmSource || ""} />
      <input type="hidden" name="utmMedium" value={attribution?.utmMedium || ""} />
      <input type="hidden" name="utmCampaign" value={attribution?.utmCampaign || ""} />
      <input type="hidden" name="utmContent" value={attribution?.utmContent || ""} />

      <div className="grid gap-5 md:grid-cols-2">
        {!compact && <TextField name="name" label="Name" />}
        <TextField name="email" label="Email" type="email" required />
        <TextField
          name="artworkTitle"
          label="Artwork or project"
          defaultValue={artworkTitle}
          placeholder={intent === "project" ? "Project, room, or collection" : "Artwork you saw"}
        />
        <TextField
          name="artworkSize"
          label={compact ? "Wall width (optional)" : "Artwork size"}
          placeholder={compact ? "e.g. 180 cm wall" : "e.g. 120 x 180 cm"}
        />
        {!compact && (
          <>
            <TextField name="preferredColors" label="Preferred colors" placeholder="Warm neutral, black and white..." />
            <SelectField name="roomType" label="Room type" options={roomTypes} />
            <SelectField name="budget" label="Budget (optional)" options={budgets} />
          </>
        )}
      </div>

      {!compact && (
        <label className="mt-5 block">
          <span className="text-sm font-medium">Message</span>
          <textarea
            name="message"
            rows={6}
            className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Tell us about your wall, room mood, style direction, deadline, shipping country, or reference ideas. Budget and framing can wait until the quote."
          />
        </label>
      )}

      {compact && (
        <label className="mt-5 block">
          <span className="text-sm font-medium">Anything else? (optional)</span>
          <textarea
            name="message"
            rows={3}
            className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Room mood, furniture, or which size you are considering."
          />
        </label>
      )}

      <label className="mt-5 block">
        <span className="text-sm font-medium">Room photo (optional)</span>
        <span className="mt-1 block text-xs text-stone-500">Up to {MAX_PHOTOS} photos, 10MB each. A wall photo with width noted is enough for a first size recommendation.</span>
        <input
          ref={fileInputRef}
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="mt-2 w-full border border-dashed border-stone-300 bg-white px-4 py-3 text-sm file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:text-white"
        />
        {photoNames.length > 0 && (
          <span className="mt-2 block text-xs text-stone-500">{photoNames.length} photo{photoNames.length > 1 ? "s" : ""} selected: {photoNames.join(", ")}</span>
        )}
      </label>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={submitting || submitted}
          className="bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {submitting ? "Sending..." : submitted ? "Request sent" : compact ? "Request size advice" : "Send Request"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="border border-stone-300 px-6 py-4 text-sm font-medium transition hover:border-black"
        >
          Send by WhatsApp
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-stone-600">{status}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </form>
  )
}

function TextField({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      />
    </label>
  )
}

function SelectField({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select
        name={name}
        className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function buildRequestMessage(form: FormData, intent: EnquiryIntent) {
  return [
    intent === "size-advice" ? "Size advice request" : intent === "project" ? "Project art enquiry" : "Custom painting request",
    "",
    `Name: ${field(form, "name")}`,
    `Email: ${field(form, "email")}`,
    `Artwork: ${field(form, "artworkTitle")}`,
    `Size or wall width: ${field(form, "artworkSize")}`,
    `Preferred colors: ${field(form, "preferredColors")}`,
    `Room type: ${field(form, "roomType")}`,
    `Budget: ${field(form, "budget")}`,
    "",
    "Message:",
    field(form, "message"),
    "",
    "Note: I will share room photos or reference images separately if needed.",
  ].join("\n")
}

function field(form: FormData, name: string) {
  return String(form.get(name) || "").trim() || "Not provided"
}
