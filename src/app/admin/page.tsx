import Link from "next/link"
import Header from "@/components/Header"
import { getAdminConfigStatus } from "@/lib/admin"

export const dynamic = "force-dynamic"

const tools = [
  {
    title: "Create artwork",
    description: "Upload artwork images and publish a saleable product to Sanity.",
    href: "/admin/artwork-new",
    external: false,
  },
  {
    title: "Create artist",
    description: "Add a protected artist profile to Sanity.",
    href: "/admin/artist-new",
    external: false,
  },
  {
    title: "Sanity Studio",
    description: "Manage artists, artworks, images, and content.",
    href: "https://zlh03v8i.sanity.studio/",
    external: true,
  },
  {
    title: "Stripe Dashboard",
    description: "Review Stripe Checkout payments and customer order records.",
    href: "https://dashboard.stripe.com/payments",
    external: true,
  },
  {
    title: "PayPal Dashboard",
    description: "Review PayPal Checkout orders and settlement status.",
    href: "https://www.paypal.com/mep/dashboard",
    external: true,
  },
  {
    title: "Vercel project",
    description: "Manage deployments, domains, analytics, and environment variables.",
    href: "https://vercel.com/dashboard",
    external: true,
  },
]

export default function AdminPage() {
  const status = getAdminConfigStatus()
  const checks = [
    {
      label: "Sanity project",
      ready: status.sanityProject,
      detail: "Required to read public artwork and artist content.",
    },
    {
      label: "Admin password",
      ready: status.adminPassword,
      detail: "Required before local admin forms can publish.",
    },
    {
      label: "Sanity write token",
      ready: status.sanityWriteToken,
      detail: "Required to create artists, upload images, and publish artworks.",
    },
    {
      label: "Stripe",
      ready: status.stripe,
      detail: "Required for card checkout.",
    },
    {
      label: "PayPal",
      ready: status.paypal,
      detail: "Required for PayPal checkout.",
    },
    {
      label: "Newsletter email",
      ready: status.newsletter,
      detail: "Required for Resend or SendGrid subscription notifications.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">YiiArt operations</p>
            <h1 className="text-3xl font-light">Admin tools</h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Use the local admin forms to publish artists and artworks after ADMIN_PASSWORD and
              SANITY_WRITE_TOKEN are configured. Payment and marketing tools open their own dashboards.
            </p>
          </div>

          <section className="mb-8 border bg-white p-6">
            <h2 className="font-medium mb-4">Configuration status</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {checks.map((check) => (
                <div key={check.label} className="border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{check.label}</h3>
                    <span className={`text-xs ${check.ready ? "text-green-700" : "text-red-700"}`}>
                      {check.ready ? "Ready" : "Missing"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{check.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>

          <section className="mt-8 border bg-white p-6">
            <h2 className="font-medium mb-3">Before publishing products</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Set ADMIN_PASSWORD and SANITY_WRITE_TOKEN in Vercel and in local .env.local.</li>
              <li>Use Create artist first when a new artist does not exist in the artist dropdown.</li>
              <li>Use Create artwork to upload images from Desktop / 网站素材 and publish the sale page.</li>
              <li>Stripe, PayPal, GA4, Meta Pixel, Pinterest Tag, and email tools need their own account keys.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

function ToolCard({
  title,
  description,
  href,
  external,
}: {
  title: string
  description: string
  href: string
  external: boolean
}) {
  const className = "block border bg-white p-6 hover:border-black transition"
  const content = (
    <>
      <h2 className="font-medium mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-5">{description}</p>
      <span className="text-sm underline">{external ? "Open tool" : "Open page"}</span>
    </>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}
