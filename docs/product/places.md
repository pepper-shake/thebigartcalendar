# Places directory

A browsable directory of art places across Europe — galleries, studios, museums, workshop spaces, shops, collectives — **with or without events on the calendar**. It exists because some places are hard or impossible to scrape; listing the place still lets users go straight to it (website, Instagram, map, opening hours).

## What a Place is
One row in the `places` table ([schema](../../src/db/schema.ts), [snapshot](../generated/db-schema.md)). A place is a **venue** (where you go), an **organiser** (who runs events, may move around), or **both** (`kind`). `category` drives the label and schema.org type: gallery · museum · studio · workshop-space · shop · artist-run · collective · other.

## How places get in
- **Curated, never scraped.** The scraper does not create places. It only *links* to places that already exist.
- **Source of truth for adds/edits: [scripts/places/places.ts](../../scripts/places/places.ts)** — reviewable data in git. `npm run places:sync` upserts every entry (keyed on `id`). Workflow: the operator sends a name/link in chat → research the place (own website first; coords via OpenStreetMap Nominatim; leave unknown fields null rather than guess) → append an entry → sync.
- **Removing:** set `status: 'hidden'` and sync. The sync never deletes rows.
- **Initial backfill (2026-09-27):** every venue/organiser on existing events, plus scraped sources with no current events (Bryon Studios, MACBA).

## How events link to places
**At read time, not in the DB.** [src/lib/place-match.ts](../../src/lib/place-match.ts) matches an event's `venue` and `organiser_name` (falling back to `source_name`) against each place's `name` + `aliases`, after slug-normalization (`"Hostelis ''El Nido''"` = `"Hostelis El Nido"`):
- **Venue** → must be the same city.
- **Organiser** → same city preferred; otherwise any city if exactly one place has that name (a Vilnius studio running sessions on the coast).

Consequences: no FK on `events`, the scraper and the curation guard are untouched, and adding a place instantly links its past and future events. **Fix a wrong/missing link by editing the place's `aliases`** (or its city). See [decision #0008](../design/decisions.md).

## On the site
- `/places` — cards (all one neutral colour, `PLACE_COLOR` = `#EDEBE1` in `src/lib/places.ts`, unlike event cards' per-id colours) filterable by city + category (`?city=lisbon&category=studio`; filtered views are `noindex`, canonical `/places`).
- `/places/[slug]` — details on a `PLACE_COLOR` panel, map link, website/Instagram, opening hours, upcoming events + recent past events (grayscale, unlinked). JSON-LD: `ArtGallery`/`Museum`/`Store`/`LocalBusiness` (or `Organization` for organiser-only), with `event`s.
- **Instagram posts** (optional): an "On IG @handle" section on `/places/[slug]`, below the place panel and upcoming events — cream (`#fbfaf6`) cards, 24px padding, three across on desktop, swipeable on mobile (Figma "Calendar" file, node 310:1933). Posts are hand-picked: paste post/reel links under the place's `id` in [src/lib/place-instagram-posts.ts](../../src/lib/place-instagram-posts.ts) (code, not the DB — no sync needed; ships on deploy). They don't auto-update; every place with an Instagram account was seeded on 2026-10-25 with its first four posts (pinned first) — swap any for better picks. When adding a new place with an Instagram account, add its posts here too. **Photo-only crop:** the embed is a cross-origin iframe (can't be styled), so it sits in a clipping window that hides Instagram's header and footer; the whole tile links to the post. The embed is rendered at the card width (clamped to Instagram's 326–540px) and CSS-scaled to fit; tuned for 4:5 media (`HEADER_CROP`/`FOOTER_TRIM` in [InstagramPosts.tsx](../../src/components/places/InstagramPosts.tsx)) — retune if Instagram changes its embed layout. Hiding the account row departs from Instagram's embed guidelines; attribution is kept by the section heading (`@handle`) and the link. Free, and the photos stay on Instagram with attribution (we never copy them — same rule as ig-radar). **Click-to-load:** the embeds set Meta cookies, so nothing loads from Instagram until the visitor clicks "Show posts"; the choice is remembered in `localStorage['bac-instagram-embeds']`. Before that, the server-rendered fallback is plain links to each post.
- Event pages: organiser/venue pills link to the place page when linked (one pill when organiser = venue).
- Listed in the sitemap, header menu and footer.
