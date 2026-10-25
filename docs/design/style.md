# Visual style

The site follows **Style Reference 1** (an editorial, duotone, light-serif look) as interpreted by the Figma file **Calendar → Section 3** (node `283:1928`: "Home page" `283:2065`, "Event page" `287:4457`). Where the two disagree, Figma wins for layout and exact colours, and the reference's rules win for everything else (see *Deviations* below).

## Rules
- **One serif, one weight.** All content is set in **Newsreader 300** (stand-in for the commercial Times Now), loaded in `src/app/layout.tsx` as `--font-serif`. Hierarchy comes from size and *italics*, not bold. Base styles in `globals.css` force headings and buttons to 300.
- **Geist for small meta only.** Card meta lines, type chips, event-page meta lines, pills and tags use `--font-meta` (Geist 400), as in the Figma cards.
- **Square and flat.** `--radius` is `0`. No card shadows, gradients or rounded images. Only overlays (the filter popup and menu drawer) get a shadow: `0 4px 20px rgb(56 52 48 / .15)`. The one exception to square corners is the round scroll-to-top button (an icon button, which the reference allows).
- **Duotone cards.** Each event card and its event-page panel use exactly one background and one foreground colour. Everything inside (title, meta, chip text, icons) takes the foreground colour.
- **No uppercase or letter-spacing on labels.** Use italic instead, e.g. footer column titles and contact form labels. The lowercase brand wordmark and page headings are a deliberate brand choice and stay.

## Tokens (`src/app/globals.css`)
| Token | Value | Use |
|---|---|---|
| `--page` / `bg-page` | `#F2EFE4` | Page background |
| `--ink` / `text-ink` | `#383430` | Default text and icons on the page |
| `--rule` / `border-rule` | `#B1B1B1` | Hairlines around the month and day strips |
| `--font-serif` | Newsreader | Everything |
| `--font-meta` | Geist | Card and event meta, chips |

## Favicon / app icons
"b+a+c" in pink Newsreader on a wine circle (`#5A1F2E`, the Disco Wheel pinned scheme). Next.js picks the files up by convention from `src/app/`: `favicon.ico` (16/32/48), `icon.png` (512, transparent corners) and `apple-icon.png` (180, square wine tile, since iOS masks its own corners and shows transparency as black). Regenerate all three from one 800×800 source if it changes.

## Card schemes (`src/lib/eventColor.ts`)
**Rule:** no two different events on the same page share a colour, but every date of one recurring event (a *series*) keeps the same colour.

- **Series** = same title + venue + city (normalised), e.g. every Disco Wheel "Ceramic Workshop".
- `assignCardSchemes()` runs once over all published events (inside `getPublishedEvents()`, so the calendar, event pages and hubs agree). Two series *conflict* if they're on at least one common day (multi-day exhibitions count every day they're open). Series are coloured greedily in order of their first date. Each takes its preferred colour (hashed from the series key) unless a conflicting series already has it, otherwise the next free one. Date order keeps colours stable as new events are scraped.
- Result on current data: 0 of 149 days repeat a colour, and all 26 recurring series keep a single colour. With more series on a day than colours, a repeat would be unavoidable; the least-used colour is taken then.
- `getCardScheme(event)` returns, in order: the **past scheme** for any finished event (beige `#E3DECC`, text `#72696C`, white 50% chip; Figma "Past event" `292:5169`, which also applies to pinned places), a pinned place scheme, then the assigned `schemeIndex`, then a hash of the id (fallback for events not run through `assignCardSchemes`).

| bg | fg | chip | source |
|---|---|---|---|
| blush `#E4B6D1` | oxblood `#5A1F2D` | white 50% | Figma |
| forest `#263322` | lime `#B0E2A0` | black 20% | Figma |
| sky `#92B8DA` | oxblood `#5A1F2D` | white 50% | Figma |
| butter `#FEEA8A` | cornflower `#427BB7` | white 50% | Figma |
| olive `#AAA462` | cream `#FFE4AD` | black 20% | Figma |
| cobalt `#155797` | sage `#C3D7C5` | black 20% | Style Reference |
| tomato `#EB4937` | sage `#C4D5C3` | black 20% | Style Reference |
| cocoa `#6D453E` | butter `#F4E8A9` | black 20% | Style Reference |
| tan `#C7A086` | oxblood `#5A1F2D` | white 50% | Style Reference |
| navy `#000E58` | sky `#92B8DA` | black 20% | Style Reference |

Ten pairs are needed because the busiest days carry about 8 different events and greedy colouring needs some headroom. With the 5 Figma pairs alone, 15 of 149 days repeated a colour.

**Pinned schemes:** a place can always use one scheme. `PLACE_SCHEMES` is keyed by `/places` slug and matched on the event's venue or organiser place. Disco Wheel uses wine `#5A1F2E` with pink `#ED87AF` text. Pinned schemes are reserved: they're not in the rotation, so no other event gets them. This needs place-linked events, so the calendar page loads them through `getPublishedEvents()`, like the SEO routes.

## Layout (desktop, from Figma)
- **Navigation is pinned on desktop.** The logo, filters, month strip and day strip never scroll; only the cards below them scroll (`CalendarClient`).
- **Mobile** (Figma "Mob" `296:5212` / "Scroll" `296:5353`): only the header is fixed. It has a "Menu" text button (Geist Light 18) in place of the "+" icon and the wordmark on two lines, shrinking with the scroll (see above). The filters, month strip, day strip and cards all scroll together under it (`MobileAgenda`), and a hairline appears under the header once the content has scrolled.
- **The logo shrinks with the scroll** (desktop `283:2065 → 288:5052`, mobile `296:5212 → 296:5353`), always staying on two lines. It's scroll-linked, not a toggle: `RootHeader` writes `--collapse` (0–1) from the scroll position every animation frame, over 120px on desktop and 72px on mobile, and the size, top offset, header height and mobile hairline are all computed from it in CSS (`.site-header` in `globals.css`). Scrolling halfway shrinks it halfway, and it grows back in step. Desktop goes from up to 82px down to 32px; mobile from 48px in a 161px header to 29px in a 125px one. The card area is always at least one range taller than the screen (`min-h-[calc(100%+120px)]` / `+72px`), so the logo can fully shrink even on a day with one row of cards. If nothing can scroll at all, a wheel or swipe snaps it open or closed with a short ease instead.
- Cards are 3 per row (2 on tablet, 1 on mobile), filling the row with a 16px gap inside 24px gutters, and are 552px tall. The image fills the space left under the text. On hover the whole card zooms to `1.015` (250ms ease-out); it is a transform, so the grid never reflows and the card grows only ~3px per side into the gap.
- Month strip: 24px serif, spread across the row (`px-[120px]`). Day strip: 18px serif with full day names and a 44px gap. In both, the active item is *italic semibold* instead of underlined.
- Event page: the panel is the full-strength card scheme. The title is in the serif, meta lines and pills are in Geist, and "More events in …" is a 3-up grid of cards.
- Place page (Figma "Place page" `310:1933`): a cream `#FBFAF6` panel with a 568×630 image on the right. The 52px title, italic serif meta lines (address in grey `#909090`, "Category · City, Country" in ink, city linked without underline) and the description, hours and the plain website address (no arrow, no Instagram link — the Instagram band below covers it) in Geist Light are on the left. Below it are full-width bands (`PageShell size="bleed"`) with 36px headings and 70px vertical padding, content at 1440px max with 42px gutters. "Upcoming events" has a sage `#D4D5C7` band and tomato `#EB4A38` heading (all upcoming events; per-place tweaks in `UPCOMING_OVERRIDES`: Disco Wheel shows only the next 6, as text-only cards with no photo via `EventCard hideImage`). "‹Place› on Instagram" has a wine `#5A1F2E` band and pink `#ED87AF` heading. Both band colours are fixed from Figma and the same on every place page.

## Deviations from Figma (kept to the reference's rules)
- Figma sets the event-page title in Host Grotesk SemiBold and the description in Oxygen. We use Newsreader 300 for both ("one serif, one weight").
- Figma rounds the event-page image (17px). We keep it square.
- Figma marks the active month/day with Newsreader **SemiBold** Italic. We follow Figma here, which is the one place a heavier weight appears.
- Place page: Figma sets the title and band headings in Newsreader Regular and the website link in Host Grotesk. We use Newsreader 300 and Geist Light. The Instagram heading reads "on Instagram" (Figma: "in Instagram") and links to the profile. Opening hours aren't in the frame but are kept. Past events are not shown. Instagram posts have no cream card frame.
- Figma's header has no year selector. The year select is kept, because it's needed to reach next year's events.

## Not yet restyled
- The places directory cards (`/places`) keep the single `PLACE_COLOR` (`#EDEBE1`), which sits close to the new page background. The place page itself is restyled (see above).
- Mobile has no Figma frame yet. It reuses the desktop tokens.
