import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About YiiArt",
  description: "Learn about YiiArt — our mission to connect independent Chinese artists with collectors worldwide.",
  openGraph: {
    title: "About YiiArt | YiiArt",
    description: "Learn about YiiArt — our mission to connect independent Chinese artists with collectors worldwide.",
  },
  robots: { index: true, follow: true },
}


import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { contactEmail } from "@/lib/site"

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">About YiiArt</h1>
          <div className="bg-white p-8 border space-y-6">
            <p className="text-gray-600">
              YiiArt is a curated online gallery connecting art lovers with talented artists from around the world. We believe everyone deserves to experience the joy of original art in their home.
            </p>
            <div>
              <h2 className="text-xl font-medium mb-3">Our Mission</h2>
              <p className="text-gray-600">
                To make original art accessible and affordable while supporting artists directly. 80% of each sale goes directly to the artists.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">The Artists</h2>
              <p className="text-gray-600">
                We are building a focused roster of artists specializing in original paintings, from expressive landscapes to contemporary abstract works. Each published artist profile is connected to available works on the site.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Collector Confidence</h2>
              <p className="text-gray-600">
                YiiArt prepares each order with clear artwork details, careful packaging, international delivery support, and a 30-day return process.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Contact</h2>
              <p className="text-gray-600">Email: {contactEmail}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
