import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Terms of Service</h1>
          <div className="bg-white p-8 border space-y-6 text-sm text-gray-600">
            <p>Last updated: April 10, 2026</p>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Agreement to Terms</h2>
              <p>By using our website, you agree to these terms. If you do not agree, please do not use our services.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Products and Pricing</h2>
              <p>All artworks are described accurately. Prices are listed in CNY (Chinese Yuan). We reserve the right to change prices without notice.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Shipping and Delivery</h2>
              <p>Shipping times are estimates. We are not responsible for delays caused by customs or shipping carriers. Risk of loss passes to you upon delivery.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Returns</h2>
              <p>See our Returns & Refunds policy. Returns must be requested within 30 days of delivery.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Intellectual Property</h2>
              <p>All artworks remain the property of the artists. Purchasers receive the physical piece but not reproduction rights.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Contact</h2>
              <p>Questions? Contact us at contact@yiiart.com</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
