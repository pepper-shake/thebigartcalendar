// Custom Google Analytics events. gtag is defined by GoogleAnalytics.tsx; in
// consent-mode "denied" GA still receives these as cookieless pings. Clarity
// gets the same name as a custom tag, so recordings can be filtered by it.

type Gtag = (...args: unknown[]) => void;
type WindowWithTags = Window & { gtag?: Gtag; clarity?: Gtag };

export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  const w = window as WindowWithTags;
  w.gtag?.('event', name, params);
  w.clarity?.('event', name);
}
