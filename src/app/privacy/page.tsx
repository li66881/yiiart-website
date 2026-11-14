import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { contactEmail } from "@/lib/site"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Privacy Policy",
  description: "YiiArt privacy policy for customer data, checkout information, cookies, and collector communications.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Privacy Policy</h1>
          <div className="bg-white p-8 border space-y-6 text-sm text-gray-600">
            <p>Last updated: November 14, 2026</p>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Information We Collect</h2>
              <p>We collect information you provide directly, including name, email, shipping address, and payment information when you make a purchase.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">How We Use Your Information</h2>
              <p>We use your information to process orders, communicate about purchases, and improve our services. We do not sell your personal information to third parties.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Payment Information</h2>
              <p>Payment processing is handled by PayPal, optional Stripe card checkout, or YiiArt invoice support. We do not store credit card details on our servers.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Cookies</h2>
              <p>We use cookies to maintain your shopping cart and language preferences. You can disable cookies in your browser settings.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Google Customer Reviews</h2>
              <p>For eligible paid orders, we share your order number, email address, delivery country and estimated delivery date with Google to display the Google Customer Reviews opt-in. Google may use cookies or similar technologies for this service; you can manage cookies in your browser settings. You can choose whether to receive a survey. If you opt in, Google may email you after the estimated delivery date. Participation is optional. See <a href="https://policies.google.com/privacy" className="underline">Google&apos;s Privacy Policy</a> for how Google handles this information.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Contact</h2>
              <p>For privacy concerns, contact us at {contactEmail}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
