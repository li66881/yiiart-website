"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useLanguage } from "@/context/LanguageContext"
import NewsletterSignup from "@/components/NewsletterSignup"
import PaymentBadges from "@/components/PaymentBadges"
import SocialLinks from "@/components/SocialLinks"
import TrackableEmailLink from "@/components/TrackableEmailLink"
import { siteAssetUrl } from "@/lib/assets"
import { contactEmail, getWhatsAppUrl, whatsappNumber } from "@/lib/site"
import type { CatalogNavigationState } from "@/lib/storefront/catalog-navigation"
import { getFooterNavigationModel } from "@/lib/storefront/catalog-presentation"

type FooterClientProps = {
  navigationState: CatalogNavigationState
}

export default function FooterClient({ navigationState }: FooterClientProps) {
  const { t } = useLanguage()
  const shopLinks = [
    { title: t("footer.allArtworks"), href: "/artworks" },
    { title: "Custom Painting", href: "/custom-painting" },
    { title: "Size Guide", href: "/size-guide" },
    { title: "Large Wall Art", href: "/collections/large-canvas-art" },
    { title: t("footer.abstract"), href: "/artworks?category=Abstract" },
    { title: t("footer.texture"), href: "/artworks?category=Texture" },
    { title: t("footer.livingRoomArt"), href: "/collections/abstract-art-for-living-room" },
    { title: t("footer.texturedWallArt"), href: "/collections/textured-wall-art" },
    { title: t("common.artists"), href: "/artists" },
  ]
  const footerNavigation = getFooterNavigationModel(
    shopLinks,
    [
      { title: t("footer.contactUs"), href: "/contact" },
      { title: t("footer.reviews"), href: "/reviews" },
      { title: t("footer.artInRealHomes"), href: "/art-in-real-homes" },
      { title: "Wall Art Guide", href: "/guides/home-wall-art-pairing-guide" },
      { title: t("footer.faq"), href: "/faq" },
      { title: "Shipping & Returns", href: "/shipping-returns" },
      { title: t("footer.shippingInfo"), href: "/shipping" },
      { title: t("footer.returns"), href: "/returns" },
    ],
    navigationState,
  )

  return (
    <footer className="border-t border-black/15 bg-[#1e2520] text-[#fffdf8]">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="mb-14 grid grid-cols-2 gap-6 border-b border-white/15 pb-10 lg:grid-cols-4">
          <GuaranteeItem title="Worldwide delivery options" text="Confirmed by destination and carrier route" />
          <GuaranteeItem title="Hand-painted to order" text="Natural variations in brushwork and color" />
          <GuaranteeItem title="Return conditions" text="Standard and custom orders may differ" />
          <GuaranteeItem title="Secure payment" text="Encrypted provider processing" />
        </div>

        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.1fr_2fr_0.9fr]">
          <div>
            <img src={siteAssetUrl("/brand/yiiart-logo-light.svg")} alt="YiiArt" className="h-9 w-auto" />
            <p className="mt-5 max-w-xs font-serif text-lg leading-7 text-white/75">{t("footer.tagline")}</p>
            <div className="mt-5 space-y-2">
              <TrackableEmailLink email={contactEmail} className="block text-sm text-white/72 transition-colors hover:text-white" leadType="footer_email">
                {contactEmail}
              </TrackableEmailLink>
              <a
                href={getWhatsAppUrl("Hello YiiArt, I found you from the website footer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-white/72 transition-colors hover:text-white"
              >
                WhatsApp +{whatsappNumber}
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FooterColumn title={t("footer.shop")}>
              {footerNavigation.shop.map((item) => (
                <FooterLink key={item.href} href={item.href}>{item.title}</FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.support")}>
              {footerNavigation.support.map((item) => (
                <FooterLink key={item.href} href={item.href}>{item.title}</FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.company")}>
              <FooterLink href="/about">{t("footer.aboutUs")}</FooterLink>
              <FooterLink href="/links">{t("footer.socialLinks")}</FooterLink>
              <FooterLink href="/privacy">{t("footer.privacy")}</FooterLink>
              <FooterLink href="/terms">{t("footer.terms")}</FooterLink>
            </FooterColumn>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-[0.12em] text-[#d7aa8f]">{t("footer.newsletter")}</h4>
            <div className="mt-4">
              <NewsletterSignup />
            </div>
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-[#d7aa8f]">{t("footer.follow")}</h4>
              <SocialLinks variant="dark" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 md:flex-row md:items-center">
          <PaymentBadges variant="dark" />
          <p className="text-xs uppercase tracking-[0.06em] text-white/45">Hand-painted canvases, thoughtful room guidance, worldwide collector support.</p>
        </div>
        <div className="pt-4 text-xs uppercase tracking-[0.06em] text-white/45">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

function GuaranteeItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-white/90">{title}</p>
      <p className="mt-1 text-xs text-white/55">{text}</p>
    </div>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#d7aa8f]">{title}</h4>
      <ul className="space-y-2 text-sm text-white/68">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors duration-200 hover:text-white">
        {children}
      </Link>
    </li>
  )
}
