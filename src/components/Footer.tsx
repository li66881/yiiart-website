"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"
import NewsletterSignup from "@/components/NewsletterSignup"
import SocialLinks from "@/components/SocialLinks"
import TrackableEmailLink from "@/components/TrackableEmailLink"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="font-medium mb-4">YiiArt</h3>
            <p className="text-sm text-gray-500">{t("footer.tagline")}</p>
            <TrackableEmailLink email={contactEmail} className="mt-3 block text-sm text-gray-500 hover:text-black" leadType="footer_email">
              {contactEmail}
            </TrackableEmailLink>
            <a
              href={getWhatsAppUrl("Hello YiiArt, I found you from the website footer.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-gray-500 hover:text-black"
            >
              WhatsApp +{whatsappNumber}
            </a>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.shop")}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/artworks">{t("footer.allArtworks")}</Link></li>
              <li><Link href="/artworks?category=Abstract">{t("footer.abstract")}</Link></li>
              <li><Link href="/artworks?category=Texture">{t("footer.texture")}</Link></li>
              <li><Link href="/collections/abstract-art-for-living-room">{t("footer.livingRoomArt")}</Link></li>
              <li><Link href="/collections/textured-wall-art">{t("footer.texturedWallArt")}</Link></li>
              <li><Link href="/artists">{t("common.artists")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/contact">{t("footer.contactUs")}</Link></li>
              <li><Link href="/reviews">{t("footer.reviews")}</Link></li>
              <li><Link href="/art-in-real-homes">{t("footer.artInRealHomes")}</Link></li>
              <li><Link href="/faq">{t("footer.faq")}</Link></li>
              <li><Link href="/shipping">{t("footer.shippingInfo")}</Link></li>
              <li><Link href="/returns">{t("footer.returns")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about">{t("footer.aboutUs")}</Link></li>
              <li><Link href="/links">{t("footer.socialLinks")}</Link></li>
              <li><Link href="/privacy">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms">{t("footer.terms")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.newsletter")}</h4>
            <NewsletterSignup />
            <div className="mt-5">
              <h4 className="font-medium mb-3">{t("footer.follow")}</h4>
              <SocialLinks />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm pt-8 border-t">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
