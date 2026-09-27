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
1. **Scrape** ([scripts/](../scripts/)): `run-all.ts` drives per-site parsers in `parsers/`; `lib/extract.ts` uses Claude (Haiku) to turn page text into structured events; `lib/upsert.ts` writes them with `INSERT ... ON CONFLICT (id) DO UPDATE`. Dedup id = `hash(sourceUrl + title + startDate)`. For follow-detail-link parsers (nacre-creative, pink-dolphin, dvi-taures), the parser passes the real fetched page URLs + their `og:image` as `pages` to `extractEventsFromHtml`, which **snaps the LLM's transcribed `sourceUrl`/`imageUrl` back to ground truth** — LLMs drop emoji and mangle URLs, which otherwise yields 404 source links and broken images. Some parsers skip the LLM entirely and build events from structured data: `disco-wheel` decodes Shopify variant SKUs; `ajuda-lab` reads the option list of the Google Form on its registration page (the form's `FB_PUBLIC_LOAD_DATA_` JSON — the only place Ajuda Lab publishes session dates) and regex-parses "Title DD Month HHh PRICE€ - Teacher". `galeria-1758` reads the WooCommerce Store API (each workshop session is a product named by its date, e.g. "25 MARÇO 26") and fetches the product page only for the session time. `fable-lisbon` reads Fable's Linktree for Eventbrite links, then each Eventbrite page's schema.org Event JSON-LD (a reusable pattern for any Eventbrite-listed organiser). `oficina-mescla`'s calendar has dates only inside poster images (filenames like `NOV_lito.png` give the month): Claude reads unknown posters by vision, already-read ones are cached in the parser's `KNOWN` map, and price/schedule/description come from a fixed catalogue. `dobarro` parses only the first (current-month) block of DoBarro's `/agenda` table — PT title / EN title / price / day-of-month lists + times — since older months' tables stay on the page with unreliable labels. These bypass `extract.ts`'s past-event guard, so they filter `startDate >= today` themselves.
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
- **Place** `/places/[slug]` (+ `/places` index, filterable by city/category) — a hand-curated directory; events link to places at read time by name/alias match ([product/places.md](product/places.md), [decision #0008](design/decisions.md)). Emits `ArtGallery`/`Museum`/`LocalBusiness`/`Organization` JSON-LD.
- **No empty options (always on, independent of any flag):** the calendar only offers years, months, dates, types and cities that have events — past events count — and each reacts to the other filters ([src/lib/calendarFacets.ts](../src/lib/calendarFacets.ts)); if the requested month is empty it opens the next month with events. Event types with no upcoming events are dropped from the header menu, footer and sitemap, and their hub page 404s (`listActiveTypes()` in [src/lib/events.ts](../src/lib/events.ts)); they reappear automatically.
- **Geographic feature flag:** `PORTUGAL_ONLY_MODE` ([src/config/feature-flags.ts](../src/config/feature-flags.ts)) filters events + places by country inside `getAllEvents`/`getAllPlaces`, so every route sees the same restricted dataset. See [product/portugal-only-mode.md](product/portugal-only-mode.md).
- **Selectors** ([src/lib/events.ts](../src/lib/events.ts)) wrap the `getAllEvents → toArtEvent` chokepoint, so SEO pages honor curation. Hubs/sitemap list only ongoing/upcoming events; event pages resolve past events too. All SEO routes are `force-dynamic` (reflect the daily scrape without a redeploy).
- **Canonical host:** [next.config.ts](../next.config.ts) 308-redirects `thebigartcalendar.vercel.app` and `www.` to `https://thebigartcalendar.com` (exact host match — preview deployments are unaffected).
- **Event JSON-LD times carry the venue's UTC offset** (`2026-09-27T10:00:00+01:00`, DST-correct via `isoWithOffset` in [src/lib/timezone.ts](../src/lib/timezone.ts)); date-only events stay plain dates.
- **`/llms.txt`** ([src/app/llms.txt/route.ts](../src/app/llms.txt/route.ts)) — a Markdown map of the site for AI assistants, built from the same flag-aware selectors (recurring sessions collapsed).
- **IndexNow** ([scripts/lib/indexnow.ts](../scripts/lib/indexnow.ts)): after each scrape, `run-all.ts` pings Bing/ChatGPT search with new upcoming event pages + their hubs; `places:sync` pings the place pages. Only when writing to the production DB. Key file: `public/<key>.txt` (public by design).
- Public origin via `NEXT_PUBLIC_SITE_URL` (fallback `https://thebigartcalendar.com`). Custom-domain setup: [references/domain-setup.md](references/domain-setup.md).

## Not built yet
Blog content (planned: a Postgres `posts` table + SSR pages — [decision #0004](design/decisions.md)). Tracked in [exec-plans/active/admin-and-content-platform.md](exec-plans/active/admin-and-content-platform.md).
