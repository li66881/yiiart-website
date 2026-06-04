"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { PriceText } from "@/components/PriceText"
import { useLanguage } from "@/context/LanguageContext"

type SearchResult = {
  id: string
  title: string
  artist: string
  href: string
  price: number
  image: string
  meta: string
}

type SearchDialogProps = {
  open: boolean
  onClose: () => void
}

const quickLinks = [
  { slug: "textured-wall-art", href: "/collections/textured-wall-art" },
  { slug: "abstract-art-for-living-room", href: "/collections/abstract-art-for-living-room" },
  { slug: "large-canvas-art", href: "/collections/large-canvas-art" },
  { slug: "wabi-sabi-wall-art", href: "/collections/wabi-sabi-wall-art" },
]

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [onClose, open])

  useEffect(() => {
    if (!open) return

    const cleanQuery = query.trim()
    if (cleanQuery.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        setResults(Array.isArray(data.results) ? data.results : [])
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 220)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [open, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/40" role="dialog" aria-modal="true" aria-label={t("search.ariaLabel")}>
      <div className="mx-auto mt-20 w-[min(46rem,calc(100vw-1.5rem))] border bg-white shadow-2xl">
        <div className="flex items-center border-b">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
            className="h-14 flex-1 px-4 text-base outline-none"
          />
          <button type="button" onClick={onClose} className="h-14 px-4 text-sm text-gray-500 hover:text-black">
            {t("search.close")}
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          {query.trim().length < 2 ? (
            <div>
              <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">{t("search.popular")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="border px-4 py-3 text-sm transition hover:bg-gray-50"
                  >
                    {t(`search.quickLinks.${link.slug}`)}
                  </Link>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="py-8 text-center text-sm text-gray-500">{t("search.searching")}</p>
          ) : results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.href}
                  onClick={onClose}
                  className="grid grid-cols-[4.5rem_1fr] gap-4 border p-3 transition hover:bg-gray-50"
                >
                  <div className="aspect-[4/5] bg-gray-100">
                    {result.image ? (
                      <img src={result.image} alt={result.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Art</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{result.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{result.artist}</p>
                    {result.meta && <p className="mt-2 line-clamp-2 text-xs text-gray-400">{result.meta}</p>}
                    <p className="mt-2 text-sm font-semibold"><PriceText amountCny={result.price} /></p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">{t("search.noResults")}</p>
              <Link href="/artworks" onClick={onClose} className="mt-3 inline-block text-sm underline underline-offset-4">
                {t("search.browseAll")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
