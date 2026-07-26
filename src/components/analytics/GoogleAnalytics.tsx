import Script from "next/script";

/**
 * Google Analytics (gtag.js) loader.
 *
 * Uses `next/script` with the `afterInteractive` strategy so the tag loads
 * after hydration without blocking content — keeping the SEO-first, fast
 * first paint intact. The measurement ID can be overridden via the
 * `NEXT_PUBLIC_GA_ID` env var; it falls back to the production property.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-HVVFL89D97";

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
