import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">FAQ</h1>
          <div className="bg-white border">
            {[
              { q: "How long does shipping take?", a: "Standard shipping takes 7-14 business days worldwide. Express shipping is available for an additional fee." },
              { q: "What is your return policy?", a: "We offer a 30-day trial period. If you are not satisfied, full refunds are available. The artwork must be returned in original condition." },
              { q: "Are the artworks original?", a: "Yes, all artworks are 100% original and come with a signed certificate of authenticity." },
              { q: "How is the artwork shipped?", a: "Artworks are carefully packaged and shipped flat or rolled in a protective tube, depending on the size and medium." },
              { q: "Can I commission a custom artwork?", a: "Yes, contact us to discuss commissioning a custom piece from our artists." },
            ].map((item, i) => (
              <div key={i} className="border-b last:border-b-0 p-6">
                <h3 className="font-medium mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
