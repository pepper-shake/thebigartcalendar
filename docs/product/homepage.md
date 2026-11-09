# Homepage

`/` is an editorial landing (Figma "Home page"); the calendar itself lives at **`/calendar`** (moved from `/` in Nov 2026). Breadcrumbs, the menu and the footer's "All events" point at `/calendar`; the wordmark points home.

## Layout
Sizing and spacing follow the **Myoan** Ghost theme (fueko, ThemeForest licence); fonts and colours stay the site's own. All of it is in [`Home.module.css`](../../src/components/home/Home.module.css): Myoan's fluid type scale (`--font-size-xl` … `-xxs`, its rem values at a 10px root), 5vw page gutters, a 4vw grid gap and a 1730px max content width. One deviation: serif card titles use line-height 1.08 (large) / 1.15 (small) instead of Myoan's 1.2 / 1.3, which were set for its sans fonts.
- **Header** — the site-wide header (see [style.md](../design/style.md) → Layout): text links either side of the wordmark from `lg` up.
- **Intro** — the page's `<h1>`, Newsreader 300 italic at Myoan's L size (30–60px).
- **Editor's choice** ([`EditorChoice.tsx`](../../src/components/home/EditorChoice.tsx)) — label row ("Editor choice in November", plus `#type` links to the active type hubs, hidden ≤768px), then the olive band (`CARD_SCHEMES[4]` background `#AAA462`, off-white text `#FFFEF9` as in the footer), as Myoan's "Editor's Choice" grid: 4:3 images; the lead card spans 2 of 4 columns and 2 rows, flush with the band's top edge, with an XL title and the description; the small cards (Myoan's compact sizes: S titles 18–30px, XXXS meta 18–20px) start 6vh lower. 481–1024px: lead takes 10/15, two small cards beside it, the rest hidden. ≤480px: lead full width without the description, small cards 2-up. Unlike Myoan, the meta lines (place, date, time) stay on phones, since dates matter for events. Emits `ItemList` JSON-LD.
- **Newsletter sign-up** ([`NewsletterSignup.tsx`](../../src/components/home/NewsletterSignup.tsx)) — Figma's blush band (`CARD_SCHEMES[0]`, oxblood text and button): "Sign up for our monthly newsletter!" at Myoan's L size, an underlined italic e-mail field, a Subscribe button and the consent line. A plain `<form>` posting to the `subscribeToNewsletter` server action, so it works before hydration; it shows "Thank you! You're on the list." in place of the form.
- **What's new?** ([`WhatsNew.tsx`](../../src/components/home/WhatsNew.tsx), selection in [`src/lib/whatsNew.ts`](../../src/lib/whatsNew.ts)) — on the page background (`--page` `#F2EFE4`, `--ink` `#383430` text), italic XL heading, then Myoan's feed grid: 15 columns, the lead spans 10 columns and two rows, the rest 5 (two beside the lead, then a row of three); one column on phones (≤480px), where the lead loses its excerpt. Six cards mixing upcoming events with blog posts: the newest post leads and posts take slots 1 and 5 while there are any; events are the soonest-starting ones with an image, skipping titles already in Editor's choice (other dates of a series too). Meta lines: place · date · time for events, the date for posts (no tags). Blog cards open in a new tab via `BlogCardLink` (same `blog_card_click` analytics as `/blog`). Ends with "See the full calendar →".
- `SiteFooter` (flush, straight after What's new).

## Choosing the editor's picks
Picks are set by hand each month in [`src/lib/editorPicks.ts`](../../src/lib/editorPicks.ts): `EDITOR_PICKS['2026-11'] = ['event-slug', …]` — slugs are the part after `/events/`; the first is the large card. Picks that are hidden, deleted or finished drop out. Missing places are topped up with the soonest upcoming events that have an image; when **no** pick is live the label reads "Coming up in <Month>" instead of "Editor choice".

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
