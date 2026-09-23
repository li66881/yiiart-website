"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"

type Enquiry = {
  _id: string
  name?: string
  email?: string
  intent?: string
  clientRole?: string
  company?: string
  destinationCountry?: string
  artworkQuantity?: string
  projectTiming?: string
  artworkTitle?: string
  artworkSlug?: string
  artworkSize?: string
  preferredColors?: string
  roomType?: string
  budget?: string
  message?: string
  status?: string
  submittedAt?: string
  source?: string
  sourcePage?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
}

export default function AdminRequestsPage() {
  const [password, setPassword] = useState("")
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const loadEnquiries = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setEnquiries(null)
    try {
      const response = await fetch("/api/admin/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to load enquiries.")
      setEnquiries(data.enquiries)
      setPassword("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load enquiries.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6">
        <Link href="/admin" className="text-sm underline underline-offset-4">Back to admin</Link>
        <h1 className="mt-5 font-serif text-4xl">Enquiries</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Load the latest 100 custom painting, size advice, and project requests saved in Sanity. The password is used only for this request.</p>
        <form onSubmit={loadEnquiries} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm">Admin password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="off" className="mt-2 w-full border border-stone-300 bg-white px-4 py-3" />
          </label>
          <button type="submit" disabled={loading} className="self-end bg-stone-950 px-6 py-3 text-sm text-white disabled:bg-stone-400">{loading ? "Loading..." : "Load enquiries"}</button>
        </form>
        {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
        {enquiries && <div className="mt-10 space-y-5">
          <p className="text-sm text-stone-600">Showing {enquiries.length} most recent requests.</p>
          {enquiries.map((enquiry) => (
            <article key={enquiry._id} className="border border-stone-200 bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs uppercase tracking-widest text-stone-500">{enquiry.intent || "custom"} · {enquiry.status || "new"}</p><h2 className="mt-2 text-xl">{enquiry.name || "Unnamed enquiry"}</h2></div>
                <time className="text-xs text-stone-500">{enquiry.submittedAt ? new Date(enquiry.submittedAt).toLocaleString() : "Date unavailable"}</time>
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {enquiry.email && <p><strong>Email:</strong> <a href={`mailto:${enquiry.email}`} className="underline">{enquiry.email}</a></p>}
                {enquiry.clientRole && <p><strong>Role:</strong> {enquiry.clientRole}</p>}
                {enquiry.company && <p><strong>Company:</strong> {enquiry.company}</p>}
                {enquiry.destinationCountry && <p><strong>Destination:</strong> {enquiry.destinationCountry}</p>}
                {enquiry.artworkQuantity && <p><strong>Quantity:</strong> {enquiry.artworkQuantity}</p>}
                {enquiry.projectTiming && <p><strong>Timing:</strong> {enquiry.projectTiming}</p>}
                {enquiry.artworkTitle && <p><strong>Artwork or project:</strong> {enquiry.artworkTitle}</p>}
                {enquiry.artworkSize && <p><strong>Size:</strong> {enquiry.artworkSize}</p>}
                {enquiry.preferredColors && <p><strong>Colors:</strong> {enquiry.preferredColors}</p>}
                {enquiry.roomType && <p><strong>Room:</strong> {enquiry.roomType}</p>}
                {enquiry.budget && <p><strong>Budget:</strong> {enquiry.budget}</p>}
              </div>
              {enquiry.message && <p className="mt-5 whitespace-pre-wrap border-t border-stone-200 pt-5 text-sm leading-6">{enquiry.message}</p>}
              <p className="mt-4 text-xs text-stone-500">Source: {enquiry.source || enquiry.sourcePage || "Unknown"}{enquiry.utmCampaign ? ` · ${enquiry.utmCampaign}` : ""}</p>
            </article>
          ))}
        </div>}
      </main>
    </div>
  )
}
