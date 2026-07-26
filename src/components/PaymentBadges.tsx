const paymentMethods = [
  { key: "paypal", label: "PayPal" },
  { key: "visa", label: "VISA" },
  { key: "mastercard", label: "Mastercard" },
  { key: "amex", label: "AMEX" },
  { key: "bank", label: "Bank Transfer" },
]

export default function PaymentBadges({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark"

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span
        className={`inline-flex items-center gap-1.5 text-xs ${dark ? "text-white/60" : "text-stone-500"}`}
        aria-label="SSL secure checkout"
      >
        <LockIcon />
        SSL Secure Checkout
      </span>
      {paymentMethods.map((method) => (
        <span
          key={method.key}
          className={`inline-flex items-center px-2 py-1 text-[11px] font-semibold tracking-wide ${
            dark
              ? "border border-white/25 bg-white/5 text-white/80"
              : "border border-stone-300 bg-white text-stone-700"
          }`}
        >
          {method.label}
        </span>
      ))}
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
