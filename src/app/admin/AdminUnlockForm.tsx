"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminUnlockForm({ nextPath = "/admin" }: { nextPath?: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to unlock admin.")
      }

      setPassword("")
      if (window.location.pathname === "/admin-unlock") {
        router.push(nextPath)
      } else {
        router.refresh()
      }
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : "Unable to unlock admin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border bg-white p-6">
        <p className="mb-2 text-sm uppercase tracking-widest text-gray-500">YiiArt operations</p>
        <h1 className="text-2xl font-light">Admin access</h1>
        <p className="mt-3 text-sm text-gray-600">
          Enter the admin password to open publishing tools.
        </p>

        <label className="mt-6 block text-sm font-medium">
          <span className="mb-1 block">Admin password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </label>

        {error && (
          <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-black py-3 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Unlocking..." : "Unlock admin"}
        </button>
      </form>
    </main>
  )
}
