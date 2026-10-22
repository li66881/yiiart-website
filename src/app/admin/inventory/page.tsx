"use client"

import { useState } from "react"
import Link from "next/link"

type Artwork = {
  _id: string
  title?: string
  catalogCode?: string
  availability?: string
  allowCheckout?: boolean
  slug?: string
}

export default function InventoryPage() {
  const [password, setPassword] = useState("")
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function request(action: string, artworkId?: string) {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action, artworkId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Inventory is unavailable.")
      if (action === "list") setArtworks(result.artworks || [])
      if (action === "sold_in_store") await requestList()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Inventory is unavailable.")
    } finally {
      setBusy(false)
    }
  }

  async function requestList() {
    const response = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "list" }),
    })
    if (!response.ok) throw new Error("Could not refresh inventory.")
    const result = await response.json()
    setArtworks(result.artworks || [])
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/admin" className="text-sm underline">Back to admin</Link>
      <h1 className="mt-6 text-3xl font-light">Original artwork inventory</h1>
      <div className="mt-8 flex max-w-md gap-3">
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="off" aria-label="Admin password" className="min-w-0 flex-1 border px-3 py-2" />
        <button type="button" disabled={busy || !password} onClick={() => void request("list")} className="bg-black px-4 py-2 text-white disabled:opacity-50">Load</button>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-8 divide-y border-t">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">{artwork.title || artwork.catalogCode || artwork._id}</p>
              <p className="text-sm text-gray-600">{artwork.catalogCode || artwork._id} · {artwork.availability || "available"}</p>
            </div>
            {artwork.availability === "available" && artwork.allowCheckout !== false && (
              <button type="button" disabled={busy} onClick={() => {
                if (window.confirm(`Mark ${artwork.title || artwork.catalogCode || artwork._id} sold in store?`)) void request("sold_in_store", artwork._id)
              }} className="border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">Mark sold in store</button>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
