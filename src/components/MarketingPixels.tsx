"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

const CONSENT_KEY = "yiiart-cookie-consent"

export default function MarketingPixels() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const pinterestTagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID

  useEffect(() => {
    const updateConsent = () => {
      setAnalyticsAllowed(localStorage.getItem(CONSENT_KEY) === "accepted")
    }

    updateConsent()
    window.addEventListener("yiiart:cookie-consent", updateConsent)

    return () => window.removeEventListener("yiiart:cookie-consent", updateConsent)
  }, [])

  if (!analyticsAllowed) {
    return null
  }

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script
            id="yiiart-ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(gaId)}, { anonymize_ip: true });
              `,
            }}
          />
        </>
      )}

      {metaPixelId && (
        <Script
          id="yiiart-meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', ${JSON.stringify(metaPixelId)});
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {pinterestTagId && (
        <Script
          id="yiiart-pinterest-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e){if(!window.pintrk){window.pintrk=function(){
              window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
              var n=window.pintrk;n.queue=[],n.version="3.0";
              var t=document.createElement("script");t.async=!0;
              t.src=e;var r=document.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
              pintrk('load', ${JSON.stringify(pinterestTagId)});
              pintrk('page');
            `,
          }}
        />
      )}
    </>
  )
}
