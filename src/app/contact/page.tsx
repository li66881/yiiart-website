import type { Metadata } from "next"
import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TrackableEmailLink from "@/components/TrackableEmailLink"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"
import { buildSeoMetadata } from "@/lib/seo"

type Props = {
  searchParams: Promise<{ topic?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const isTrade = params.topic === "trade"
  return buildSeoMetadata({
    title: isTrade ? "Trade Program | YiiArt" : "Contact YiiArt",
    description: isTrade
      ? "Work with YiiArt on trade, hospitality, and interior projects — volume pricing, custom sizes, and white-glove delivery support."
      : "Contact YiiArt for artwork questions, collector support, shipping help, commissions, and room-size recommendations.",
    path: isTrade ? "/contact?topic=trade" : "/contact",
  })
}

const collectorPrompts = [
  "Artwork link or title",
  "Wall width and ceiling height",
  "Room photo in natural light",
  "Questions about framing, shipping, or returns",
]

const tradePrompts = [
  "Project type (hotel, showroom, residential, office)",
  "Quantity, sizes, and preferred delivery window",
  "Mood board or palette references",
  "Billing / shipping addresses for the trade account",
]

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams
  const isTrade = params.topic === "trade"
  const whatsappMessage = isTrade
    ? "Hello YiiArt, I am contacting you about the Trade Program for a project. I can share quantities, sizes, and delivery needs."
    : "Hello YiiArt, I would like help choosing an artwork."

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f5f0] px-4 pb-20 pt-[var(--ya-header-offset)] sm:px-6 lg:px-10 lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid gap-10 border-b border-stone-200 pb-14 lg:grid-cols-[0.75fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.12em] text-stone-500">
                {isTrade ? "Trade Program" : "Contact YiiArt"}
              </p>
              <h1 className="text-4xl font-medium tracking-[-0.03em] md:text-5xl">
                {isTrade
                  ? "Trade pricing and project support for interiors."
                  : "Get artwork advice before you buy."}
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              {isTrade
                ? "Designers, galleries, and hospitality teams can request volume pricing, custom sizes, coordinated sets, and packing guidance. Share project scope and we reply within one business day."
                : "Ask about scale, room fit, color, framing, availability, shipping format, or payment. YiiArt usually replies within 24 hours on business days."}
            </p>
          </section>

          {isTrade ? (
            <section className="grid gap-4 border-b border-stone-200 py-10 md:grid-cols-3">
              {[
                ["Volume & trade pricing", "Quotes for multi-piece or multi-room orders."],
                ["Custom sizes & sets", "Match wall spans, suites, and coordinated palettes."],
                ["Packing for install", "Rolled, stretched, or crated by destination."],
              ].map(([title, text]) => (
                <div key={title} className="border border-stone-200 bg-white p-5">
                  <h2 className="text-lg font-medium">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section className="grid gap-5 py-14 lg:grid-cols-[1fr_0.85fr]">
            <div className="grid gap-5 sm:grid-cols-2">
              <ContactCard title="WhatsApp" value={`+${whatsappNumber}`}>
                <a
                  href={getWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex bg-black px-5 py-3 text-sm text-white transition hover:bg-stone-800"
                >
                  {isTrade ? "Message trade desk" : "Open WhatsApp"}
                </a>
              </ContactCard>

              <ContactCard title="Email" value={contactEmail}>
                <TrackableEmailLink email={contactEmail} className="mt-5 inline-flex border border-stone-300 px-5 py-3 text-sm transition hover:border-black" leadType="contact_email">
                  {isTrade ? "Email trade inquiry" : "Send email"}
                </TrackableEmailLink>
              </ContactCard>

              <ContactCard title="Hours" value="Monday - Friday">
                <p className="mt-3 text-sm leading-6 text-stone-600">9am - 6pm China Standard Time (UTC+8)</p>
              </ContactCard>

              <ContactCard title="Response time" value="Usually within 24 hours">
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {isTrade
                    ? "For active projects, WhatsApp is fastest for size and packing questions."
                    : "For urgent availability checks, WhatsApp is fastest."}
                </p>
              </ContactCard>
            </div>

            <div className="border border-stone-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-light">
                {isTrade ? "What to send for a trade quote" : "What to send for better advice"}
              </h2>
              <ul className="mt-6 space-y-4">
                {(isTrade ? tradePrompts : collectorPrompts).map((prompt) => (
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
