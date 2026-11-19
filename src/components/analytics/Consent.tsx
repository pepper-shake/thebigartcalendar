'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
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

// Fired by the footer's "Cookie settings" link to re-open the banner without
// forgetting the stored choice.
const OPEN_EVENT = 'bac-consent-open';

// 'server' while rendering on the server / hydrating: render nothing, so the
// banner never flashes for visitors who already chose.
const getServerSnapshot = () => 'server' as const;

export default function Consent() {
  const consent = useSyncExternalStore<Consent | null | 'server'>(
    subscribeConsent,
    readConsent,
    getServerSnapshot,
  );
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

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
      {(consent === null || reopened) && (
        <ConsentBanner
          current={consent}
          onChoose={(c) => {
            writeConsent(c);
            setReopened(false);
          }}
          onClose={reopened && consent !== null ? () => setReopened(false) : undefined}
        />
      )}
    </>
  );
}

function ConsentBanner({
  current,
  onChoose,
  onClose,
}: {
  current: Consent | null;
  onChoose: (c: Consent) => void;
  /** Only when re-opened from the footer with a choice already stored. */
  onClose?: () => void;
}) {
  const btn = 'border border-ink py-2';
  const filled = `${btn} bg-ink text-[var(--page)] hover:bg-ink/90`;
  const outline = `${btn} hover:bg-ink/5`;
  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      className="fixed z-[60] bottom-4 inset-x-4 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-sm p-5 text-ink"
      style={{
        backgroundColor: 'var(--page)',
        boxShadow: '0 4px 20px rgb(56 52 48 / .15)',
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="consent-title" style={{ fontSize: 20, lineHeight: 1.2 }}>
          It&rsquo;s that bothersome cookie notice
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 px-1 text-xl leading-none hover:opacity-70"
          >
            &times;
          </button>
        )}
      </div>
      <p className="mt-2" style={{ fontSize: 16, lineHeight: 1.35 }}>
        Our website uses cookies for analytics, styling, and functional purposes. By accepting
        cookies, you&rsquo;ll get the best version of our website &ndash; and we&rsquo;ll be able
        to process some of your data to make that happen.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2" style={{ fontSize: 16 }}>
        {/* The stored choice is the filled button; Accept by default. */}
        <button
          type="button"
          onClick={() => onChoose('denied')}
          aria-pressed={current === null ? undefined : current === 'denied'}
          className={current === 'denied' ? filled : outline}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => onChoose('granted')}
          aria-pressed={current === null ? undefined : current === 'granted'}
          className={current === 'denied' ? outline : filled}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

/** Footer link that re-opens the banner; the stored choice stays until a new one is made. */
export function ConsentSettingsLink({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={className}
      style={style}
    >
      Cookie settings
    </button>
  );
}
