# Analytics — Google Analytics + Microsoft Clarity

Two tools, both behind one consent banner (the audience is in the EU, so analytics cookies and session recording need opt-in).

| Tool | What it's for | ID | Env override |
|---|---|---|---|
| Google Analytics 4 | Traffic, sources, page views | `G-HVVFL89D97` | `NEXT_PUBLIC_GA_ID` |
| Microsoft Clarity | Session recordings, heatmaps, rage/dead clicks | `z388qcjow1` | `NEXT_PUBLIC_CLARITY_ID` |

Clarity was picked over Datadog Session Replay (2026-10-25): free with no session cap, built for product questions (heatmaps, scroll depth), and links to GA. Datadog is paid per session and aimed at engineering debugging (errors, traces).

## How consent works
- **Choice storage:** `localStorage['bac-analytics-consent']` = `granted` | `denied`; missing = not asked yet → the banner shows. Helpers in [src/lib/consent.ts](../../src/lib/consent.ts).
- **Google Analytics** ([GoogleAnalytics.tsx](../../src/components/analytics/GoogleAnalytics.tsx)) always loads, in **Consent Mode**: `analytics_storage` and all ad signals default to `denied` (no cookies, only anonymous pings), and a stored `granted` choice is applied before `config`.
- **Clarity** ([Consent.tsx](../../src/components/analytics/Consent.tsx)) is **not loaded at all** until the visitor accepts. On load it's told `consentv2 { analytics_Storage: granted, ad_Storage: denied }`, which is the consent signal Clarity expects for EEA visitors.
- **Changing your mind:** "Cookie settings" in the site footer (rendered on every page) re-opens the banner **without clearing the stored choice** — the current choice is the filled button, and × closes it unchanged. Picking a new option saves it and pushes it to both tools (`gtag('consent','update')` / `clarity('consentv2')`).
- **Banner copy:** "It's that bothersome cookie notice" + a short paragraph, in `ConsentBanner` in Consent.tsx.
- Clarity's default masking stays on (form inputs are masked), so contact-form text isn't recorded.

## Clarity dashboard
- Platform tiles in "Installation methods" (Wix, Shopify, WordPress…) don't apply; this is a custom Next.js app, so the tag is in code.
- The project ID is under **Settings → Overview**.
- Local dev (`localhost`) also sends recordings once you accept; filter by URL in the dashboard, or decline locally.
