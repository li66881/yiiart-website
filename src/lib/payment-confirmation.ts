export function isPayPalCaptureCompleted(capture: unknown) {
  return Boolean(capture && typeof capture === "object" && (capture as { status?: unknown }).status === "COMPLETED")
}

export function isStripeCheckoutPaymentPaid(session: { payment_status?: string | null }) {
  return session.payment_status === "paid"
}
export function getMatchingPayPalCaptureId(
  response: unknown,
  order: { checkoutId: string; totalAmount: number; currency: string },
): string | null {
  if (!isPayPalCaptureCompleted(response)) return null
  const result = response as {
    id?: unknown
    purchase_units?: Array<{ payments?: { captures?: Array<{
      id?: unknown; status?: unknown; amount?: { value?: unknown; currency_code?: unknown }
    } | null> } } | null>
  }
  if (result.id !== order.checkoutId || result.purchase_units?.length !== 1) return null
  const captures = result.purchase_units[0]?.payments?.captures
  if (captures?.length !== 1) return null
  const capture = captures[0]
  const value = capture?.amount?.value
  if (capture?.status !== "COMPLETED" || typeof capture.id !== "string" || !capture.id) return null
  if (capture.amount?.currency_code !== order.currency || typeof value !== "string") return null
  if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) !== order.totalAmount) return null
  return capture.id
}
