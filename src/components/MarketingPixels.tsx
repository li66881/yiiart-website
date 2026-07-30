"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { trackPageView } from "@/lib/marketing-events"

const CONSENT_KEY = "yiiart-cookie-consent"

export default function MarketingPixels() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const trackedUrlRef = useRef<string | null>(null)
  const pathname = usePathname()
  const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-8B8R7YY67Q"
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const pinterestTagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

  useEffect(() => {
    const updateConsent = () => {
      setAnalyticsAllowed(localStorage.getItem(CONSENT_KEY) === "accepted")
    }

    updateConsent()
    window.addEventListener("yiiart:cookie-consent", updateConsent)

    return () => window.removeEventListener("yiiart:cookie-consent", updateConsent)
  }, [])

  useEffect(() => {
    if (!analyticsAllowed) return

    const currentUrl = window.location.href

    if (gaId) {
      const gtag = (window as Window & { gtag?: (...args: any[]) => void }).gtag
      gtag?.("consent", "update", {
        analytics_storage: "granted",
      })
    }

    if (trackedUrlRef.current === currentUrl) return

    trackedUrlRef.current = currentUrl
    trackPageView(currentUrl)
  }, [analyticsAllowed, gaId, pathname])

  if (!analyticsAllowed) {
    return null
  }

  return (
    <>
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

      {tiktokPixelId && (
        <Script
          id="yiiart-tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
                ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
                o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
                var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load(${JSON.stringify(tiktokPixelId)});
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  )
}
