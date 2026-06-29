"use client"

import { ChangeEvent, FormEvent, useRef, useState } from "react"
import {
  CUSTOM_PAINTING_ALLOWED_TYPES,
  CUSTOM_PAINTING_BUDGETS,
  CUSTOM_PAINTING_MAX_FILES,
  CUSTOM_PAINTING_MAX_FILE_SIZE,
  CUSTOM_PAINTING_ROOM_TYPES,
  validateUploadFiles,
  type CustomPaintingAsset,
} from "@/lib/custom-painting-request"

type CustomPaintingRequestFormProps = {
  whatsappNumber: string
}

type UploadAuthorization = CustomPaintingAsset & {
  uploadUrl: string
}

type FormStatus = {
  kind: "idle" | "working" | "error" | "success"
  message: string
}

export default function CustomPaintingRequestForm({
  whatsappNumber,
}: CustomPaintingRequestFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<FormStatus>({ kind: "idle", message: "" })
  const [reference, setReference] = useState("")
  const whatsappBaseUrl = `https://wa.me/${whatsappNumber}`
  const isWorking = status.kind === "working"

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(
      new Map(
        [...files, ...Array.from(event.target.files || [])].map((file) => [fileFingerprint(file), file])
      ).values()
    )
    const validation = validateUploadFiles(nextFiles.map(fileMetadata))

    if (!validation.ok) {
      setStatus({ kind: "error", message: validation.error })
      event.target.value = ""
      return
    }

    setFiles(nextFiles)
    setStatus({ kind: "idle", message: "" })
    event.target.value = ""
  }

  const removeFile = (fingerprint: string) => {
    setFiles((current) => current.filter((file) => fileFingerprint(file) !== fingerprint))
    setStatus({ kind: "idle", message: "" })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const formData = new FormData(formElement)

    setStatus({ kind: "working", message: files.length > 0 ? "Preparing your images..." : "Sending your request..." })

    try {
      const assets = files.length > 0 ? await uploadFiles(files, setStatus) : []
      setStatus({ kind: "working", message: "Saving your custom painting request..." })

      const response = await fetch("/api/custom-painting/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          artworkSize: formData.get("artworkSize"),
          preferredColors: formData.get("preferredColors"),
          roomType: formData.get("roomType"),
          budget: formData.get("budget"),
          message: formData.get("message"),
          company: formData.get("company"),
          assets,
        }),
      })
      const result = await readJson(response)

      if (!response.ok || !result.success || typeof result.reference !== "string") {
        throw new Error(result.error || "Your request could not be submitted. Please try again.")
      }

      setReference(result.reference)
      setStatus({
        kind: "success",
        message: "Your request has been received. Our studio will review the details and reply by email.",
      })
      formElement.reset()
      setFiles([])
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Your request could not be submitted. Please try again.",
      })
    }
  }

  const handleWhatsApp = () => {
    const formData = formRef.current ? new FormData(formRef.current) : new FormData()
    const message = encodeURIComponent(buildRequestMessage(formData, files.length))
    window.open(`${whatsappBaseUrl}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  if (status.kind === "success") {
    return (
      <div className="border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 md:p-8" role="status">
        <p className="text-sm font-medium uppercase">Request received</p>
        <h3 className="mt-3 text-3xl font-light">Thank you. Our studio will review your project.</h3>
        <p className="mt-4 max-w-2xl text-sm leading-6">{status.message}</p>
        <p className="mt-4 text-sm font-medium">Request reference: {reference}</p>
        <button
          type="button"
          onClick={() => {
            setReference("")
            setStatus({ kind: "idle", message: "" })
          }}
          className="mt-7 border border-emerald-900 px-5 py-3 text-sm font-medium transition hover:bg-emerald-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Start another request
        </button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      id="custom-painting-form"
      onSubmit={handleSubmit}
      className="border border-stone-200 bg-[#fbfaf6] p-6 md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="name" label="Name" autoComplete="name" required />
        <TextField name="email" label="Email" type="email" autoComplete="email" required />
        <TextField name="artworkSize" label="Artwork size" placeholder="e.g. 120 x 180 cm" />
        <TextField name="preferredColors" label="Preferred colors" placeholder="Warm neutral, black and white..." />
        <SelectField name="roomType" label="Room type" options={CUSTOM_PAINTING_ROOM_TYPES} />
        <SelectField name="budget" label="Budget" options={CUSTOM_PAINTING_BUDGETS} />
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium">Project details</span>
        <textarea
          name="message"
          rows={6}
          maxLength={3000}
          className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-stone-400"
          placeholder="Tell us about your wall, room mood, style direction, deadline, shipping country, or reference ideas."
        />
      </label>

      <div className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <label htmlFor="custom-reference-images" className="text-sm font-medium">
              Room photos and reference images
            </label>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Optional. Up to {CUSTOM_PAINTING_MAX_FILES} JPG, PNG, or WebP images, 10 MB each.
            </p>
          </div>
          <span className="text-xs text-stone-500">{files.length}/{CUSTOM_PAINTING_MAX_FILES} selected</span>
        </div>

        <label
          htmlFor="custom-reference-images"
          aria-disabled={isWorking || files.length >= CUSTOM_PAINTING_MAX_FILES}
          className={`mt-3 flex min-h-24 w-full items-center justify-center border border-dashed border-stone-400 bg-white px-5 py-4 text-center text-sm font-medium transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 ${
            isWorking || files.length >= CUSTOM_PAINTING_MAX_FILES
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-black"
          }`}
        >
          Choose room photos or inspiration images
        </label>
        <input
          id="custom-reference-images"
          type="file"
          accept={CUSTOM_PAINTING_ALLOWED_TYPES.join(",")}
          multiple
          onChange={handleFiles}
          disabled={isWorking || files.length >= CUSTOM_PAINTING_MAX_FILES}
          className="sr-only"
        />

        {files.length > 0 && (
          <ul className="mt-3 divide-y divide-stone-200 border border-stone-200 bg-white" aria-label="Selected images">
            {files.map((file) => {
              const fingerprint = fileFingerprint(file)
              return (
                <li key={fingerprint} className="flex min-w-0 items-center justify-between gap-4 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{file.name}</span>
                    <span className="mt-0.5 block text-xs text-stone-500">{formatBytes(file.size)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(fingerprint)}
                    disabled={isWorking}
                    className="shrink-0 text-xs font-medium underline underline-offset-4 disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={isWorking}
          className="bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {isWorking ? "Sending request..." : "Send Custom Request"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={isWorking}
          className="border border-stone-300 px-6 py-4 text-sm font-medium transition hover:border-black disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Continue on WhatsApp
        </button>
      </div>

      {status.message && (
        <div
          className={`mt-5 border px-4 py-4 text-sm leading-6 ${
            status.kind === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-stone-200 bg-white text-stone-600"
          }`}
          role={status.kind === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <p>{status.message}</p>
          {reference && <p className="mt-1 font-medium">Request reference: {reference}</p>}
        </div>
      )}
    </form>
  )
}

async function uploadFiles(files: File[], setStatus: (status: FormStatus) => void) {
  const authorizationResponse = await fetch("/api/custom-painting/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: files.map(fileMetadata) }),
  })
  const authorization = await readJson(authorizationResponse)

  if (!authorizationResponse.ok || !Array.isArray(authorization.uploads)) {
    throw new Error(authorization.error || "Image upload could not be started. Please try again.")
  }

  const uploads = authorization.uploads as UploadAuthorization[]
  const assets: CustomPaintingAsset[] = []

  for (let index = 0; index < files.length; index += 1) {
    setStatus({
      kind: "working",
      message: `Uploading image ${index + 1} of ${files.length}...`,
    })

    const upload = uploads[index]
    const response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": files[index].type,
        "Cache-Control": "private, no-store",
      },
      body: files[index],
    })

    if (!response.ok) {
      throw new Error(`Image ${index + 1} could not be uploaded. Please try again.`)
    }

    assets.push({
      key: upload.key,
      url: upload.url,
      contentType: upload.contentType,
      size: upload.size,
      originalName: upload.originalName,
    })
  }

  return assets
}

async function readJson(response: Response): Promise<Record<string, any>> {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

function TextField({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-stone-400"
      />
    </label>
  )
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string
  label: string
  options: readonly string[]
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select
        name={name}
        className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-stone-400"
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function buildRequestMessage(form: FormData, fileCount: number) {
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
    "Project details:",
    field(form, "message"),
    "",
    fileCount > 0
      ? `I have ${fileCount} reference image${fileCount === 1 ? "" : "s"} to attach in WhatsApp.`
      : "I can attach room photos or reference images in WhatsApp if needed.",
  ].join("\n")
}

function field(form: FormData, name: string) {
  return String(form.get(name) || "").trim() || "Not provided"
}

function fileMetadata(file: File) {
  return { name: file.name, type: file.type, size: file.size }
}

function fileFingerprint(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function formatBytes(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(size / 1024))} KB`
}
