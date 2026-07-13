import Link from "next/link"
import type { ReactNode } from "react"
import ArtworkReviewSection from "@/components/ArtworkReviewSection"
import TranslatedText from "@/components/TranslatedText"
import {
  parseArtworkDimensionsCm,
} from "@/lib/artwork-display"
import type { PublicReview, ReviewStats } from "@/lib/reviews"
import {
  productAdviceItems,
  productConfidenceItems,
  productPackagingItems,
  productProcessItems,
} from "@/lib/storefront-content"

const trustItems = [
  { title: "Secure payment", text: "Checkout and invoice options are handled through configured payment providers or YiiArt support." },
  { title: "Worldwide shipping", text: "International delivery is prepared according to artwork size, surface, and destination." },
  { title: "Carefully packaged", text: "Rolled, stretched, or flat packaging is selected for the safest practical handling." },
  { title: "Damage protection", text: "Keep all packaging and send photos promptly if carrier damage is found on arrival." },
  { title: "Handmade artwork", text: "YiiArt focuses on physical hand-painted works rather than mass-produced poster prints." },
]

export const artworkPageFaqs = [
  {
    question: "Will the painting look exactly like the photo?",
    answer: "Photos are prepared to show the artwork clearly, but screen color, daylight, and room lighting can change how color and texture appear. Ask for extra daylight photos or a short video before purchase if palette accuracy is important.",
  },
  {
    question: "Can I request a custom size?",
    answer: "Yes. Send your wall size, room photo, preferred orientation, and color direction. YiiArt can confirm whether a custom canvas is possible before production starts.",
  },
  {
    question: "Is the painting handmade?",
    answer: "Yes. YiiArt product pages are intended for original hand-painted artwork unless a listing clearly says otherwise.",
  },
  {
    question: "What if it arrives damaged?",
    answer: "Keep the artwork, box, inner packaging, and shipping label. Contact YiiArt promptly with clear photos so the damage support process can be reviewed.",
  },
]

export type ArtworkSupportingSectionsProps = {
  title: string
  medium?: string
  surfaceFinish?: string
  framingNotes?: string
  shippingProfile?: string
  dimensionsSource?: string
  roomTypes: string[]
  customRequestUrl: string
  reviews: PublicReview[]
  reviewStats: ReviewStats
}

export default function ArtworkSupportingSections({
  title,
  medium,
  surfaceFinish,
  framingNotes,
  shippingProfile,
  dimensionsSource,
  roomTypes,
  customRequestUrl,
  reviews,
  reviewStats,
}: ArtworkSupportingSectionsProps): ReactNode {
  return (
    <>
      <section className="mt-14 grid gap-8 border-t border-[#ded8ce] pt-12 lg:grid-cols-[0.8fr_1fr]">
        <SectionIntro
          eyebrow="Artwork Details"
          title="Know the artwork before it enters your room"
          text="Product rows are shown when the current listing has enough information. For missing production details, YiiArt confirms the safest format before dispatch or custom production."
        />
        <ArtworkDetails
          medium={medium}
          surfaceFinish={surfaceFinish}
          framingNotes={framingNotes}
          shippingProfile={shippingProfile}
        />
      </section>

      <section className="mt-16 grid gap-8 border-t border-[#ded8ce] pt-12 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <SectionIntro
            eyebrow="Size & Room Guide"
            title="Check the scale before you choose"
            text="Use this as a practical starting point for sofas, beds, entryways, and feature walls. For exact advice, send your wall width and a room photo on WhatsApp before purchase."
          />
          <Link href="/size-guide" className="mt-5 inline-flex text-sm underline underline-offset-4">Read full size guide</Link>
        </div>
        <ScaleGuidance dimensions={dimensionsSource} roomTypes={roomTypes} title={title} />
      </section>

      <section className="mt-16 grid gap-8 border-t border-[#ded8ce] pt-12 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <SectionIntro
            eyebrow="Customization"
            title="Need a custom size, color palette, or matching artwork for your room?"
            text="Send your wall width, ceiling height, room photo, and preferred palette. YiiArt can help confirm whether this artwork fits as listed or whether a custom painting is a better path."
          />
          <a href={customRequestUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex bg-[#181613] px-6 py-4 text-sm font-medium text-white transition hover:bg-black">
            Request Custom Painting
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {productAdviceItems.map((item, index) => (
            <InfoBlock
              key={item.title}
              title={<TranslatedText k={`product.advice.${index}.title`} fallback={item.title} />}
              text={<TranslatedText k={`product.advice.${index}.text`} fallback={item.text} />}
            />
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-[#ded8ce] pt-12">
        <SectionIntro eyebrow="Trust Block" title="A safer way to buy handmade artwork online" />
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {trustItems.map((item) => <InfoBlock key={item.title} title={item.title} text={item.text} />)}
        </div>
      </section>

      <EditorialGrid
        eyebrow="Handmade modern painting"
        title="What YiiArt checks before this artwork ships"
        text="Buying original canvas art online should feel clear before payment. These checks help you confirm surface, color, scale, and delivery format before the work reaches your home."
        items={productProcessItems}
      />

      <EditorialGrid
        eyebrow="Packaging and delivery"
        title="Prepared for canvas size, surface, and shipping safety"
        text="Shipping format depends on the artwork size and safest handling method. Oversized canvas art may ship rolled, while smaller works can sometimes ship stretched or framed."
        items={productPackagingItems}
      />

      <section className="mt-16 grid gap-8 border-t border-[#ded8ce] pt-12 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <SectionIntro
            eyebrow="Shipping & Returns Summary"
            title="Short version before checkout"
            text="Most ready-made works are prepared with protective packaging and international delivery support. Eligible ready-made artworks can request returns within the stated policy window; custom work may have separate terms confirmed before production."
          />
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/shipping-returns" className="underline underline-offset-4">Read Shipping & Returns</Link>
            <Link href="/shipping" className="underline underline-offset-4">Read full Shipping page</Link>
            <Link href="/returns" className="underline underline-offset-4">Read full Returns page</Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoBlock title="Processing time" text={shippingProfile || "Final checks and packaging are confirmed before dispatch."} />
          <InfoBlock title="Shipping time" text="Transit timing depends on destination, customs, carrier route, and the safest shipping format for the artwork." />
          <InfoBlock title="Returns and damage" text="Keep all packaging if the artwork arrives damaged, then contact YiiArt promptly with photos for review." />
        </div>
      </section>

      <section className="mt-16 grid gap-8 border-t border-[#ded8ce] pt-12 lg:grid-cols-[0.8fr_1fr]">
        <SectionIntro
          eyebrow="FAQ"
          title="Product questions collectors often ask"
          text="These answers are written for original handmade paintings, large wall art, custom canvas inquiries, and home interior placement decisions."
        />
        <div className="divide-y divide-[#ded8ce] border-y border-[#ded8ce]">
          {artworkPageFaqs.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="cursor-pointer list-none font-medium">
                <span className="inline-flex w-full items-center justify-between gap-4">
                  {item.question}
                  <span aria-hidden="true" className="text-[#6f675d] group-open:hidden">+</span>
                  <span aria-hidden="true" className="hidden text-[#6f675d] group-open:inline">−</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#6f675d]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <ArtworkReviewSection reviews={reviews} stats={reviewStats} />

      <section className="mt-16 grid gap-6 border-t border-[#ded8ce] pt-12 md:grid-cols-4">
        {productConfidenceItems.map((item, index) => (
          <InfoBlock
            key={item.title}
            title={<TranslatedText k={`product.confidence.${index}.title`} fallback={item.title} />}
            text={<TranslatedText k={`product.confidence.${index}.text`} fallback={item.text} />}
          />
        ))}
      </section>
    </>
  )
}

function EditorialGrid({ eyebrow, title, text, items }: { eyebrow: string; title: string; text: string; items: Array<{ title: string; text: string }> }) {
  return (
    <section className="mt-16 grid gap-8 border-t border-[#ded8ce] pt-12 lg:grid-cols-[0.8fr_1fr]">
      <SectionIntro eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => <InfoBlock key={item.title} title={item.title} text={item.text} />)}
      </div>
    </section>
  )
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.14em] text-[#6f675d]">{eyebrow}</p>
      <h2 className="max-w-xl font-serif text-3xl font-light leading-tight text-[#181613] lg:text-4xl">{title}</h2>
      {text && <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6f675d]">{text}</p>}
    </div>
  )
}

function ArtworkDetails({ medium, surfaceFinish, framingNotes, shippingProfile }: { medium?: string; surfaceFinish?: string; framingNotes?: string; shippingProfile?: string }) {
  const rows = [
    medium ? { label: "Material", value: inferArtworkMaterial(medium) } : null,
    medium ? { label: "Medium", value: medium } : null,
    medium && /canvas/i.test(medium) ? { label: "Canvas type", value: "Artist canvas" } : null,
    { label: "Handmade note", value: "Original hand-painted artwork, not a mass-produced print." },
    framingNotes ? { label: "Frame option", value: framingNotes } : null,
    { label: "Processing time", value: shippingProfile || "Final checks, documentation, and packing are confirmed before dispatch." },
    { label: "Shipping time", value: "Transit timing depends on destination, customs, carrier route, and the safest shipping format for the artwork." },
    surfaceFinish ? { label: "Surface", value: surfaceFinish } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return <div className="grid gap-3 sm:grid-cols-2">{rows.map((row) => <Detail key={row.label} label={row.label} value={row.value} />)}</div>
}

export function inferArtworkMaterial(medium: string) {
  if (/canvas/i.test(medium)) return "Canvas"
  if (/panel/i.test(medium)) return "Panel"
  return medium
}

function ScaleGuidance({ dimensions, roomTypes, title }: { dimensions?: string | null; roomTypes: string[]; title: string }) {
  const parsed = parseArtworkDimensionsCm(dimensions)
  const scale = getScaleProfile(parsed)
  const rooms = roomTypes.length > 0 ? roomTypes.join(", ") : scale.rooms

  return (
    <div className="border border-[#ded8ce] bg-[#fbfaf6] p-6">
      <div className="grid gap-4 md:grid-cols-[0.7fr_1fr] md:items-end">
        <div>
          <p className="text-xs uppercase text-[#6f675d]">Artwork scale</p>
          <h3 className="mt-2 font-serif text-2xl font-light">{scale.label}</h3>
          <p className="mt-2 text-sm text-[#6f675d]">{parsed ? `${Math.round(parsed.width)} x ${Math.round(parsed.height)} cm` : "Confirm exact dimensions"}</p>
        </div>
        <div className="space-y-2">
          <ScaleBar label="Accent" active={scale.rank >= 1} />
          <ScaleBar label="Room anchor" active={scale.rank >= 2} />
          <ScaleBar label="Feature wall" active={scale.rank >= 3} />
          <ScaleBar label="Oversized statement" active={scale.rank >= 4} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {scale.placements.map((placement) => <InfoBlock key={placement.title} title={placement.title} text={placement.text} />)}
      </div>
      <p className="mt-6 border-t border-[#ded8ce] pt-4 text-sm leading-6 text-[#6f675d]">{title} is best reviewed against your actual wall, furniture width, ceiling height, and viewing distance. Recommended spaces: {rooms}.</p>
    </div>
  )
}

function ScaleBar({ label, active }: { label: string; active: boolean }) {
  return <div className="flex items-center gap-3 text-xs text-[#6f675d]"><span className={`h-2 flex-1 ${active ? "bg-[#181613]" : "bg-[#ded8ce]"}`} /><span className="w-32">{label}</span></div>
}

function getScaleProfile(dimensions: { width: number; height: number } | null) {
  const longest = dimensions ? Math.max(dimensions.width, dimensions.height) : 90
  const rank = longest >= 150 ? 4 : longest >= 110 ? 3 : longest >= 70 ? 2 : 1
  const label = rank === 4 ? "Oversized statement" : rank === 3 ? "Large wall art" : rank === 2 ? "Medium room anchor" : "Small accent"
  const profiles = {
    4: { rooms: "feature walls, open living rooms, offices, and hospitality spaces", placements: [{ title: "Sofa wall", text: "Use when the sofa wall has generous breathing room on both sides." }, { title: "Bed wall", text: "Works best above wide headboards or in rooms with strong ceiling height." }, { title: "Shipping", text: "Confirm rolled, stretched, or freight handling before purchase." }] },
    3: { rooms: "living rooms, bedrooms, dining rooms, and feature walls", placements: [{ title: "Sofa wall", text: "A strong option when the artwork is roughly two-thirds of the sofa width." }, { title: "Bed wall", text: "Can anchor a queen or king headboard when centered with room around lamps." }, { title: "Entryway", text: "Best for wider entries or open hallways with viewing distance." }] },
    2: { rooms: "bedrooms, entries, offices, reading corners, and smaller living rooms", placements: [{ title: "Sofa wall", text: "Use above compact sofas or pair with another work for wider furniture." }, { title: "Bed wall", text: "Good for smaller beds, guest rooms, or layered bedroom styling." }, { title: "Entryway", text: "Fits spaces where viewers stand closer to the artwork." }] },
    1: { rooms: "small walls, shelves, corners, entries, and grouped arrangements", placements: [{ title: "Sofa wall", text: "Usually better as part of a pair or gallery grouping above larger furniture." }, { title: "Bed wall", text: "Works for narrow beds, side walls, or intimate corners." }, { title: "Entryway", text: "A practical accent for compact walls and close viewing." }] },
  }
  return { rank, label, ...profiles[rank as keyof typeof profiles] }
}

function Detail({ label, value }: { label: ReactNode; value: ReactNode }) {
  return <div className="border border-[#ded8ce] p-4"><p className="text-xs uppercase text-[#6f675d]">{label}</p><p className="mt-1 font-medium">{value}</p></div>
}

function InfoBlock({ title, text }: { title: ReactNode; text: ReactNode }) {
  return <div className="border-t border-[#ded8ce] pt-5"><h3 className="mb-2 text-lg font-medium">{title}</h3><p className="text-sm leading-6 text-[#6f675d]">{text}</p></div>
}
