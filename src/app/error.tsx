"use client"

import { useEffect } from "react"
import {
  isRecoverableNavigationError,
  reloadForStaleAssets,
} from "@/lib/recoverable-navigation-error"

export default function StorefrontError({
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
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center text-[#171717]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#6f6f6f]">YiiArt</p>
      <h1 className="mt-4 text-2xl font-light">This page could not be loaded</h1>
      <p className="mt-3 text-sm leading-6 text-[#555]">
        A newer version of the site may have been published. Refresh to continue shopping.
      </p>
      <button
        type="button"
        onClick={() => {
          reset()
          window.location.reload()
        }}
        className="mt-8 bg-[#171717] px-6 py-3 text-sm text-white"
      >
        Refresh
      </button>
    </main>
  )
}
