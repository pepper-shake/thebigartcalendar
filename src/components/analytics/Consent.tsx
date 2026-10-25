'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Script from 'next/script';
import { readConsent, subscribeConsent, writeConsent, type Consent } from '@/lib/consent';

/**
 * Consent banner + Microsoft Clarity loader.
 *
 * Clarity (session recordings, heatmaps) is only injected after the visitor
 * accepts. Google Analytics is always loaded (see GoogleAnalytics.tsx) but in
 * consent-mode "denied" until then; this component flips it on accept/decline.
 * The project ID can be overridden via `NEXT_PUBLIC_CLARITY_ID`.
 */
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? 'z388qcjow1';

type Gtag = (...args: unknown[]) => void;
type WindowWithTags = Window & { gtag?: Gtag; clarity?: Gtag };

// 'server' while rendering on the server / hydrating: render nothing, so the
// banner never flashes for visitors who already chose.
const getServerSnapshot = () => 'server' as const;

export default function Consent() {
  const consent = useSyncExternalStore<Consent | null | 'server'>(
    subscribeConsent,
    readConsent,
    getServerSnapshot,
  );

  useEffect(() => {
    if (consent === 'server' || consent === null) return;
    const w = window as WindowWithTags;
    const state = consent === 'granted' ? 'granted' : 'denied';
    w.gtag?.('consent', 'update', { analytics_storage: state });
    // Changing the choice after Clarity has loaded (via "Cookie settings").
    w.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: state });
  }, [consent]);

  if (consent === 'server') return null;

  return (
    <>
      {consent === 'granted' && CLARITY_ID && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
            window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
          `}
        </Script>
      )}
      {consent === null && <ConsentBanner />}
    </>
  );
}

function ConsentBanner() {
  return (
    <div
      role="dialog"
      aria-label="Analytics cookies"
      className="fixed z-[60] bottom-4 inset-x-4 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-sm p-5 text-ink"
      style={{
        backgroundColor: 'var(--page)',
        boxShadow: '0 4px 20px rgb(56 52 48 / .15)',
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
      }}
    >
      <p style={{ fontSize: 16, lineHeight: 1.35 }}>
        We&rsquo;d like to use analytics cookies (Google Analytics, Microsoft Clarity) to see how
        the calendar is used. Clarity records anonymised visits. No ads, no selling data.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2" style={{ fontSize: 16 }}>
        <button
          type="button"
          onClick={() => writeConsent('denied')}
          className="border border-ink py-2 hover:bg-ink/5"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => writeConsent('granted')}
          className="border border-ink bg-ink text-[var(--page)] py-2 hover:bg-ink/90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

/** Footer link that clears the choice so the banner shows again. */
export function ConsentSettingsLink({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <button type="button" onClick={() => writeConsent(null)} className={className} style={style}>
      Cookie settings
    </button>
  );
}
