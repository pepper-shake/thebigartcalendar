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

## Card schemes (`src/lib/eventColor.ts`)
`getCardScheme(id)` picks one of six schemes deterministically from the event id. The same scheme colours the card, the event-page panel and its action buttons.

| bg | fg | chip |
|---|---|---|
| blush `#E4B6D1` | oxblood `#5A1F2D` | white 50% |
| forest `#263322` | lime `#B0E2A0` | black 20% |
| sky `#92B8DA` | oxblood `#5A1F2D` | white 50% |
| wine `#5A1F2E` | pink `#ED87AF` | black 20% |
| butter `#FEEA8A` | cornflower `#427BB7` | white 50% |
| olive `#AAA462` | cream `#FFE4AD` | black 20% |

## Layout (desktop, from Figma)
- **Navigation is pinned.** The logo, filters, month strip and day strip never scroll, on desktop or mobile. Only the cards below them scroll (`CalendarClient` / `MobileAgenda`).
- **The logo shrinks on scroll** (Figma "Scrolling" frame, `288:5052`), staying on two lines. At rest the wordmark is large (up to 82px). When the visitor scrolls down it shrinks to 32px (24–32px on phones), and grows back when they scroll to the top. Size, top offset and header height come from two registered custom properties (`--logo-size`, `--logo-top`; `.site-header` in `globals.css`), so a single 520ms ease-out transition moves them together and the pinned strips glide up with the logo. `RootHeader` follows both real scrolling (any vertical scroll container, or the window) and the gesture itself (wheel or swipe), so it also works when all the cards fit on screen. The animation is skipped under `prefers-reduced-motion`.
- Cards are 3 per row (2 on tablet, 1 on mobile), filling the row with a 16px gap inside 24px gutters, and are 552px tall. The image fills the space left under the text and zooms to `1.015` on hover.
- Month strip: 24px serif, spread across the row (`px-[120px]`). Day strip: 18px serif with full day names and a 44px gap. In both, the active item is *italic semibold* instead of underlined.
- Event page: the panel is the full-strength card scheme. The title is in the serif, meta lines and pills are in Geist, and "More events in …" is a 3-up grid of cards.

## Deviations from Figma (kept to the reference's rules)
- Figma sets the event-page title in Host Grotesk SemiBold and the description in Oxygen. We use Newsreader 300 for both ("one serif, one weight").
- Figma rounds the event-page image (17px). We keep it square.
- Figma marks the active month/day with Newsreader **SemiBold** Italic. We follow Figma here, which is the one place a heavier weight appears.
- Figma's header has no year selector. The year select is kept, because it's needed to reach next year's events.

## Not yet restyled
- The places directory cards keep the single `PLACE_COLOR` (`#EDEBE1`), which sits close to the new page background.
- Mobile has no Figma frame yet. It reuses the desktop tokens.
