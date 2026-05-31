import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Shipping Original Artwork",
  description:
    "YiiArt ships original paintings worldwide with tracked delivery, protective packaging, and clear customs guidance.",
  path: "/shipping",
})

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Shipping Information</h1>
          <div className="bg-white p-8 border space-y-6">
            <p className="text-gray-600">
              YiiArt ships original artworks internationally with protective packaging and tracking. Final delivery time can vary by destination, customs review, and carrier conditions.
            </p>
            <div>
              <h2 className="text-xl font-medium mb-3">Shipping Methods</h2>
              <div className="space-y-3">
                <div className="flex justify-between gap-4">
                  <span>Standard Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Express Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Delivery Times</h2>
              <ul className="space-y-2 text-gray-600">
                <li>Standard: 7-14 business days worldwide after dispatch</li>
                <li>Express: 3-5 business days where available</li>
                <li>Artwork preparation: usually 5-7 business days before dispatch</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Packaging</h2>
              <p className="text-gray-600">
                All artworks are packaged with protective materials to reduce movement, moisture risk, and impact during transit. Large pieces may be shipped rolled in a tube when that is safer than framed shipment.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Customs and Duties</h2>
              <p className="text-gray-600">
                Import duties, VAT, customs fees, and local taxes are not included unless stated at checkout. These charges are set by the destination country and are the buyer's responsibility.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Damage in Transit</h2>
              <p className="text-gray-600">
                If a shipment arrives damaged, keep the packaging and contact us within 48 hours with photos of the artwork, box, and shipping label so we can open a carrier claim and arrange the next step.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Tracking</h2>
              <p className="text-gray-600">Once shipped, you will receive a tracking number via email to monitor your delivery.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
