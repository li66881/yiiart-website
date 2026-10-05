type SiteIdentityInput = {
  siteName: string
  siteUrl: string
  logoUrl: string
  sameAs: string[]
  contactEmail?: string
  contactTelephone?: string
}

export function buildSiteIdentityJsonLd({
  siteName,
  siteUrl,
  logoUrl,
  sameAs,
  contactEmail,
  contactTelephone,
}: SiteIdentityInput) {
  const contactPoint = {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    ...(contactEmail ? { email: contactEmail } : {}),
    ...(contactTelephone ? { telephone: contactTelephone } : {}),
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: 160,
          height: 160,
        },
        sameAs,
        ...(contactEmail || contactTelephone ? { contactPoint } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  }
}
