"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-medium mb-4">YiiArt</h3>
            <p className="text-sm text-gray-500">Art for Your Home</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.shop")}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/artworks">{t("footer.allArtworks")}</Link></li>
              <li><Link href="/artworks?category=Abstract">{t("footer.abstract")}</Link></li>
              <li><Link href="/artworks?category=Texture">{t("footer.texture")}</Link></li>
              <li><Link href="/artists">{t("common.artists")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/contact">{t("footer.contactUs")}</Link></li>
              <li><Link href="/faq">{t("footer.faq")}</Link></li>
              <li><Link href="/shipping">{t("footer.shippingInfo")}</Link></li>
              <li><Link href="/returns">{t("footer.returns")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about">{t("footer.aboutUs")}</Link></li>
              <li><Link href="/privacy">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms">{t("footer.terms")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm pt-8 border-t">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
