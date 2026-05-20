import Link from "next/link"
import Header from "@/components/Header"

const tools = [
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
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">YiiArt operations</p>
            <h1 className="text-3xl font-light">Admin tools</h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Sensitive settings are managed through Vercel environment variables and Sanity permissions.
              This page is only a launcher for operational tools.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>

          <section className="mt-8 border bg-white p-6">
            <h2 className="font-medium mb-3">Before going live</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Set ADMIN_PASSWORD, SEED_SECRET, SANITY_WRITE_TOKEN, Stripe keys, and PayPal keys in Vercel.</li>
              <li>Add GA4, Google Search Console, Meta Pixel, Pinterest Tag, and newsletter email keys before launch.</li>
              <li>Rotate any keys that were previously committed to GitHub history.</li>
              <li>Use Sanity Studio for product and image editing; Stripe and PayPal dashboards hold payment/order records.</li>
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
