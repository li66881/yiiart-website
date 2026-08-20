"use client"

import { useEffect } from "react"
import {
  isRecoverableNavigationError,
  reloadForStaleAssets,
} from "@/lib/recoverable-navigation-error"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (isRecoverableNavigationError(error)) {
      reloadForStaleAssets()
    }
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Georgia, serif", color: "#171717", background: "#fff" }}>
        <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", padding: "48px 24px" }}>
          <div>
            <p style={{ letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 11, color: "#6f6f6f" }}>YiiArt</p>
            <h1 style={{ fontWeight: 400, fontSize: 28, margin: "16px 0 0" }}>This page could not be loaded</h1>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, maxWidth: 420, margin: "12px auto 0" }}>
              Refresh to load the latest version of the site, then try the link again.
            </p>
            <button
              type="button"
              onClick={() => {
                reset()
                window.location.reload()
              }}
              style={{ marginTop: 32, background: "#171717", color: "#fff", border: 0, padding: "12px 24px", fontSize: 14 }}
            >
              Refresh
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
