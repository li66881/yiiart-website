import { madeToOrderShippingDestinations } from "./shipping-timing"

export type GoogleReviewOptIn = {
  merchant_id: number
  order_id: string
  email: string
  delivery_country: string
  estimated_delivery_date: string
}

type ReviewOrder = {
  orderNumber: string
  status: string
  paymentStatus: string
  customerEmail: string
  paidAt?: string | null
  shippingAddress: { country: string }
  items: Array<{ productionModel: string; finishId?: string | null }>
}

// No estimate is invented for originals, framed orders or unconfirmed destinations.
export function buildGoogleReviewOptIn(order: ReviewOrder | null, now = new Date()): GoogleReviewOptIn | null {
  if (!order || !["paid", "fulfilled"].includes(order.status) || order.paymentStatus !== "paid"
    || !order.orderNumber.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail)
    || !order.paidAt || !order.items.length
    || order.items.some(item => item.productionModel !== "hand_painted_to_order" || item.finishId !== "rolled")) return null

  const destination = madeToOrderShippingDestinations.find(item => item.country === order.shippingAddress.country)
  const paidAt = new Date(order.paidAt)
  if (!destination || !Number.isFinite(paidAt.getTime()) || paidAt > now) return null

  // Calendar days, based on the stored payment date, never the page refresh date.
  const estimated = new Date(paidAt)
  estimated.setUTCDate(estimated.getUTCDate() + destination.handling.max + destination.transit.max)
  const estimatedDate = estimated.toISOString().slice(0, 10)
  if (estimatedDate < now.toISOString().slice(0, 10)) return null

  return {
    merchant_id: 5900598967,
    order_id: order.orderNumber,
    email: order.customerEmail,
    delivery_country: destination.country,
    estimated_delivery_date: estimatedDate,
  }
}
