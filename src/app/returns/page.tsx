import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { contactEmail } from "@/lib/site"

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Returns & Refunds</h1>
          <div className="bg-white p-8 border space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-3">30-Day Trial</h2>
              <p className="text-gray-600">
                You may request a return within 30 days of delivery. The artwork must be returned in its original condition with all documentation and the certificate of authenticity.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">How to Return</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Contact us at {contactEmail} within 30 days of delivery</li>
                <li>Include your order number, artwork title, and reason for return</li>
                <li>We will provide return packing and shipping instructions</li>
                <li>Pack the artwork securely in the original packaging when possible</li>
                <li>Refunds are processed within 5-7 business days after inspection</li>
              </ol>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Return Costs</h2>
              <p className="text-gray-600">
                Buyers are responsible for return shipping on preference-based returns. If the artwork arrives damaged or materially different from the listing, contact us within 48 hours with photos and we will help resolve the issue.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Conditions</h2>
              <ul className="space-y-2 text-gray-600">
                <li>Artwork must be returned in original condition</li>
                <li>Certificate of authenticity and included documents must be returned</li>
                <li>Custom or commissioned works may have separate return terms confirmed before purchase</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
