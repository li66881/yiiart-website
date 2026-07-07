import type { Metadata } from "next"
import AdminUnlockForm from "@/app/admin/AdminUnlockForm"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function AdminUnlockPage({ searchParams }: Props) {
  const params = await searchParams

  return <AdminUnlockForm nextPath={safeAdminPath(params.next)} />
}

function safeAdminPath(value?: string) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin"
  }

  return value
}
