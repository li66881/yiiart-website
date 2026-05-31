"use client"

import { FormEvent, useState } from "react"

type ReviewSubmitFormProps = {
  token: string
}

const ratingFields = [
  ["overallRating", "Overall rating"],
  ["artworkQualityRating", "Artwork quality"],
  ["textureColorAccuracyRating", "Texture & color accuracy"],
  ["packagingDeliveryRating", "Packaging & delivery"],
  ["customerSupportRating", "Customer support"],
  ["roomFitRating", "Room fit"],
] as const

export default function ReviewSubmitForm({ token }: ReviewSubmitFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const form = new FormData(event.currentTarget)
      form.set("token", token)
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        body: form,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Review could not be submitted.")
      }

      event.currentTarget.reset()
      setStatus("success")
      setMessage("Thank you for sharing your experience. Your review will be checked before it appears on YiiArt.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Review could not be submitted.")
    }
  }

  if (status === "success") {
    return (
      <div className="border bg-gray-50 p-6">
        <h2 className="text-xl font-medium">Thank you for sharing your experience.</h2>
        <p className="mt-3 text-gray-600">Your review will be checked before it appears on YiiArt.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {ratingFields.map(([name, label]) => (
          <label key={name} className="block">
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <select name={name} required defaultValue="5" className="w-full border px-3 py-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField name="reviewTitle" label="Review title" required />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Room type</span>
          <select name="roomType" className="w-full border px-3 py-2" defaultValue="Living Room">
            {["Living Room", "Bedroom", "Dining Room", "Office", "Entryway", "Studio", "Other"].map((room) => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Review text</span>
            <textarea name="reviewText" required minLength={20} className="h-32 w-full border px-3 py-2" />
          </label>
        </div>
        <TextField name="customerName" label="Display name" required placeholder="Emily R." />
        <TextField name="customerCity" label="City" />
        <TextField name="customerCountry" label="Country" required />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Upload photos</span>
          <input name="photos" type="file" accept="image/*" multiple className="w-full border px-3 py-2" />
        </label>
      </div>

      <div className="mt-6 space-y-3 text-sm text-gray-600">
        <Checkbox name="realExperience" label="I confirm this review reflects my real experience with this artwork." required />
        <Checkbox name="displayPermission" label="I allow YiiArt to display my review on the website." required />
        <Checkbox name="photoPermission" label="I allow YiiArt to display my uploaded photos on the website." />
      </div>

      {message && (
        <p className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`} aria-live="polite">
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="mt-6 w-full bg-black py-3 text-white disabled:opacity-50">
        {status === "loading" ? "Submitting..." : "Submit review"}
      </button>
    </form>
  )
}

function TextField({
  name,
  label,
  required,
  placeholder,
}: {
  name: string
  label: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} required={required} placeholder={placeholder} className="w-full border px-3 py-2" />
    </label>
  )
}

function Checkbox({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="flex gap-3">
      <input name={name} type="checkbox" required={required} className="mt-1" />
      <span>{label}</span>
    </label>
  )
}
