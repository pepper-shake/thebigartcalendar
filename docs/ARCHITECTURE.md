# Architecture

A map of the system. Deeper detail lives in the linked docs.

## Stack
- Next.js 16.2.6 (App Router) + React 19.2.4, Tailwind v4, shadcn/Base UI, lucide-react
- Neon (serverless Postgres) via Drizzle ORM
- Vercel — hosting + Blob image storage
- Anthropic SDK — event extraction inside the scraper

## Data flow
```
art websites → scraper (GitHub Actions, daily) → Neon `events` table
                                                       │
                                          Next.js server components (SSR)
                                                       │
                                            calendar UI (indexable)
```
1. **Scrape** ([scripts/](../scripts/)): `run-all.ts` drives per-site parsers in `parsers/`; `lib/extract.ts` uses Claude (Haiku) to turn page text into structured events; `lib/upsert.ts` writes them with `INSERT ... ON CONFLICT (id) DO UPDATE`. Dedup id = `hash(sourceUrl + title + startDate)`.
2. **Store**: Neon Postgres; schema in [src/db/schema.ts](../src/db/schema.ts). Snapshot: [generated/db-schema.md](generated/db-schema.md).
3. **Read path** (one chokepoint — reuse it):
   [src/db/queries.ts](../src/db/queries.ts) `getAllEvents()` (filters `status='published'`)
   → [src/lib/transform.ts](../src/lib/transform.ts) `toArtEvent()` (merges human overrides over scraped values)
   → calendar components.
   **Any new event query must reuse this path**, or it bypasses curation (hidden events leak, overrides ignored).

## Folder map
- `src/app/` — routes: `/` (calendar), `/events/[slug]`, `/cities` + `/cities/[city]`, type hubs (`/exhibitions`, `/art-fairs`, `/workshops`, `/performances`, `/auctions`), `/about`, `/blog`, `/contact`, `sitemap.ts`, `robots.ts`, and `api/admin/upload` (image upload route)
- `src/components/` — `calendar/`, `events/`, `filters/`, `layout/`, `mobile/`, `ui/`
- `src/db/` — `schema.ts`, `queries.ts`, `index.ts` (Neon connection)
- `src/lib/` — `transform.ts`, calendar logic, `cn`
- `src/types/` — shared TS types
- `scripts/` — scraper (cron) + DB utilities (`seed.ts`, `check-db.ts`)
- `docs/` — this knowledge base

## Editing pipeline (curation)
Scraped events are treated as read-only data. Humans fix images/titles/descriptions and hide junk via **override columns + a `status` flag**, edited through **Retool** over Neon; replacement images are hosted on **Vercel Blob** via an auth-gated upload route. See [product/event-curation.md](product/event-curation.md), [references/vercel-blob.md](references/vercel-blob.md), [references/retool.md](references/retool.md).

## SEO & routing
The calendar (`/`) is the hub; every event, city, and type also gets its own server-rendered, indexable page ([decision #0006](design/decisions.md)):
- **Event** `/events/[slug]` — slug derived in [src/lib/slug.ts](../src/lib/slug.ts) as `title-city-<id8>` (no DB column; stable because the `id` is the dedup hash). Emits `Event` JSON-LD.
- **City** `/cities/[city]` (+ `/cities` index) and **type hubs** `/exhibitions` · `/art-fairs` · `/workshops` · `/performances` · `/auctions` — [src/lib/eventTypes.ts](../src/lib/eventTypes.ts) maps the raw `type` to public slugs/labels. Emit `ItemList` JSON-LD + crawlable links to events.
- **Foundations:** `metadataBase` + per-page `generateMetadata` (canonical + OpenGraph), `BreadcrumbList`/`WebSite`/`Organization` JSON-LD, [sitemap.ts](../src/app/sitemap.ts) + [robots.ts](../src/app/robots.ts). Helpers in [src/lib/site.ts](../src/lib/site.ts) + [src/lib/jsonld.ts](../src/lib/jsonld.ts) and [src/components/seo/](../src/components/seo/); internal links via the footer + header menu.
- **Selectors** ([src/lib/events.ts](../src/lib/events.ts)) wrap the `getAllEvents → toArtEvent` chokepoint, so SEO pages honor curation. Hubs/sitemap list only ongoing/upcoming events; event pages resolve past events too. All SEO routes are `force-dynamic` (reflect the daily scrape without a redeploy).
- Public origin via `NEXT_PUBLIC_SITE_URL` (fallback `https://thebigartcalendar.com`). Custom-domain setup: [references/domain-setup.md](references/domain-setup.md).

## Not built yet
Blog content (planned: a Postgres `posts` table + SSR pages — [decision #0004](design/decisions.md)). Tracked in [exec-plans/active/admin-and-content-platform.md](exec-plans/active/admin-and-content-platform.md).
