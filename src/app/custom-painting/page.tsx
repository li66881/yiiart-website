import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CustomPaintingRequestForm from "@/components/CustomPaintingRequestForm"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Custom Painting Made for Your Space",
  description:
    "Request a handmade custom painting from YiiArt. Choose size, color palette, orientation, frame direction, and room style for a canvas artwork made for your space.",
  path: "/custom-painting",
})

const steps = [
  {
    title: "Share your room photo or inspiration",
    text: "Send a room photo, wall measurements, furniture colors, or inspiration references so the studio understands the space.",
  },
  {
    title: "Choose size and color palette",
    text: "Confirm the canvas size, orientation, color direction, and whether the work should feel quiet, bold, textured, or minimal.",
  },
  {
    title: "We create your handmade painting",
    text: "YiiArt confirms the scope and production timeline before the studio begins the handmade artwork.",
  },
  {
    title: "Carefully packed and shipped to you",
    text: "The finished artwork is packed according to size, surface, destination, and safest shipping format.",
  },
]

const options = [
  "Size",
  "Color palette",
  "Orientation",
  "Frame",
  "Diptych / triptych",
  "Matching set",
]

const trustItems = [
  {
    title: "Handmade by studio artists",
    text: "Custom works are planned as physical paintings with real surface, brushwork, and studio handling.",
  },
  {
    title: "Secure communication",
    text: "Confirm room details, quote, timeline, and payment direction before production begins.",
  },
  {
    title: "Clear production timeline",
    text: "YiiArt confirms expected preparation and shipping timing according to size and complexity.",
  },
  {
    title: "Damage protection",
    text: "Artwork is packed carefully, and damage issues are reviewed with photos and packaging evidence.",
  },
]

const faqs = [
  {
    question: "How long does custom painting take?",
    answer: "Timing depends on size, surface, complexity, and artist schedule. YiiArt confirms the estimated production and shipping timeline before the custom order starts.",
  },
  {
    question: "Can I send a reference image?",
    answer: "Yes. You can send room photos, palette references, and inspiration images for mood. Please do not request direct copies of copyrighted artwork.",
  },
  {
    question: "Can you match my room colors?",
    answer: "Yes. Share daylight room photos, wall color, rug or sofa details, and preferred undertones so the studio can plan a suitable palette.",
  },
  {
    question: "Do you offer large sizes?",
    answer: "Yes. Large and oversized custom canvas works can be discussed. Shipping format may be rolled, stretched, or specially packed depending on the final size.",
  },
]

export default function CustomPaintingPage() {
  const whatsappUrl = getWhatsAppUrl(
    "Hello YiiArt, I would like to start a custom painting request. I can share my room size, photos, and preferred colors."
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Custom Painting Service</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">Custom Painting Made for Your Space</h1>
            </div>
            <div>
              <p className="max-w-3xl text-base leading-8 text-stone-600">
                Choose your size, color palette, and style. Our studio creates a handmade artwork tailored to your room.
              </p>
              <a
                href="#custom-request"
                className="mt-8 inline-flex bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Start Custom Request
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro eyebrow="How It Works" title="From room idea to finished canvas" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.title} className="border-t border-stone-300 pt-5">
                  <p className="text-sm text-stone-400">Step {index + 1}</p>
                  <h2 className="mt-5 text-xl font-medium">{step.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              eyebrow="Custom Options"
              title="Plan the painting around your wall, palette, and room"
              text="Use these options to describe what should be made. If you are unsure, YiiArt can help choose a practical direction from your room photo."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {options.map((option) => (
                <div key={option} className="border border-stone-200 bg-white p-5">
                  <h2 className="text-xl font-light">{option}</h2>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="custom-request" className="border-b border-stone-200 bg-white px-4 py-16 scroll-mt-28 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">Request Form</p>
              <h2 className="text-4xl font-light leading-tight">Tell us what your room needs.</h2>
              <p className="mt-5 text-sm leading-6 text-stone-600">
                Image upload is not connected yet. Please describe the room here, then attach photos when you reply by
                email or open WhatsApp. TODO: connect a secure upload endpoint if custom requests need file storage.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex border border-stone-300 px-5 py-3 text-sm transition hover:border-black"
              >
                Open WhatsApp instead
              </a>
            </div>
            <CustomPaintingRequestForm contactEmail={contactEmail} whatsappNumber={whatsappNumber} />
          </div>
        </section>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro eyebrow="Trust Section" title="Clear support before custom production starts" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {trustItems.map((item) => (
                <InfoBlock key={item.title} title={item.title} text={item.text} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">FAQ</p>
              <h2 className="text-4xl font-light leading-tight">Custom painting questions</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {faqs.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {item.question}
                      <span className="text-stone-400 group-open:hidden">+</span>
                      <span className="hidden text-stone-400 group-open:inline">-</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="mb-3 text-sm uppercase text-stone-500">{eyebrow}</p>
      <h2 className="text-4xl font-light leading-tight">{title}</h2>
      {text && <p className="mt-4 text-sm leading-6 text-stone-600">{text}</p>}
    </div>
  )
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-stone-300 pt-5">
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}
