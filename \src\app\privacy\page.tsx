import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Privacy Policy</h1>
          <div className="bg-white p-8 border space-y-6 text-sm text-gray-600">
            <p>Last updated: April 10, 2026</p>
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
              <p>Payment processing is handled by Stripe. We do not store your credit card details on our servers.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Cookies</h2>
              <p>We use cookies to maintain your shopping cart and language preferences. You can disable cookies in your browser settings.</p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-black">Contact</h2>
              <p>For privacy concerns, contact us at contact@yiiart.com</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
