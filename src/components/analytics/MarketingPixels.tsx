"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

interface MarketingConfig {
  ga4MeasurementId: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googleAdsConversionId: string | null;
  microsoftClarityId: string | null;
  hotjarId: string | null;
  googleSearchConsoleVerification: string | null;
}

/**
 * Fetches which marketing pixels are configured (siteSettings/analytics.integrations,
 * set from /admin/analytics/settings) and injects only the ones that have a real ID.
 * Nothing renders until an admin pastes a real ID in - no fabricated tracking.
 */
export default function MarketingPixels() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [config, setConfig] = useState<MarketingConfig | null>(null);

  useEffect(() => {
    if (isAdminRoute) return;
    fetch("/api/analytics/config")
      .then((res) => (res.ok ? res.json() : null))
      .then(setConfig)
      .catch(() => {});
  }, [isAdminRoute]);

  if (!config || isAdminRoute) return null;

  const gtagId = config.ga4MeasurementId || config.googleAdsConversionId;

  return (
    <>
      {config.googleSearchConsoleVerification && (
        <meta name="google-site-verification" content={config.googleSearchConsoleVerification} />
      )}

      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${config.ga4MeasurementId ? `gtag('config', '${config.ga4MeasurementId}');` : ""}
              ${config.googleAdsConversionId ? `gtag('config', '${config.googleAdsConversionId}');` : ""}
            `}
          </Script>
        </>
      )}

      {config.gtmContainerId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${config.gtmContainerId}');
          `}
        </Script>
      )}

      {config.metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${config.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {config.tiktokPixelId && (
        <Script id="tiktok-pixel-init" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${config.tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {config.microsoftClarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)
            })(window, document, "clarity", "script", "${config.microsoftClarityId}");
          `}
        </Script>
      )}

      {config.hotjarId && (
        <Script id="hotjar-init" strategy="afterInteractive">
          {`
            (function(h,o,t,j){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${JSON.stringify(config.hotjarId)},hjsv:6};
              var head=o.getElementsByTagName('head')[0];
              var script=o.createElement('script');script.async=1;
              script.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              head.appendChild(script);
            })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
          `}
        </Script>
      )}
    </>
  );
}
