import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReviewSubmitForm from "@/components/ReviewSubmitForm"
import { buildSeoMetadata } from "@/lib/seo"
import { formatDimensions, pickEnglish } from "@/lib/artwork-display"
import { getInviteStatus, getReviewInviteByToken } from "@/lib/reviews"

export const dynamic = "force-dynamic"

export const metadata: Metadata = buildSeoMetadata({
  title: "Review Your YiiArt Artwork",
  description: "Submit feedback for a verified YiiArt artwork purchase.",
  path: "/review/submit",
  robots: { index: false, follow: false },
})

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function ReviewSubmitPage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token || ""
  const invite = await getReviewInviteByToken(token)
  const status = getInviteStatus(invite)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="mb-4 text-4xl font-light">Review Your YiiArt Artwork</h1>
          <p className="mb-8 text-gray-600">
            Your honest review helps future collectors understand the real texture, color, scale, packaging, and room fit
            of YiiArt original paintings.
          </p>

          {status === "active" && invite?.artwork ? (
            <>
              <div className="mb-6 border bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Reviewing</p>
                <h2 className="mt-1 text-xl font-medium">{pickEnglish(invite.artwork.title, "YiiArt artwork")}</h2>
                {invite.artwork.dimensions && <p className="mt-1 text-sm text-gray-500">{formatDimensions(invite.artwork.dimensions)}</p>}
              </div>
              <ReviewSubmitForm token={token} />
            </>
          ) : (
            <InvalidInvite status={status} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function InvalidInvite({ status }: { status: string }) {
  const message =
    status === "used"
      ? "This review link has already been used."
      : status === "expired"
        ? "This review link has expired."
        : "This review link is not valid."

  return (
    <div className="border bg-gray-50 p-6">
      <h2 className="text-xl font-medium">{message}</h2>
      <p className="mt-3 text-gray-600">
        If you recently purchased a YiiArt artwork and need a new review link, contact collector support.
      </p>
      <Link href="/contact" className="mt-5 inline-block bg-black px-5 py-3 text-sm text-white">
        Contact YiiArt
      </Link>
    </div>
  )
}
