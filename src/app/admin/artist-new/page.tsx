"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"

type Result = {
  type: "success" | "error"
  message: string
}

export default function ArtistNewPage() {
  const [nameZh, setNameZh] = useState("黄亮")
  const [nameEn, setNameEn] = useState("Huang Liang")
  const [location, setLocation] = useState("Beijing")
  const [style, setStyle] = useState("Abstract, Oil painting")
  const [bioZh, setBioZh] = useState("中国当代艺术家，专注于手绘艺术创作。")
  const [bioEn, setBioEn] = useState("Contemporary Chinese artist specializing in hand-drawn artworks.")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameZh, nameEn, location, style, bioZh, bioEn, password }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to create artist.")
      }

      setResult({
        type: "success",
        message: `Artist "${nameZh}" created. Slug: ${data.slug}`,
      })
      setPassword("")
    } catch (error) {
      setResult({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to create artist.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-black">
            Back to admin
          </Link>

          <div className="mt-4 mb-8">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Artists</p>
            <h1 className="text-3xl font-light">Create artist</h1>
            <p className="mt-3 text-gray-600">
              Create an artist profile in Sanity. Publishing requires ADMIN_PASSWORD and SANITY_WRITE_TOKEN.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="border bg-white p-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Chinese name">
                <input value={nameZh} onChange={(event) => setNameZh(event.target.value)} required className={inputClass} />
              </Field>
              <Field label="English name">
                <input value={nameEn} onChange={(event) => setNameEn(event.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Location">
                <input value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass} />
              </Field>
              <Field label="Styles, separated by commas">
                <input value={style} onChange={(event) => setStyle(event.target.value)} className={inputClass} />
              </Field>
            </div>

            <Field label="Chinese bio">
              <textarea value={bioZh} onChange={(event) => setBioZh(event.target.value)} rows={4} className={textareaClass} />
            </Field>

            <Field label="English bio">
              <textarea value={bioEn} onChange={(event) => setBioEn(event.target.value)} rows={4} className={textareaClass} />
            </Field>

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
              {loading ? "Creating..." : "Create artist"}
            </button>

            {result && (
              <div className={`border p-4 text-sm ${result.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                {result.message}
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

const inputClass = "w-full border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
const textareaClass = `${inputClass} resize-y`
