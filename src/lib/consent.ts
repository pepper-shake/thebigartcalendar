// Analytics consent (Google Analytics + Microsoft Clarity), stored per browser.
// `null` = not decided yet → the banner shows. Nothing is sent to Clarity, and
// GA runs in consent-mode "denied" (no cookies), until the visitor accepts.

export type Consent = 'granted' | 'denied';

export const CONSENT_KEY = 'bac-analytics-consent';
const CHANGE_EVENT = 'bac-consent-change';

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/** Save a choice (or `null` to ask again) and notify listeners in this tab. */
export function writeConsent(value: Consent | null) {
  try {
    if (value) localStorage.setItem(CONSENT_KEY, value);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
