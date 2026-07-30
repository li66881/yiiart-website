"use client"

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react"

type CustomPaintingRequestFormProps = {
  contactEmail: string
  whatsappNumber: string
}

const roomTypes = ["Living room", "Bedroom", "Dining room", "Office", "Entryway", "Hospitality space"]
const budgets = ["Under $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000 - $5,000", "$5,000+"]
const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 10 * 1024 * 1024

export default function CustomPaintingRequestForm({
  contactEmail,
  whatsappNumber,
}: CustomPaintingRequestFormProps) {
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [photoNames, setPhotoNames] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const whatsappBaseUrl = useMemo(() => `https://wa.me/${whatsappNumber}`, [whatsappNumber])

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
        setStatus("Request received. YiiArt will reply by email within 12 hours with sizing, palette, and pricing guidance.")
        formElement.reset()
        setPhotoNames([])
        return
      }

      if (response.status === 503) {
        // Online submission not configured yet - fall back to the email app flow.
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
    const message = buildRequestMessage(form)
    const subject = encodeURIComponent("YiiArt custom painting request")
    const body = encodeURIComponent(message)

    setStatus("Opening your email app with the custom request details. Please attach your room photos in the email.")
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  const handleWhatsApp = () => {
    const form = document.getElementById("custom-painting-form") as HTMLFormElement | null
    const formData = form ? new FormData(form) : new FormData()
    const message = encodeURIComponent(buildRequestMessage(formData))
    window.open(`${whatsappBaseUrl}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  return (
    <form id="custom-painting-form" onSubmit={handleSubmit} className="border border-stone-200 bg-[#fbfaf6] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="name" label="Name" required />
        <TextField name="email" label="Email" type="email" required />
        <TextField name="artworkSize" label="Artwork size" placeholder="e.g. 120 x 180 cm" />
        <TextField name="preferredColors" label="Preferred colors" placeholder="Warm neutral, black and white..." />
        <SelectField name="roomType" label="Room type" options={roomTypes} />
        <SelectField name="budget" label="Budget" options={budgets} />
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium">Message</span>
        <textarea
          name="message"
          rows={6}
          className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          placeholder="Tell us about your wall, room mood, style direction, deadline, shipping country, or reference ideas."
        />
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-medium">Room or reference photos</span>
        <span className="mt-1 block text-xs text-stone-500">Up to {MAX_PHOTOS} photos, 10MB each. Wall photos help us confirm size and palette.</span>
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
          {submitting ? "Sending..." : submitted ? "Request sent" : "Send Request"}
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
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
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

function buildRequestMessage(form: FormData) {
  return [
    "Custom Painting Request",
    "",
    `Name: ${field(form, "name")}`,
    `Email: ${field(form, "email")}`,
    `Artwork size: ${field(form, "artworkSize")}`,
    `Preferred colors: ${field(form, "preferredColors")}`,
    `Room type: ${field(form, "roomType")}`,
    `Budget: ${field(form, "budget")}`,
    "",
    "Message:",
    field(form, "message"),
    "",
    "Note: I will share room photos or reference images separately.",
  ].join("\n")
}

function field(form: FormData, name: string) {
  return String(form.get(name) || "").trim() || "Not provided"
}
