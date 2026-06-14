"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useLanguage } from "@/context/LanguageContext"
import NewsletterSignup from "@/components/NewsletterSignup"
import SocialLinks from "@/components/SocialLinks"
import TrackableEmailLink from "@/components/TrackableEmailLink"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-stone-950 text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 border-b border-white/15 pb-10 lg:grid-cols-[1.2fr_2fr_1fr]">
          <div>
            <img src="/brand/yiiart-logo-light.svg" alt="YiiArt" className="h-9 w-auto" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/64">{t("footer.tagline")}</p>
            <div className="mt-5 space-y-2">
              <TrackableEmailLink email={contactEmail} className="block text-sm text-white/70 hover:text-white" leadType="footer_email">
                {contactEmail}
              </TrackableEmailLink>
              <a
                href={getWhatsAppUrl("Hello YiiArt, I found you from the website footer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-white/70 hover:text-white"
              >
                WhatsApp +{whatsappNumber}
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FooterColumn title={t("footer.shop")}>
              <FooterLink href="/artworks">{t("footer.allArtworks")}</FooterLink>
              <FooterLink href="/artworks?category=Abstract">{t("footer.abstract")}</FooterLink>
              <FooterLink href="/artworks?category=Texture">{t("footer.texture")}</FooterLink>
              <FooterLink href="/collections/abstract-art-for-living-room">{t("footer.livingRoomArt")}</FooterLink>
              <FooterLink href="/collections/textured-wall-art">{t("footer.texturedWallArt")}</FooterLink>
              <FooterLink href="/artists">{t("common.artists")}</FooterLink>
            </FooterColumn>

            <FooterColumn title={t("footer.support")}>
              <FooterLink href="/contact">{t("footer.contactUs")}</FooterLink>
              <FooterLink href="/reviews">{t("footer.reviews")}</FooterLink>
              <FooterLink href="/art-in-real-homes">{t("footer.artInRealHomes")}</FooterLink>
              <FooterLink href="/faq">{t("footer.faq")}</FooterLink>
              <FooterLink href="/shipping">{t("footer.shippingInfo")}</FooterLink>
              <FooterLink href="/returns">{t("footer.returns")}</FooterLink>
            </FooterColumn>

            <FooterColumn title={t("footer.company")}>
              <FooterLink href="/about">{t("footer.aboutUs")}</FooterLink>
              <FooterLink href="/links">{t("footer.socialLinks")}</FooterLink>
              <FooterLink href="/privacy">{t("footer.privacy")}</FooterLink>
              <FooterLink href="/terms">{t("footer.terms")}</FooterLink>
            </FooterColumn>
          </div>

          <div>
            <h4 className="font-medium">{t("footer.newsletter")}</h4>
            <div className="mt-4">
              <NewsletterSignup />
            </div>
            <div className="mt-6">
              <h4 className="mb-3 font-medium">{t("footer.follow")}</h4>
              <SocialLinks variant="dark" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 pt-6 text-sm text-white/50 md:flex-row">
          <p>{t("footer.copyright")}</p>
          <p>Original paintings, careful documentation, worldwide collector support.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 font-medium">{title}</h4>
      <ul className="space-y-2 text-sm text-white/62">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition hover:text-white">
        {children}
      </Link>
    </li>
  )
}
