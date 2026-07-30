import { permanentRedirect } from "next/navigation"

export default function ShopRedirectPage() {
  permanentRedirect("/artworks")
}
