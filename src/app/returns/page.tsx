import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Returns & Refunds</h1>
          <div className="bg-white p-8 border space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-3">30-Day Trial</h2>
              <p className="text-gray-600">We offer a 30-day trial period for all artworks. If you are not completely satisfied, we provide full refunds.</p>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">How to Return</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Contact us at contact@yiiart.com within 30 days</li>
                <li>We will provide return shipping instructions</li>
                <li>Pack the artwork securely in original packaging if possible</li>
                <li>Ship it back to our gallery</li>
                <li>Refund will be processed within 5-7 business days</li>
              </ol>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Conditions</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Artwork must be returned in original condition</li>
                <li>• Buyer pays return shipping unless defective</li>
                <li>• Certificate of authenticity must be included</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
