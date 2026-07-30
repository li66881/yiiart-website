import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Error 404</p>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-stone-900 sm:text-4xl">
          This page could not be found
        </h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          The page you are looking for may have moved or sold. Browse the current collection or return home.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/artworks"
            className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Browse artworks
          </Link>
          <Link
            href="/"
            className="border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
