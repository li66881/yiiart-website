export function isPayPalCaptureCompleted(capture: unknown) {
  return Boolean(capture && typeof capture === "object" && (capture as { status?: unknown }).status === "COMPLETED")
}

export function isStripeCheckoutPaymentPaid(session: { payment_status?: string | null }) {
  return session.payment_status === "paid"
}
