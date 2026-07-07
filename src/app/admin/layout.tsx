import type { Metadata } from "next"
import { cookies } from "next/headers"
import AdminUnlockForm from "./AdminUnlockForm"
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionToken,
} from "@/lib/admin-auth"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!(await isAdminSessionToken(sessionToken))) {
    return <AdminUnlockForm />
  }

  return children
}
