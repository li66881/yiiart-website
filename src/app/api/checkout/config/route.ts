import { NextResponse } from "next/server"
import { getPaymentConfigStatus } from "@/lib/payment-config"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(getPaymentConfigStatus())
}
