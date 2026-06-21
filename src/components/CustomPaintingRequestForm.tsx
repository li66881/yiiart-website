"use client"

import { FormEvent, useMemo, useState } from "react"

type CustomPaintingRequestFormProps = {
  contactEmail: string
  whatsappNumber: string
}

const roomTypes = ["Living room", "Bedroom", "Dining room", "Office", "Entryway", "Hospitality space"]
const budgets = ["Under $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000 - $5,000", "$5,000+"]

export default function CustomPaintingRequestForm({
  contactEmail,
  whatsappNumber,
}: CustomPaintingRequestFormProps) {
  const [status, setStatus] = useState("")

  const whatsappBaseUrl = useMemo(() => `https://wa.me/${whatsappNumber}`, [whatsappNumber])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const message = buildRequestMessage(form)
    const subject = encodeURIComponent("YiiArt custom painting request")
    const body = encodeURIComponent(message)

    setStatus("Opening your email app with the custom request details.")
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

      <div className="mt-5 border border-dashed border-stone-300 bg-white p-4 text-sm leading-6 text-stone-600">
        Upload image: not connected yet. Please attach room photos or reference images in the email app after this form opens,
        or send them directly on WhatsApp.
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="submit" className="bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-800">
          Send by Email
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="border border-stone-300 px-6 py-4 text-sm font-medium transition hover:border-black"
        >
          Send by WhatsApp
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-stone-500">{status}</p>}
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
    "Image upload note: I will attach room photos or reference images separately.",
  ].join("\n")
}

function field(form: FormData, name: string) {
  return String(form.get(name) || "").trim() || "Not provided"
}
