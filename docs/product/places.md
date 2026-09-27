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
- `/places` — cards filterable by city + category (`?city=lisbon&category=studio`; filtered views are `noindex`, canonical `/places`).
- `/places/[slug]` — details, map link, website/Instagram, opening hours, upcoming events + recent past events (grayscale, unlinked). JSON-LD: `ArtGallery`/`Museum`/`Store`/`LocalBusiness` (or `Organization` for organiser-only), with `event`s.
- Event pages: organiser/venue pills link to the place page when linked (one pill when organiser = venue).
- Listed in the sitemap, header menu and footer.
