"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/context/CartContext"
import { formatStorePrice, getPriceDisclosure } from "@/lib/pricing"

type Step = "shipping" | "payment" | "confirm"
type PaymentMethod = "card" | "paypal"

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>("shipping")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  const handleShippingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setStep("payment")
  }

  const handlePaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setStep("confirm")
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError("")

    try {
      const endpoint = paymentMethod === "paypal"
        ? "/api/checkout/paypal"
        : "/api/checkout/session"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          shippingAddress,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout could not be started.")
      }

      window.location.href = data.url
    } catch (checkoutError) {
      setLoading(false)
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-light mb-8">Checkout</h1>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <StepIndicator active={step === "shipping"} complete={step !== "shipping"} label="Shipping" number="1" />
            <span className="h-px w-10 bg-gray-300" />
            <StepIndicator active={step === "payment"} complete={step === "confirm"} label="Payment" number="2" />
            <span className="h-px w-10 bg-gray-300" />
            <StepIndicator active={step === "confirm"} complete={false} label="Confirm" number="3" />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {step === "shipping" && (
                <form onSubmit={handleShippingSubmit} className="border bg-white p-6">
                  <h2 className="text-xl font-medium mb-6">Shipping information</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      label="Full name"
                      required
                      value={shippingAddress.name}
                      onChange={(value) => setShippingAddress({ ...shippingAddress, name: value })}
                    />
                    <TextField
                      label="Phone"
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(value) => setShippingAddress({ ...shippingAddress, phone: value })}
                    />
                    <TextField
                      label="Address"
                      required
                      className="md:col-span-2"
                      value={shippingAddress.address}
                      onChange={(value) => setShippingAddress({ ...shippingAddress, address: value })}
                    />
                    <TextField
                      label="City"
                      required
                      value={shippingAddress.city}
                      onChange={(value) => setShippingAddress({ ...shippingAddress, city: value })}
                    />
                    <TextField
                      label="Postal code"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(value) => setShippingAddress({ ...shippingAddress, postalCode: value })}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Order notes</label>
                      <textarea
                        value={shippingAddress.notes}
                        onChange={(event) => setShippingAddress({ ...shippingAddress, notes: event.target.value })}
                        className="h-24 w-full border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="Delivery or framing notes"
                      />
                    </div>
                  </div>
                  <button type="submit" className="mt-6 w-full bg-black py-3 text-white hover:bg-gray-800">
                    Continue to payment
                  </button>
                </form>
              )}

              {step === "payment" && (
                <form onSubmit={handlePaymentSubmit} className="border bg-white p-6">
                  <h2 className="text-xl font-medium mb-6">Payment method</h2>
                  <div className="space-y-3">
                    <PaymentOption
                      checked={paymentMethod === "card"}
                      label="Credit or debit card"
                      description="Secure checkout powered by Stripe."
                      onSelect={() => setPaymentMethod("card")}
                    />
                    <PaymentOption
                      checked={paymentMethod === "paypal"}
                      label="PayPal"
                      description="Pay with your PayPal account or PayPal-supported cards."
                      onSelect={() => setPaymentMethod("paypal")}
                    />
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button type="button" onClick={() => setStep("shipping")} className="flex-1 border py-3 hover:bg-gray-50">
                      Back
                    </button>
                    <button type="submit" className="flex-1 bg-black py-3 text-white hover:bg-gray-800">
                      Review order
                    </button>
                  </div>
                </form>
              )}

              {step === "confirm" && (
                <div className="border bg-white p-6">
                  <h2 className="text-xl font-medium mb-6">Review your order</h2>

                  <section className="border-b pb-4">
                    <h3 className="font-medium mb-2">Shipping address</h3>
                    <p>{shippingAddress.name}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                    {shippingAddress.notes && <p className="mt-2 text-sm text-gray-500">{shippingAddress.notes}</p>}
                  </section>

                  <section className="border-b py-4">
                    <h3 className="font-medium mb-2">Payment method</h3>
                    <p>{paymentMethod === "paypal" ? "PayPal" : "Credit or debit card"}</p>
                  </section>

                  <section className="space-y-4 py-4">
                    <h3 className="font-medium">Items</h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-100">
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">by {item.artist}</p>
                        </div>
                        <p className="text-sm">{formatStorePrice(item.price)} x {item.quantity}</p>
                      </div>
                    ))}
                  </section>

                  {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

                  <div className="flex gap-4">
                    <button onClick={() => setStep("payment")} className="flex-1 border py-3 hover:bg-gray-50">
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-black py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {loading ? "Redirecting..." : "Place order"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 border bg-white p-6">
                <h2 className="text-xl font-medium mb-6">Order summary</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 bg-gray-100">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">x {item.quantity}</p>
                      </div>
                      <p className="text-sm">{formatStorePrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatStorePrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-medium">
                    <span>Total</span>
                    <span>{formatStorePrice(subtotal)}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">{getPriceDisclosure()}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function StepIndicator({
  active,
  complete,
  label,
  number,
}: {
  active: boolean
  complete: boolean
  label: string
  number: string
}) {
  return (
    <div className={`flex items-center gap-2 ${active || complete ? "text-black" : "text-gray-400"}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${active || complete ? "bg-black text-white" : "bg-gray-200"}`}>
        {number}
      </span>
      <span>{label}</span>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
  className = "",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}{required ? " *" : ""}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  )
}

function PaymentOption({
  checked,
  label,
  description,
  onSelect,
}: {
  checked: boolean
  label: string
  description: string
  onSelect: () => void
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 border p-4 hover:bg-gray-50 ${checked ? "border-black" : ""}`}>
      <input type="radio" name="payment" checked={checked} onChange={onSelect} />
      <span className="h-10 w-10 border flex items-center justify-center text-xs font-medium">
        {label === "PayPal" ? "PP" : "CARD"}
      </span>
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-gray-500">{description}</span>
      </span>
    </label>
  )
}
