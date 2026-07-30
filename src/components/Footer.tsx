"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useLanguage } from "@/context/LanguageContext"
import NewsletterSignup from "@/components/NewsletterSignup"
import PaymentBadges from "@/components/PaymentBadges"
import SocialLinks from "@/components/SocialLinks"
import TrackableEmailLink from "@/components/TrackableEmailLink"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-stone-200 bg-[#f7f5f0] text-[#1d1c18]">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mb-10 grid grid-cols-2 gap-4 border-b border-stone-200 pb-8 md:grid-cols-4">
          <GuaranteeItem title="Free insured shipping" text="Included worldwide, door to door" />
          <GuaranteeItem title="Hand-painted originals" text="Signed certificate of authenticity" />
          <GuaranteeItem title="30-day returns" text="Refund within 5 business days" />
          <GuaranteeItem title="Secure payment" text="PayPal and major cards over SSL" />
        </div>

        <div className="grid gap-10 border-b border-stone-200 pb-10 lg:grid-cols-[1.2fr_2fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-stone-500">Talk to the studio</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">
              Ask about size, finish, and room fit before you order.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <TrackableEmailLink email={contactEmail} className="block text-stone-700 hover:text-black" leadType="footer_email">
                {contactEmail}
              </TrackableEmailLink>
              <a
                href={getWhatsAppUrl("Hello YiiArt, I found you from the website footer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-stone-700 hover:text-black"
              >
                WhatsApp +{whatsappNumber}
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FooterColumn title="Customer Services">
              <FooterLink href="/faq">{t("footer.faq")}</FooterLink>
              <FooterLink href="/reviews">{t("footer.reviews")}</FooterLink>
              <FooterLink href="/shipping-returns">Shipping & Delivery</FooterLink>
              <FooterLink href="/returns">{t("footer.returns")}</FooterLink>
              <FooterLink href="/custom-painting">Art Commission</FooterLink>
              <FooterLink href="/contact">{t("footer.contactUs")}</FooterLink>
            </FooterColumn>

            <FooterColumn title="Shop">
              <FooterLink href="/artworks">{t("footer.allArtworks")}</FooterLink>
              <FooterLink href="/artworks">New Arrivals</FooterLink>
              <FooterLink href="/collections/large-canvas-art">Best Sellers</FooterLink>
              <FooterLink href="/artworks?category=Abstract">{t("footer.abstract")}</FooterLink>
              <FooterLink href="/artworks?category=Texture">{t("footer.texture")}</FooterLink>
              <FooterLink href="/collections/abstract-art-for-living-room">{t("footer.livingRoomArt")}</FooterLink>
            </FooterColumn>

            <FooterColumn title="About">
              <FooterLink href="/about">{t("footer.aboutUs")}</FooterLink>
              <FooterLink href="/artists">{t("common.artists")}</FooterLink>
              <FooterLink href="/art-in-real-homes">{t("footer.artInRealHomes")}</FooterLink>
              <FooterLink href="/privacy">{t("footer.privacy")}</FooterLink>
              <FooterLink href="/terms">{t("footer.terms")}</FooterLink>
            </FooterColumn>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-[0.1em] text-stone-500">{t("footer.newsletter")}</h4>
            <div className="mt-4">
              <NewsletterSignup />
            </div>
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium uppercase tracking-[0.1em] text-stone-500">{t("footer.follow")}</h4>
              <SocialLinks />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 md:flex-row md:items-center">
          <PaymentBadges />
          <p className="text-xs text-stone-500">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

function GuaranteeItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-l border-stone-300 pl-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-stone-500">{text}</p>
    </div>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium uppercase tracking-[0.1em] text-stone-500">{title}</h4>
      <div className="mt-4 grid gap-2">{children}</div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm text-stone-700 transition-colors hover:text-black">
      {children}
    </Link>
  )
}
