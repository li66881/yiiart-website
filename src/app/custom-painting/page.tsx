import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CustomPaintingRequestForm from "@/components/CustomPaintingRequestForm"
import TrackableWhatsAppLink from "@/components/TrackableWhatsAppLink"
import { parseEnquiryIntent } from "@/lib/enquiry-intent"
import { pickEnglish } from "@/lib/artwork-display"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { client } from "@/lib/sanity"
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
    text: "YiiArt confirms the scope, price, and production guidance before the studio begins the handmade artwork. Production timing is confirmed before the order is finalized.",
  },
  {
    title: "Carefully packed and shipped to you",
    text: "The finished artwork is packed according to size, surface, destination, and safest shipping format.",
  },
]

const projectSteps = [
  { title: "Share the brief", text: "Tell us about the spaces, artwork quantity, destination, and timing. A short outline is enough to start." },
  { title: "Discuss the selection", text: "Review suitable listed works, sizes, and palette directions for the project." },
  { title: "Confirm the quote", text: "Specifications, pricing, sampling if needed, and production guidance are agreed before work begins." },
  { title: "Produce and deliver", text: "After approval, the studio makes the artwork. Packing and delivery are planned for the confirmed destination." },
]

const options = [
  "Size",
  "Color palette",
  "Orientation",
  "Frame",
  "Diptych / triptych",
  "Matching set",
]

const projectOptions = ["Coordinated selection", "Custom size", "Color direction", "Orientation", "Frame", "Diptych / triptych"]

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
    title: "Production guidance",
    text: "Production timing is confirmed before the order is finalized.",
  },
  {
    title: "Damage support",
    text: "Keep the artwork and all packaging and send clear photos so YiiArt can review the issue and available carrier process.",
  },
]

const faqs = [
  {
    question: "How long does custom painting take?",
    answer: "Production timing is confirmed before the order is finalized. Delivery timing and format are confirmed by destination, size, finish, and carrier route.",
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

const projectFaqs = [
  { question: "Can I enquire before I know the exact quantity?", answer: "Yes. Share the room or project type and your current estimate. The selection and quote can be refined as the brief becomes clearer." },
  { question: "Can artwork be adapted to a project palette?", answer: "Share palette and room references. YiiArt will confirm which changes are feasible for the selected composition before quoting." },
  { question: "When is pricing confirmed?", answer: "Pricing depends on the artwork, size, quantity, presentation, destination, and any sampling. A project quote follows a review of these details." },
  { question: "How are timing and delivery handled?", answer: "Production and delivery timing are confirmed for the agreed specifications and destination before an order is finalized." },
]

type Props = {
  searchParams: Promise<{ intent?: string; artwork?: string }>
}

export default async function CustomPaintingPage({ searchParams }: Props) {
  const params = await searchParams
  const intent = parseEnquiryIntent(params.intent)
  const artworkSlug = params.artwork?.trim() || ""
  const artworkTitle = artworkSlug ? await getArtworkTitle(artworkSlug) : ""
  const compact = intent === "size-advice"
  const whatsappUrl = getWhatsAppUrl(
    compact
      ? `Hello YiiArt, I would like size advice${artworkTitle ? ` for ${artworkTitle}` : ""}. I can share a room photo and wall width.`
      : intent === "project"
        ? "Hello YiiArt, I would like to discuss art for a design or hospitality project."
        : "Hello YiiArt, I would like to start a custom painting request. I can share my room size, photos, and preferred colors.",
  )
  const heading = compact
    ? "Need help choosing the right size?"
    : intent === "project"
      ? "Project art enquiries"
      : "Custom Painting Made for Your Space"
  const intro = compact
    ? "Send a room photo and your wall width for a size recommendation. Email and the artwork you are considering are enough for a first reply."
    : intent === "project"
      ? "Tell us about your space, artwork quantity, destination, and timing. YiiArt can discuss a coordinated selection, custom sizes or palette direction, and a quote for your brief."
      : "Choose your size, color palette, and style. Our studio creates a handmade artwork tailored to your room."

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">{compact ? "Size advice" : intent === "project" ? "Project enquiry" : "Custom Painting Service"}</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">{heading}</h1>
            </div>
            <div>
              <p className="max-w-3xl text-base leading-8 text-stone-600">
                {intro}
              </p>
              <a
                href="#custom-request"
                className="mt-8 inline-flex bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                {compact ? "Request size advice" : intent === "project" ? "Start project enquiry" : "Start Custom Request"}
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro eyebrow="How It Works" title={intent === "project" ? "From project brief to finished artwork" : "From room idea to finished canvas"} />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {(intent === "project" ? projectSteps : steps).map((step, index) => (
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
              title={intent === "project" ? "Shape the artwork around your project" : "Plan the painting around your wall, palette, and room"}
              text={intent === "project" ? "Use these options to describe the selection you need. Feasible specifications are confirmed for each work and project." : "Use these options to describe what should be made. If you are unsure, YiiArt can help choose a practical direction from your room photo."}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(intent === "project" ? projectOptions : options).map((option) => (
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
              <h2 className="text-4xl font-light leading-tight">{compact ? "A short first note is enough." : intent === "project" ? "Tell us about the project." : "Tell us what your room needs."}</h2>
              <p className="mt-5 text-sm leading-6 text-stone-600">
                {compact
                  ? "Email, the artwork you saw, and optional wall width or a room photo. Budget, destination, and framing can wait until a quote."
                  : intent === "project"
                    ? "A short brief is enough to begin. Include the space, delivery country, and any artwork or room references. We will confirm feasibility, scope, and pricing with you before production."
                  : "Share your wall size, room photos, and the mood you want. YiiArt replies as soon as practical with sizing, palette, and pricing guidance, and confirms the full scope with you before any payment is taken."}
              </p>
              <TrackableWhatsAppLink
                href={whatsappUrl}
                location="custom_painting_page"
                contentName={artworkSlug || intent}
                className="mt-6 inline-flex border border-stone-300 px-5 py-3 text-sm transition hover:border-black"
              >
                Open WhatsApp instead
              </TrackableWhatsAppLink>
            </div>
            <CustomPaintingRequestForm
              contactEmail={contactEmail}
              whatsappNumber={whatsappNumber}
              intent={intent}
              artworkSlug={artworkSlug}
              artworkTitle={artworkTitle}
            />
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
              <h2 className="text-4xl font-light leading-tight">{intent === "project" ? "Project art questions" : "Custom painting questions"}</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {(intent === "project" ? projectFaqs : faqs).map((item) => (
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

async function getArtworkTitle(slug: string) {
  try {
    const artwork = await client.fetch(
      `*[_type == "artwork" && slug.current == $slug && ${PUBLIC_ARTWORK_GROQ_FILTER}][0]{ title }`,
      { slug },
    )
    return pickEnglish(artwork?.title, "")
  } catch {
    return ""
  }
}
