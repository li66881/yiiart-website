import assert from "node:assert/strict"
import test from "node:test"
import { buildSiteIdentityJsonLd } from "./site-identity-schema"

test("describes YiiArt as an online store with discoverable brand and customer contact details", () => {
  assert.deepEqual(buildSiteIdentityJsonLd({
    siteName: "YiiArt",
    siteUrl: "https://www.yiiart.com",
    logoUrl: "https://www.yiiart.com/brand/yiiart-mark.svg",
    sameAs: ["https://www.instagram.com/yiiartstudio/"],
    contactEmail: "support@example.com",
    contactTelephone: "+8617538137711",
  }), {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": "https://www.yiiart.com/#organization",
        name: "YiiArt",
        url: "https://www.yiiart.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.yiiart.com/brand/yiiart-mark.svg",
          width: 160,
          height: 160,
        },
        sameAs: ["https://www.instagram.com/yiiartstudio/"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Service",
          email: "support@example.com",
          telephone: "+8617538137711",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.yiiart.com/#website",
        name: "YiiArt",
        url: "https://www.yiiart.com",
        publisher: { "@id": "https://www.yiiart.com/#organization" },
      },
    ],
  })
})

test("omits a contact point when no public contact method is configured", () => {
  const result = buildSiteIdentityJsonLd({
    siteName: "YiiArt",
    siteUrl: "https://www.yiiart.com",
    logoUrl: "https://www.yiiart.com/brand/yiiart-mark.svg",
    sameAs: [],
  })

  assert.equal("contactPoint" in result["@graph"][0], false)
})
