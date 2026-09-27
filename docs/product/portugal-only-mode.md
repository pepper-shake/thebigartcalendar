# Portugal-only mode (feature flag)

**Flag:** `PORTUGAL_ONLY_MODE` in [src/config/feature-flags.ts](../../src/config/feature-flags.ts) — currently `true`.

Temporarily limits the whole public site to Portugal while the international catalogue is thin. To show everything again, set it to `false` and redeploy.

## What it does
When `true`, events and places whose `country` isn't in `VISIBLE_COUNTRIES` (`['Portugal']`, case-insensitive) are filtered out in the two data-layer reads, `getAllEvents()` and `getAllPlaces()` in [src/db/queries.ts](../../src/db/queries.ts). Everything downstream derives from those, so with no per-component checks:
- calendar + its city filter (options are built from the visible events), year/month navigation
- `/cities` and `/cities/[city]` — non-Portugal cities 404
- type hubs (`/workshops`, …), event pages (non-Portugal events 404)
- `/places` (cards and city/category chips) and `/places/[slug]` (non-Portugal places 404)
- `sitemap.xml`

- **Wording:** titles, meta descriptions and copy say "Portugal" / "Portuguese" instead of "Europe" / "European", via `REGION`, `REGION_ADJECTIVE` and `SITE_TAGLINE` in [src/lib/site.ts](../../src/lib/site.ts). Use those helpers — never hardcode "Europe" — so new pages follow the flag too.

## What it doesn't do
- **No data changes.** The scraper keeps collecting every source, and rows stay in the DB untouched; the flag only filters reads.
- Empty type hubs (e.g. `/exhibitions`) are not caused by the flag: with it off they're equally empty, because there are no upcoming international events of those types.
