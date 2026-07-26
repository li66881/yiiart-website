"use client"

import Link from "next/link"

export default function ArtworksError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-light tracking-tight text-stone-900">The gallery could not be loaded</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Something went wrong while loading the collection. Please try again in a moment.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
