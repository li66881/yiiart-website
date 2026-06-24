"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"

type Artist = {
  _id: string
  name?: {
    zh?: string
    en?: string
  }
}

type Result = {
  type: "success" | "error"
  message: string
  slug?: string
}

const mediums = ["Oil on Canvas", "Acrylic on Canvas", "Oil on Panel", "Mixed Media"]
const categories = ["Abstract", "Landscape", "Portrait", "Texture", "Wabi-sabi", "Minimalist"]
const roomTypeOptions = ["Living room", "Bedroom", "Dining room", "Entryway", "Office", "Hospitality space"]
const colorFamilyOptions = ["Neutral", "White", "Black", "Gray", "Blue", "Green", "Red", "Pink", "Yellow", "Orange", "Earth tone", "Multicolor"]
const orientationOptions = ["Portrait", "Landscape", "Square"]
const shippingProfileOptions = ["Ships stretched", "Ships rolled", "Confirm before dispatch", "Oversized freight"]

export default function NewArtworkPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [artistId, setArtistId] = useState("")
  const [titleZh, setTitleZh] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [price, setPrice] = useState("")
  const [dimensions, setDimensions] = useState("")
  const [widthCm, setWidthCm] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [medium, setMedium] = useState(mediums[0])
  const [category, setCategory] = useState(categories[0])
  const [roomTypes, setRoomTypes] = useState<string[]>([])
  const [colorFamilies, setColorFamilies] = useState<string[]>([])
  const [orientation, setOrientation] = useState("")
  const [surfaceFinish, setSurfaceFinish] = useState("")
  const [framingNotes, setFramingNotes] = useState("")
  const [shippingProfile, setShippingProfile] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [socialCaption, setSocialCaption] = useState("")
  const [descriptionZh, setDescriptionZh] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [featured, setFeatured] = useState(false)
  const [password, setPassword] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    fetch("/api/admin/artists")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.artists)) {
          setArtists(data.artists)
        }
      })
      .catch(() => setArtists([]))
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("password", password)
    formData.append("artistId", artistId)
    formData.append("titleZh", titleZh)
    formData.append("titleEn", titleEn)
    formData.append("price", price)
    formData.append("dimensions", dimensions)
    formData.append("widthCm", widthCm)
    formData.append("heightCm", heightCm)
    formData.append("medium", medium)
    formData.append("category", category)
    roomTypes.forEach((value) => formData.append("roomTypes", value))
    colorFamilies.forEach((value) => formData.append("colorFamilies", value))
    formData.append("orientation", orientation)
    formData.append("surfaceFinish", surfaceFinish)
    formData.append("framingNotes", framingNotes)
    formData.append("shippingProfile", shippingProfile)
    formData.append("seoKeywords", seoKeywords)
    formData.append("socialCaption", socialCaption)
    formData.append("descriptionZh", descriptionZh)
    formData.append("descriptionEn", descriptionEn)
    formData.append("featured", String(featured))

    Array.from(files || []).forEach((file) => formData.append("images", file))

    try {
      const response = await fetch("/api/admin/create-artwork", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to create artwork.")
      }

      setResult({
        type: "success",
        message: `Artwork created. Slug: ${data.slug}`,
        slug: data.slug,
      })
      setPassword("")
    } catch (error) {
      setResult({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to create artwork.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-black">
            Back to admin
          </Link>

          <div className="mt-4 mb-8">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Inventory</p>
            <h1 className="text-3xl font-light">Create artwork</h1>
            <p className="mt-3 text-gray-600">
              Upload image files from your computer and publish a saleable artwork to Sanity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="border bg-white p-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Chinese title">
                <input value={titleZh} onChange={(event) => setTitleZh(event.target.value)} className={inputClass} />
              </Field>
              <Field label="English title">
                <input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Base price (CNY)">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Dimensions">
                <input
                  value={dimensions}
                  onChange={(event) => setDimensions(event.target.value)}
                  placeholder="60 x 80 cm"
                  className={inputClass}
                />
              </Field>
              <Field label="Artist">
                <select value={artistId} onChange={(event) => setArtistId(event.target.value)} className={inputClass}>
                  <option value="">No artist selected</option>
                  {artists.map((artist) => (
                    <option key={artist._id} value={artist._id}>
                      {artist.name?.zh || artist.name?.en || artist._id}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Artwork width (cm)">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={widthCm}
                  onChange={(event) => setWidthCm(event.target.value)}
                  placeholder="80"
                  className={inputClass}
                />
              </Field>
              <Field label="Artwork height (cm)">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                  placeholder="120"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Medium">
                <select value={medium} onChange={(event) => setMedium(event.target.value)} className={inputClass}>
                  {mediums.map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                  {categories.map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <OptionGroup
                label="Recommended rooms"
                options={roomTypeOptions}
                selected={roomTypes}
                onToggle={(value) => setRoomTypes((current) => toggleOption(current, value))}
              />
              <OptionGroup
                label="Color families"
                options={colorFamilyOptions}
                selected={colorFamilies}
                onToggle={(value) => setColorFamilies((current) => toggleOption(current, value))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Orientation">
                <select value={orientation} onChange={(event) => setOrientation(event.target.value)} className={inputClass}>
                  <option value="">Infer from dimensions</option>
                  {orientationOptions.map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="Surface / texture note">
                <input
                  value={surfaceFinish}
                  onChange={(event) => setSurfaceFinish(event.target.value)}
                  placeholder="Layered texture, matte surface"
                  className={inputClass}
                />
              </Field>
              <Field label="Shipping profile">
                <select value={shippingProfile} onChange={(event) => setShippingProfile(event.target.value)} className={inputClass}>
                  <option value="">No profile</option>
                  {shippingProfileOptions.map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Framing notes">
              <textarea
                value={framingNotes}
                onChange={(event) => setFramingNotes(event.target.value)}
                rows={3}
                className={textareaClass}
              />
            </Field>

            <Field label="SEO keywords, separated by commas">
              <input
                value={seoKeywords}
                onChange={(event) => setSeoKeywords(event.target.value)}
                placeholder="living room art, neutral canvas art"
                className={inputClass}
              />
            </Field>

            <Field label="Social caption">
              <textarea
                value={socialCaption}
                onChange={(event) => setSocialCaption(event.target.value)}
                rows={3}
                className={textareaClass}
              />
            </Field>

            <Field label="Images">
              <input
                type="file"
                accept="image/*"
                multiple
                required
                onChange={(event) => setFiles(event.target.files)}
                className="block w-full text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                Choose images from Desktop / 网站素材. Multiple files become the artwork gallery.
              </p>
            </Field>

            <Field label="Chinese description">
              <textarea value={descriptionZh} onChange={(event) => setDescriptionZh(event.target.value)} rows={4} className={textareaClass} />
            </Field>

            <Field label="English description">
              <textarea value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} rows={4} className={textareaClass} />
            </Field>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
              Feature this artwork on the home page
            </label>

            <Field label="Admin password">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black py-3 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish artwork"}
            </button>

            {result && (
              <div className={`border p-4 text-sm ${result.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                <p>{result.message}</p>
                {result.slug && (
                  <Link href={`/artwork/${result.slug}`} className="mt-2 inline-block underline">
                    View artwork
                  </Link>
                )}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )
}

function OptionGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset className="border p-4">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function toggleOption(current: string[], value: string) {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
}

const inputClass = "w-full border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
const textareaClass = `${inputClass} resize-y`
