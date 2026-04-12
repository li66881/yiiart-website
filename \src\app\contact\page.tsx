import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Contact Us</h1>
          <div className="bg-white p-8 border">
            <h2 className="text-xl font-medium mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              Have questions about our artworks or shipping? We are here to help.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <p className="text-gray-600">contact@yiiart.com</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9am - 6pm (CST)</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Response Time</h3>
                <p className="text-gray-600">We typically respond within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
