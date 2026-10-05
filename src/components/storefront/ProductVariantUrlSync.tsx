"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type Props = {
  sizeId: string
  finishId: string
}

export function ProductVariantUrlSync({ sizeId, finishId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (sizeId) params.set("size", sizeId)
    else params.delete("size")
    if (finishId) params.set("finish", finishId)
    else params.delete("finish")
    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    const currentQuery = searchParams.toString()
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname
    if (nextUrl !== currentUrl) router.replace(nextUrl, { scroll: false })
  }, [finishId, pathname, router, searchParams, sizeId])

  return null
}
