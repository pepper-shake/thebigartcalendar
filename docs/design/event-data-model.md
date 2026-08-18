# Event data model (normalized) — design

**Status:** Proposed (not yet implemented). Captured as [decision #0007](decisions.md#0007--normalized-event-data-model-occurrences--wall-timezone). Supersedes the flat single-`events`-table shape once built.

This is the target relational model for events: a normalized schema separating **Type** (what kind of event) from **Tags** (topics/characteristics), with dates modelled as **occurrences** so one event can span multiple dates, venues, and organisers. It is designed for the daily scraper (dedup + normalization) and for SEO landing pages.

> The current live schema is still the flat scraper-owned `events` table. This doc describes where we're going, not what's deployed. When implemented, update this doc + [generated/db-schema.md](../generated/db-schema.md) in the same change.

## Entities

```
event_type   (id, slug*, name, description, parent_id→event_type, json_ld_type)
city         (id, slug*, name, country_code, region, lat, lng, timezone)
venue        (id, slug*, name, address, city_id→city, lat, lng, website, description)
organiser    (id, slug*, name, type[organisation|person], website, description)
tag          (id, slug*, name, category)
source       (id, name, base_url)

event
  ├── id, slug*, dedupe_hash*
  ├── name, type_id→event_type, summary, description
  ├── status (draft|published|hidden|cancelled|archived)   -- curation column
  ├── attendance_mode (in_person|online|hybrid)
  ├── is_free, price_min, price_max, currency, ticket_url
  ├── image_url
  ├── rrule                      -- OPTIONAL, provenance only (see §Recurrence)
  ├── source_id→source, source_url, scraped_at, last_seen_at
  ├── curated_at, *_override…    -- curation columns (never scraper-owned)
  └── created_at, updated_at

event_occurrence
  ├── id, event_id→event, venue_id→venue
  ├── local_start   (timestamp, NO tz)   -- intended wall-clock, source of truth
  ├── local_end     (timestamp, NO tz)
  ├── timezone      (IANA text, e.g. 'Europe/Berlin')
  ├── start_at      (timestamptz)        -- derived UTC instant, INDEXED, for queries
  ├── end_at        (timestamptz)        -- derived UTC instant
  ├── is_all_day, is_cancelled, door_time

event_organiser (event_id, organiser_id, role)  PK(event_id, organiser_id)
event_tag       (event_id, tag_id)              PK(event_id, tag_id)
```

`*` = unique constraint.

## Relationships & cardinality

| From | To | Cardinality | Via |
|---|---|---|---|
| City | Venue | 1:N | `venue.city_id` |
| Event | EventOccurrence | 1:N | `event_occurrence.event_id` — **dates/times live here** |
| Venue | EventOccurrence | 1:N | `event_occurrence.venue_id` (per-occurrence venue) |
| EventType | Event | 1:N | `event.type_id` |
| EventType | EventType | 1:N | self, sub-types |
| Source | Event | 1:N | `event.source_id` |
| Event | Organiser | **N:M** | `event_organiser` (carries `role`) |
| Event | Tag | **N:M** | `event_tag` |
| Event | Venue | **N:M** | via occurrences (no separate join table) |

An event's **city is derived** via its occurrences' venue → `venue.city_id`. Add a denormalized `event.city_id` cache only if profiling shows the join hurts city-hub pages.

## Field-treatment rationale

| Field | Treatment | Why |
|---|---|---|
| `event.type` | taxonomy table (FK) | drives type hubs + schema.org `@type`; new types shouldn't need a migration |
| tags | taxonomy table + N:M | open-ended, faceted, scraper-extensible |
| `organiser.type`, `event.status`, `attendance_mode`, `event_organiser.role`, `tag.category` | DB enums | small, fixed sets |
| `country_code` | ISO 3166 text | standard code, not worth a table |
| dates/times | see §Wall-time | DST-safe |
| coordinates | two numeric cols | PostGIS only if/when radius search is needed |

## Type vs Tags (kept separate, deliberately)

- **Type** answers *"what kind of event?"* — Exhibition, Workshop, Festival, Concert, Talk. One per event. Drives primary navigation and JSON-LD.
- **Tags** answer *"what's it about / who's it for?"* — AI, Photography, Contemporary Art, Free, Family-friendly, Outdoor. Many per event. `tag.category` groups them (`topic|medium|audience|price|format`) for faceted filtering.

## Wall-time + IANA zone (DST-safe) — the key decision

**Source of truth is the intended local wall-clock time, not a UTC instant.** For place-based events, "18:00 in Berlin" must stay 18:00 across DST transitions (CET↔CEST); storing only a UTC instant lets the displayed local time drift by an hour across the boundary.

Each occurrence stores:
- `local_start` / `local_end` — `timestamp` **without** zone: literally `2026-10-28 18:00`.
- `timezone` — the **IANA** zone (`Europe/Berlin`), never a fixed offset (`+02:00` can't express DST).
- `start_at` / `end_at` — the derived UTC instant, `timestamptz`, indexed, used for all range/calendar queries.

**Compute the instant in the scraper's normalize step, not in a DB generated column.** `start_at = local_start AT TIME ZONE timezone`, computed app-side and stored as a plain indexed `timestamptz`. This gives the identical DST-safe result while avoiding a bet on generated-column + `db:push` (drizzle-kit) support, and keeps the timezone logic in one testable place in the pipeline. (A `GENERATED ALWAYS AS (local_start AT TIME ZONE timezone) STORED` column is the theoretical alternative but risks immutability-expression rejection and shaky `db:push` diffing — see [decision #0005](decisions.md#0005--schema-changes-via-dbpush-no-migration-files).)

DST edge cases to handle in normalization: spring-forward gap (a wall time that doesn't exist) and fall-back ambiguity (a wall time that occurs twice). Art events rarely start at 01:30, so risk is low — pick a convention and log.

## Display: "Event time" vs "My time"

Two labeled, first-class concepts — never show a bare converted time that hides the venue time:

```
18:00 · Berlin        (Event time  — from local_start in `timezone`)
17:00 your time        (My time     — start_at converted to viewer zone)
```

Which one is **primary** depends on `attendance_mode`:
- `in_person` / `hybrid` → **primary = venue local time** (that's when you physically arrive); viewer-converted time is secondary.
- `online` → **primary = viewer's local time** (no venue to travel to); venue time secondary/omitted.
- `is_all_day` → show the **date only**; do **not** show a "My time" conversion (converting an all-day event across zones produces nonsense like "starts 11pm your time").

No per-user timezone is stored — anonymous SEO traffic, no accounts. Conversion is stateless in the render layer via `Intl.DateTimeFormat`. For SEO/JSON-LD, emit `Event.startDate` as ISO-8601 **with offset** (`2026-10-28T18:00:00+01:00`), derived per-date from instant + zone so DST is correct.

## Recurrence: materialize, don't RRULE at query time

Art events are almost always finite and enumerable, so **materialize occurrences**; do not query RRULE at request time.

```
Source publishes "Every Thursday 18:00"
        │  scraper expands with a bounded horizon (e.g. 18 months)
        ▼
Event ──┬── Occurrence  Aug 20, 18:00
        ├── Occurrence  Aug 27, 18:00
        └── Occurrence  Sep 03, 18:00 …
```

- `event.rrule` is stored as **provenance only** (what the source published), never the query mechanism.
- Re-expand on each scrape, bounded horizon, so the calendar/search/SEO all run against plain `event_occurrence` rows.
- Per-instance overrides (one cancelled session, one moved venue) are trivial: they're just fields on that occurrence row (`is_cancelled`, `venue_id`) — no RRULE gymnastics.

## Scraping: dedup & normalization

- **Event dedupe:** `dedupe_hash = hash(source_url + normalized_title + first_start_date)`, `UNIQUE`; upsert `ON CONFLICT (dedupe_hash) DO UPDATE`.
- **Never overwrite curation columns** on upsert — same guard as today ([scripts/lib/upsert.ts](../../scripts/lib/upsert.ts), [decision #0002](decisions.md#0002--curate-events-with-status--override-columns), [product/event-curation.md](../product/event-curation.md)).
- **Entity resolution (City/Venue/Organiser):** normalize (trim, lowercase, strip legal suffixes like "e.V."/"GmbH") → look up by normalized unique key → reuse or insert. Keep `raw_name` for audit.
- **Tags:** map scraped labels through a synonym/alias step to canonical tags (avoid `AI` / `A.I.` / `artificial-intelligence` fragmentation).

## IDs / slugs / unique constraints

- **PKs:** uuid everywhere (scraper-friendly, no sequence coordination).
- **Slugs (unique):** event, event_type, city, venue, organiser, tag — all are SEO landing pages.
- **Unique:** `event.dedupe_hash`, `event.slug`, `city(name, country_code)`, `venue(lower(name), city_id)`, `organiser(lower(name), website)`, `tag.slug`, join-table composite PKs.
- **Indexes for the calendar:** `event_occurrence(start_at)`, `event_occurrence(venue_id, start_at)`, `event(type_id)`, `event(status)`, join FK columns.

## Drizzle implementation

The Drizzle definition lives in [src/db/schema.normalized.ts](../../src/db/schema.normalized.ts) — **intentionally not referenced by `drizzle.config.ts`**, so `npm run db:push` cannot apply it until we deliberately adopt it.

Toolchain verified (2026-08-18): Neon runs **PostgreSQL 17.10**, so `uuid().defaultRandom()` → `gen_random_uuid()` needs **no extension**. `drizzle-kit generate` (0.31.10) emits clean DDL for every construct used — pgEnums, uuid PKs, composite PKs, `lower(...)` unique indexes, FKs. Instants are computed **app-side** (plain `timestamptz`), so nothing depends on generated-column support in `db:push`.

## Migration path from the flat `events` table

The current live table is the flat scraper-owned `events` ([src/db/schema.ts](../../src/db/schema.ts)): text `type`, `start_date`/`end_date` (dates), `start_time`/`end_time` (text), scalar `venue`/`city`/`country`, `tags` text[]. Cutover is **additive then backfill**, never an in-place `db:push` that drops the live table.

Ordered steps:

1. **Rename to avoid the table-name clash.** Both files declare a table literally named `events`. Create the new tables under a schema or a temporary prefix (e.g. `events_v2`, or a Postgres `schema` namespace) so the live `events` table keeps serving the site during backfill. Adopt the final `events` name only at cutover.
2. **Create the new tables** by pointing a config at `schema.normalized.ts` and pushing to a **branch DB** (Neon branching) first — never straight to production.
3. **Seed taxonomies.** `event_type` from the five current type hubs (`gallery/exhibition`, `fair/art-fair`, `workshop`, `performance`, `auction`) with `json_ld_type` mappings; `tag` from the distinct values in the existing `tags[]` arrays, run through the synonym/alias normalization.
4. **Resolve entities.** For each live row: normalize + upsert `city` (from `city`+`country`), then `venue` (from `venue`, linked to that city), then `organiser` (from `source_name` as a first pass — real organiser data is thin today).
5. **Backfill events + occurrences.** One `event` per live row (carry `status`, the `*_override` values, `image_url`, `tickets_url`→`ticket_url`, `source_*`, `scraped_at`, `curated_at`). One `event_occurrence` from `start_date`/`end_date` + `start_time`/`end_time`: parse the text time into `local_start`/`local_end`, set `timezone` from the venue/city IANA zone, and compute `start_at`/`end_at` in the same normalize helper the scraper will use. Rows with only a date → `is_all_day = true`.
6. **Assign `attendance_mode`** = `in_person` for all backfilled rows (no online events in the current data); refine later.
7. **Point the scraper's upsert at the new model** — dedupe on `dedupe_hash`, keep the curation-column guard ([#0002](decisions.md#0002--curate-events-with-status--override-columns), [scripts/lib/upsert.ts](../../scripts/lib/upsert.ts)).
8. **Repoint the read path** ([src/lib/events.ts](../../src/lib/events.ts)'s `getAllEvents → toArtEvent` chokepoint) at the new tables; verify SEO routes + sitemap in a preview deploy.
9. **Cutover + drop** the old `events` table only after the new path is verified in production — a separate signed-off step (no destructive Neon ops without sign-off).

Backfill runs as a one-off `tsx` script (like `scripts/seed.ts`), not a SQL migration file — consistent with the `db:push` decision ([#0005](decisions.md#0005--schema-changes-via-dbpush-no-migration-files)).

## Open items before implementation

1. ~~Confirm instant computation is app-side, not a DB generated column.~~ **Decided** — app-side, in the scraper normalize helper.
2. ~~Migration path from the flat `events` table.~~ **Drafted above.**
3. Whether to keep a denormalized `event.city_id` cache (defer until profiled).
4. Organiser data is thin in the current source set — the first backfill derives organisers from `source_name`; richer organiser extraction is a scraper improvement, tracked separately.
