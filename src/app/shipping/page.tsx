import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Shipping Information</h1>
          <div className="bg-white p-8 border space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-3">Shipping Methods</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Delivery Times</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Standard: 7-14 business days worldwide</li>
                <li>• Express: 3-5 business days (where available)</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">Packaging</h2>
              <p className="text-gray-600">All artworks are carefully packaged with protective materials to ensure safe delivery. Large pieces may be shipped rolled in a tube.</p>
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
