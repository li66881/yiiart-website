import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionToken,
} from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  if (await isAdminSessionToken(sessionToken)) {
    return NextResponse.next()
  }

  const unlockUrl = request.nextUrl.clone()
  unlockUrl.pathname = "/admin-unlock"
  unlockUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`)

  return NextResponse.rewrite(unlockUrl)
}

export const config = {
  matcher: ["/admin/:path*"],
}
