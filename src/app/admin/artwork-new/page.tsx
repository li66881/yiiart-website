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

type SizeDraft = {
  id: string
  label: string
  widthCm: string
  heightCm: string
  priceCny: string
}

type FinishDraft = {
  id: string
  label: string
  priceDeltaCny: string
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
  const [collectionType, setCollectionType] = useState("new_collection")
  const [productionModel, setProductionModel] = useState("hand_painted_to_order")
  const [rightsStatus, setRightsStatus] = useState("needs_review")
  const [migrationStatus, setMigrationStatus] = useState("needs_rights_review")
  const [titleZh, setTitleZh] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [catalogCode, setCatalogCode] = useState("")
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
  const [shortDescription, setShortDescription] = useState("")
  const [artworkStory, setArtworkStory] = useState("")
  const [materials, setMaterials] = useState("")
  const [creationWindow, setCreationWindow] = useState("Painted in 7-12 business days.")
  const [standardSizes, setStandardSizes] = useState<SizeDraft[]>([
    { id: "80x100", label: "80 x 100 cm", widthCm: "80", heightCm: "100", priceCny: "" },
  ])
  const [frameOptions, setFrameOptions] = useState<FinishDraft[]>([
    { id: "rolled", label: "Rolled canvas", priceDeltaCny: "0" },
  ])
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
    formData.append("collectionType", collectionType)
    formData.append("productionModel", productionModel)
    formData.append("rightsStatus", rightsStatus)
    formData.append("migrationStatus", migrationStatus)
    formData.append("titleZh", titleZh)
    formData.append("titleEn", titleEn)
    formData.append("catalogCode", catalogCode)
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
    formData.append("shortDescription", shortDescription)
    formData.append("artworkStory", artworkStory)
    formData.append("materials", materials)
    formData.append("creationWindow", creationWindow)
    formData.append("standardSizes", JSON.stringify(standardSizes.map((size) => ({
      ...size,
      widthCm: Number(size.widthCm),
      heightCm: Number(size.heightCm),
      priceCny: Number(size.priceCny),
    }))))
    formData.append("frameOptions", JSON.stringify(frameOptions.map((finish) => ({
      ...finish,
      priceDeltaCny: Number(finish.priceDeltaCny),
    }))))
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Storefront collection">
                <select value={collectionType} onChange={(event) => setCollectionType(event.target.value)} className={inputClass}>
                  <option value="new_collection">New Collection</option>
                  <option value="artist_collection">Artist Collection</option>
                </select>
              </Field>
              <Field label="Production model">
                <select value={productionModel} onChange={(event) => setProductionModel(event.target.value)} className={inputClass}>
                  <option value="hand_painted_to_order">Hand-painted to order</option>
                  <option value="original">Existing original artwork</option>
                </select>
              </Field>
              <Field label="Rights status">
                <select value={rightsStatus} onChange={(event) => setRightsStatus(event.target.value)} className={inputClass}>
                  <option value="needs_review">Needs review</option>
                  <option value="approved">Approved for storefront</option>
                  <option value="blocked">Blocked</option>
                </select>
              </Field>
              <Field label="Migration status">
                <select value={migrationStatus} onChange={(event) => setMigrationStatus(event.target.value)} className={inputClass}>
                  <option value="needs_rights_review">Needs rights review</option>
                  <option value="needs_copy">Needs English copy</option>
                  <option value="needs_images">Needs images</option>
                  <option value="ready">Ready</option>
                  <option value="archive">Archive</option>
                </select>
              </Field>
            </div>

            <p className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Products remain internal until rights and migration status are reviewed. Only approved, ready records should be promoted in the New Collection.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Chinese title">
                <input value={titleZh} onChange={(event) => setTitleZh(event.target.value)} className={inputClass} />
              </Field>
              <Field label="English title">
                <input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} className={inputClass} />
              </Field>
            </div>

            <Field label="Catalog / source code">
              <input
                value={catalogCode}
                onChange={(event) => setCatalogCode(event.target.value)}
                placeholder="80-120-13"
                className={inputClass}
              />
            </Field>

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

            {productionModel === "hand_painted_to_order" && (
              <fieldset className="space-y-4 border p-4">
                <legend className="px-1 text-sm font-medium">Standard sizes and authoritative prices</legend>
                {standardSizes.map((size, index) => (
                  <div key={`${size.id}-${index}`} className="grid gap-3 border-b pb-4 md:grid-cols-5">
                    <Field label="ID">
                      <input value={size.id} onChange={(event) => setStandardSizes((current) => updateDraft(current, index, "id", event.target.value))} className={inputClass} required />
                    </Field>
                    <Field label="Label">
                      <input value={size.label} onChange={(event) => setStandardSizes((current) => updateDraft(current, index, "label", event.target.value))} className={inputClass} required />
                    </Field>
                    <Field label="Width cm">
                      <input type="number" min="1" value={size.widthCm} onChange={(event) => setStandardSizes((current) => updateDraft(current, index, "widthCm", event.target.value))} className={inputClass} />
                    </Field>
                    <Field label="Height cm">
                      <input type="number" min="1" value={size.heightCm} onChange={(event) => setStandardSizes((current) => updateDraft(current, index, "heightCm", event.target.value))} className={inputClass} />
                    </Field>
                    <Field label="Price CNY">
                      <input type="number" min="1" value={size.priceCny} onChange={(event) => setStandardSizes((current) => updateDraft(current, index, "priceCny", event.target.value))} className={inputClass} required />
                    </Field>
                    {standardSizes.length > 1 && (
                      <button type="button" onClick={() => setStandardSizes((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-left text-sm text-red-600">
                        Remove size
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setStandardSizes((current) => [...current, { id: `size-${current.length + 1}`, label: "", widthCm: "", heightCm: "", priceCny: "" }])} className="text-sm underline underline-offset-4">
                  Add another size
                </button>
              </fieldset>
            )}

            <fieldset className="space-y-4 border p-4">
              <legend className="px-1 text-sm font-medium">Finish and frame options</legend>
              {frameOptions.map((finish, index) => (
                <div key={`${finish.id}-${index}`} className="grid gap-3 border-b pb-4 md:grid-cols-3">
                  <Field label="ID">
                    <input value={finish.id} onChange={(event) => setFrameOptions((current) => updateDraft(current, index, "id", event.target.value))} className={inputClass} required />
                  </Field>
                  <Field label="Label">
                    <input value={finish.label} onChange={(event) => setFrameOptions((current) => updateDraft(current, index, "label", event.target.value))} className={inputClass} required />
                  </Field>
                  <Field label="Additional price CNY">
                    <input type="number" min="0" value={finish.priceDeltaCny} onChange={(event) => setFrameOptions((current) => updateDraft(current, index, "priceDeltaCny", event.target.value))} className={inputClass} required />
                  </Field>
                  {frameOptions.length > 1 && (
                    <button type="button" onClick={() => setFrameOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-left text-sm text-red-600">
                      Remove finish
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setFrameOptions((current) => [...current, { id: `finish-${current.length + 1}`, label: "", priceDeltaCny: "0" }])} className="text-sm underline underline-offset-4">
                Add another finish
              </button>
            </fieldset>

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

            <Field label="Short English product description">
              <textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} rows={2} maxLength={240} className={textareaClass} />
            </Field>

            <Field label="Artwork story">
              <textarea value={artworkStory} onChange={(event) => setArtworkStory(event.target.value)} rows={4} className={textareaClass} />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Materials and details">
                <textarea value={materials} onChange={(event) => setMaterials(event.target.value)} rows={3} className={textareaClass} />
              </Field>
              <Field label="Creation window">
                <textarea value={creationWindow} onChange={(event) => setCreationWindow(event.target.value)} rows={3} className={textareaClass} />
              </Field>
            </div>

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

function updateDraft<T extends Record<string, string>, K extends keyof T>(
  current: T[],
  index: number,
  key: K,
  value: T[K],
) {
  return current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)
}

const inputClass = "w-full border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
const textareaClass = `${inputClass} resize-y`
