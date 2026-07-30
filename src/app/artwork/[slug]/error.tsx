"use client"

import Link from "next/link"

export default function ArtworkError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-light tracking-tight text-stone-900">This artwork could not be loaded</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Something went wrong while loading this piece. Please try again, or browse the rest of the collection.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Try again
        </button>
        <Link
          href="/artworks"
          className="border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
        >
          Browse artworks
        </Link>
      </div>
    </main>
  )
}
