# Homepage

`/` is an editorial landing (Figma "Home page"); the calendar itself lives at **`/calendar`** (moved from `/` in Nov 2026). Breadcrumbs, the menu and the footer's "All events" point at `/calendar`; the wordmark points home.

## Layout
Figma "Calendar" → **"Home page"** (`387:2803`, at the top) and **"Home page scroll"** (`411:2361`, scrolled). Section styles are in [`Home.module.css`](../../src/components/home/Home.module.css); fluid sizes reach the Figma values at 1440px, with 50px gutters (`--site-gap`, 24px on phones).
- **Header** — the site header ([`SiteHeader`](../../src/components/layout/SiteHeader.tsx), described in [style.md](../design/style.md) → Layout) with `overHero`: fixed, a 70% oxblood bar with cream text over the hero (Figma `417:4438`); once the page scrolls (>8px) it becomes the cream bar with oxblood text it is on every other page. Its "This month" link (`/#this-month`) lands on the editor's choice band; opening a panel over the hero also turns it into the bar.
- **Hero** — full-bleed photo ([`public/home/hero.jpg`](../../public/home/hero.jpg), via `next/image` with `preload`) under a 40% oxblood wash, the two-line wordmark (Newsreader 300, 82/76) centred on it as the page's `<h1>`. 811px tall at desktop (`clamp(440px, 85svh, 811px)`).
- **"Next events in Portugal →" + next days** ([`NextDays.tsx`](../../src/components/home/NextDays.tsx), days from [`nextEventDays()`](../../src/lib/nextEventDays.ts)): the link (to `/calendar`, 32px serif; the region follows `REGION`) on the left and the next 4 days that have events on the right, styled like the calendar's day strip (Newsreader 300 18px, hairlines, today italic semibold when it has events). A multi-day event counts on every day it runs, as in the calendar. Each day links to `/calendar?date=YYYY-MM-DD`, which opens the calendar on that day (`initialDate` in `CalendarClient`; the canonical stays `/calendar`). On phones the strip scrolls sideways.
- **Editor's choice** ([`EditorChoice.tsx`](../../src/components/home/EditorChoice.tsx)) — a sand `#E5E1D3` band (`id="this-month"`) with the label row inside it: "Editor choice in <u>November</u>" (italic 32px; the month links to `/calendar`) plus `#type` links to the active type hubs (hidden ≤768px). Then four equal cards in ink: a 310:240 image, two meta lines in Geist 16 (place, then date · time in venue local time), a 24px serif title. 4-up from 1024px, 2-up from 640px; on phones the row scrolls sideways (78vw cards). Unlike the Figma frame's placeholder text, the meta lines are the event's own. Emits `ItemList` JSON-LD.
- **Newsletter sign-up** ([`NewsletterSignup.tsx`](../../src/components/home/NewsletterSignup.tsx)) — the blush band (`CARD_SCHEMES[0]`, oxblood text and button): "Sketch. Make. Meet artists. In your city." (42/56) and a 24px subline, then an underlined italic e-mail field, a Subscribe button and the consent line. A plain `<form>` posting to the `subscribeToNewsletter` server action, so it works before hydration; it shows "Thank you! You're on the list." in place of the form.
- `SiteFooter` (flush, straight after the newsletter).

**Deviations from Figma:** copy is in sentence case (style.md rule) where Figma is all lower-case, except the wordmark. Font weights follow Figma exactly: card meta and `#type` links Geist Regular 400, newsletter title and subline Newsreader Regular 400, everything else Newsreader 300 (Newsreader is loaded at 300/400/600). The scroll frame's olive editor's-choice band was not used — the sand band from "Home page" is.

[`WhatsNew.tsx`](../../src/components/home/WhatsNew.tsx) / [`whatsNew.ts`](../../src/lib/whatsNew.ts) (the events + blog-post feed) are no longer on the page — the new design has no slot for them — but are kept for reuse.

## Choosing the editor's picks
Picks are set by hand each month in [`src/lib/editorPicks.ts`](../../src/lib/editorPicks.ts): `EDITOR_PICKS['2026-11'] = ['event-slug', …]` — slugs are the part after `/events/`, in display order; the homepage shows four (`EDITOR_PICKS_COUNT`). Picks that are hidden, deleted or finished drop out. A pick can be `{ slug, image }` to use a different image on the homepage card only (the event page is unchanged); put uploaded files in `public/editor-picks/<YYYY-MM>/`. Missing places are topped up with the soonest upcoming events that have an image; when **no** pick is live the label reads "Coming up in <Month>" instead of "Editor choice".

## Caching
The page uses `export const revalidate = 600` (ISR) rather than `force-dynamic`, so it hits Neon at most every 10 minutes instead of per visit. Picks changes ship with a deploy, which rebuilds it.

## Newsletter (collect-only)
Sign-ups go to the `newsletter_subscribers` table ([schema snapshot](../generated/db-schema.md)); **no e-mails are sent yet**. The server action lower-cases the address, ignores repeats (`ON CONFLICT DO NOTHING`), stores the consent wording from [`src/lib/newsletter.ts`](../../src/lib/newsletter.ts), and treats a filled honeypot field (`company`) as a silent success. To read the list, query the table in Retool or `npm run db:studio`.

The table was created by hand, not with `db:push` (which can overreach, see AGENTS.md landmines):

```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email text PRIMARY KEY,
  source text NOT NULL,
  consent_text text NOT NULL,
  status text NOT NULL DEFAULT 'subscribed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

Before the first newsletter goes out: choose a sending provider, confirm addresses (double opt-in) and add an unsubscribe link, as noted in [SECURITY.md](../SECURITY.md).
