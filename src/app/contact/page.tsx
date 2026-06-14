import type { Metadata } from "next"
import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TrackableEmailLink from "@/components/TrackableEmailLink"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Contact YiiArt",
  description:
    "Contact YiiArt for artwork questions, collector support, shipping help, commissions, and room-size recommendations.",
  path: "/contact",
})

const supportPrompts = [
  "Artwork link or title",
  "Wall width and ceiling height",
  "Room photo in natural light",
  "Questions about framing, shipping, or returns",
]

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbfaf6] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.75fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Contact YiiArt</p>
              <h1 className="text-5xl font-light leading-tight">Get artwork advice before you buy.</h1>
            </div>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              Ask about scale, room fit, color, framing, availability, shipping format, or payment. YiiArt usually
              replies within 24 hours on business days.
            </p>
          </section>

          <section className="grid gap-5 py-14 lg:grid-cols-[1fr_0.85fr]">
            <div className="grid gap-5 sm:grid-cols-2">
              <ContactCard title="WhatsApp" value={`+${whatsappNumber}`}>
                <a
                  href={getWhatsAppUrl("Hello YiiArt, I would like help choosing an artwork.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex bg-black px-5 py-3 text-sm text-white transition hover:bg-stone-800"
                >
                  Open WhatsApp
                </a>
              </ContactCard>

              <ContactCard title="Email" value={contactEmail}>
                <TrackableEmailLink email={contactEmail} className="mt-5 inline-flex border border-stone-300 px-5 py-3 text-sm transition hover:border-black" leadType="contact_email">
                  Send email
                </TrackableEmailLink>
              </ContactCard>

              <ContactCard title="Hours" value="Monday - Friday">
                <p className="mt-3 text-sm leading-6 text-stone-600">9am - 6pm China Standard Time (UTC+8)</p>
              </ContactCard>

              <ContactCard title="Response time" value="Usually within 24 hours">
                <p className="mt-3 text-sm leading-6 text-stone-600">For urgent availability checks, WhatsApp is fastest.</p>
              </ContactCard>
            </div>

            <div className="border border-stone-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-light">What to send for better advice</h2>
              <ul className="mt-6 space-y-4">
                {supportPrompts.map((prompt) => (
                  <li key={prompt} className="border-t border-stone-200 pt-4 text-sm text-stone-700">
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

function ContactCard({
  title,
  value,
  children,
}: {
  title: string
  value: string
  children: ReactNode
}) {
  return (
    <div className="border border-stone-200 bg-white p-6">
      <p className="text-sm uppercase text-stone-500">{title}</p>
      <h2 className="mt-3 break-words text-xl font-medium">{value}</h2>
      {children}
    </div>
  )
}
