# Decisions

Accepted decisions and their rationale (ADR log). Newest first. When a decision is reversed, set its **Status** to `Superseded by #NNNN` rather than deleting it.

| # | Decision | Status | Date |
|---|---|---|---|
| 0007 | Normalized event data model: occurrences + wall-time/zone, Type≠Tags, materialize recurrence | Proposed | 2026-08-18 |
| 0006 | SEO routing: per-event/city/type pages + sitemap/robots/JSON-LD, slugs derived in code | Accepted | 2026-06-10 |
| 0005 | Apply schema changes with `db:push` (no migration files) | Accepted | 2026-06-07 |
| 0004 | Blog content lives in a Postgres `posts` table (not a CMS) | Accepted | 2026-06-07 |
| 0003 | Host images on Vercel Blob via an auth-gated upload route | Accepted | 2026-06-07 |
| 0002 | Curate events with `status` + override columns (not a lock flag) | Accepted | 2026-06-07 |
| 0001 | Edit scraped events with Retool (not Strapi) | Accepted | 2026-06-07 |

---

## 0007 — Normalized event data model (occurrences + wall-time/zone)
**Status:** Proposed (design captured, not yet implemented).
**Context:** The live schema is a single flat scraper-owned `events` table with text-ish columns and `start_date`/`end_date`. It can't cleanly express one event across multiple dates/venues/organisers, separate Type from Tags, or survive DST correctly for a Europe-wide calendar.
**Decision:** Adopt a normalized model — `event` + `event_occurrence` (dates/times), taxonomy tables for `event_type` and `tag` (kept separate: Type = "what kind", Tags = "topics/characteristics"), and `city`/`venue`/`organiser` entities with N:M joins. Occurrences store `local_start`/`local_end` (wall-clock) + IANA `timezone` as the source of truth, with `start_at`/`end_at` (UTC `timestamptz`, indexed) **computed in the scraper's normalize step** for querying. Recurrence is **materialized** into occurrence rows at scrape time (bounded horizon); `event.rrule` is provenance only, never queried at request time. Add `attendance_mode` (`in_person|online|hybrid`), which drives "Event time" vs "My time" display.
**Why:** Occurrences make multi-date/multi-venue events and per-instance cancellation trivial while keeping calendar/SEO queries plain SQL. Wall-time + IANA zone keeps "18:00 in Berlin" stable across CET↔CEST; computing the instant app-side (not a DB generated column) sidesteps generated-column/`db:push` (drizzle-kit) risk — see [#0005](#0005--schema-changes-via-dbpush-no-migration-files). Type-vs-Tags separation powers type hubs + faceted filtering independently.
**Consequences:** Requires a migration from the flat table (backfill occurrences, seed taxonomies, assign `attendance_mode`) — respect the curation-column guard ([#0002](#0002--curate-events-with-status--override-columns)). Full model, rationale, dedup/normalization rules, and open items: [event-data-model.md](event-data-model.md).

## 0001 — Edit scraped events with Retool
**Context:** Need a comfortable, low-effort UI to fix auto-parsed events. The `events` table is owned by our scraper + Drizzle schema.
**Decision:** Use Retool (free plan) as a CRUD UI over the existing Neon DB.
**Why:** Retool layers onto an existing DB without owning the schema — a clean fit for scraper-owned data. Strapi (the alternative) wants to own/migrate its own schema, and its free Cloud tier is non-commercial + far too small. Retool also handles admin login for free.
**Consequences:** The admin UI lives in Retool, not the repo, and Retool holds the DB connection string — acceptable for a solo internal tool. Wiring: [references/retool.md](../references/retool.md).

## 0002 — Curate events with status + override columns
**Context:** The daily re-scrape overwrites every base column, so naive manual edits get clobbered the next morning.
**Decision:** Keep scraped values pristine; add `status` (`published`/`hidden`/`pending`, default `published`) and nullable `*_override` columns merged at read time. The scraper's upsert lists only base columns, so curation columns are never touched.
**Why:** Override columns preserve both the scraped value and the human edit, let the scraper keep refreshing the base value, and allow one-click revert (null the override). A coarse "locked" flag would freeze the whole row and discard the scraped value.
**Consequences:** Read path must merge overrides + filter status (it does). Never add curation columns to the upsert set block. Full model: [product/event-curation.md](../product/event-curation.md).

## 0003 — Host images on Vercel Blob via an auth-gated route
**Context:** Event images are hotlinked source URLs (rot, referer-blocking). Blog images will need hosting too.
**Decision:** Vercel Blob (public store). Uploads go through `POST /api/admin/upload`, gated by `ADMIN_UPLOAD_TOKEN`; the returned URL is stored in `image_url_override`.
**Why:** In-family with Vercel, stable public URLs, works with `next/image`. Keeping the rw-token server-side (not in Retool) is safer than direct client uploads. Neither Retool nor Strapi hosts images, so Blob would be needed regardless.
**Consequences:** Lazy hosting — scraped hotlinks show until an override is uploaded (bulk re-hosting deferred, see tech-debt). ~3 MB practical upload cap. Details: [references/vercel-blob.md](../references/vercel-blob.md).

## 0004 — Blog content in a Postgres `posts` table
**Context:** Need SEO-optimized, server-rendered blog posts with a simple authoring path.
**Decision:** Store posts in a Neon `posts` table in our own Drizzle schema, rendered by Next SSR. Not a headless CMS, not MDX-in-git.
**Why:** Unifies with the events admin (one Retool surface), instant publish, content stays in our DB. SEO via SSR + JSON-LD is unaffected. (AI-assisted drafting via a Claude skill is deferred — "maybe later".)
**Consequences:** We build the editor + post pages + SEO scaffolding. Not yet implemented — see [exec-plans/active/admin-and-content-platform.md](../exec-plans/active/admin-and-content-platform.md).

## 0005 — Schema changes via `db:push` (no migration files)
**Context:** The repo has no migration files, but the `events` table is already live in Neon — the project was bootstrapped with `db:push`.
**Decision:** Continue applying schema changes with `npm run db:push`. (`drizzle.config.ts` loads `.env.local`, so `DATABASE_URL` is available.)
**Why:** `db:generate` + `db:migrate` with no baseline emits a full `CREATE TABLE` and fails against the existing live table. `db:push` diffs the schema against the live DB and applies only the delta.
**Consequences:** No versioned/committed migration SQL. To switch to migrations later, baseline the existing schema first (see tech-debt). README's "migration workflow" section is aspirational, not current.

## 0006 — SEO routing: per-event/city/type pages with derived slugs
**Context:** The whole calendar lived under one client-rendered route (`/`), so individual events, cities, and event types had no indexable URLs — the core SEO asset for an events portal was missing.
**Decision:** Add server-rendered routes — `/events/[slug]`, `/cities/[city]` (+ `/cities` index), and five type hubs (`/exhibitions`, `/art-fairs`, `/workshops`, `/performances`, `/auctions`) — plus `metadataBase`, per-page `generateMetadata` (canonical + OpenGraph), schema.org JSON-LD (`Event`/`ItemList`/`BreadcrumbList`/`WebSite`/`Organization`), `sitemap.ts`, and `robots.ts`. Event slugs are **derived in code** (`title-city-<id8>`), not stored.
**Why:** Per-event pages with structured data are what earn event rich results and rank location/type queries. Deriving slugs from the stable dedup-hash `id` avoids a schema change (and the scraper/curation landmines) while staying unique and stable. All selectors ([src/lib/events.ts](../../src/lib/events.ts)) reuse the `getAllEvents → toArtEvent` chokepoint, so curation (status + overrides) is honored — no second read path.
**Consequences:** SEO routes are `force-dynamic` (read the DB per request → reflect the daily scrape + curation edits without a redeploy). Hubs and the sitemap list only ongoing/upcoming events (fresh, no thin/stale pages); event pages still resolve past events if linked. Slugs change only if the `id` changes (i.e. a different event). Public origin via `NEXT_PUBLIC_SITE_URL` (fallback `https://thebigartcalendar.com`) — custom-domain steps in [references/domain-setup.md](../references/domain-setup.md). Map: [ARCHITECTURE.md](../ARCHITECTURE.md) §SEO & routing.
