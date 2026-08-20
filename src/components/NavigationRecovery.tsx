"use client"

import { useEffect } from "react"
import {
  isRecoverableNavigationError,
  reloadForStaleAssets,
} from "@/lib/recoverable-navigation-error"

export default function NavigationRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isRecoverableNavigationError(event.error || event.message)) {
        reloadForStaleAssets()
      }
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isRecoverableNavigationError(event.reason)) {
        reloadForStaleAssets()
      }
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [])

  return null
}
