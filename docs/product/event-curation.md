# Event curation

How a human corrects and moderates scraped events without fighting the daily scraper.

## Model
Scraped values stay pristine in their base columns. Human edits go in parallel **override** columns; a **status** column controls visibility.

| Column | Purpose |
|---|---|
| `status` | `published` (default) · `hidden` · `pending`. The public site shows only `published`. |
| `image_url_override` | Hosted image URL (Vercel Blob) that wins over the scraped `image_url`. |
| `title_override` | Cleaned-up title. **Display-only** — the dedup id still hashes the original scraped title, so this is safe. |
| `description_override` | Cleaned-up description. |
| `curated_at` | Timestamp of the last manual edit. |

## How it takes effect
- [src/lib/transform.ts](../../src/lib/transform.ts) `toArtEvent()` merges `override ?? base` for title, description, and image.
- **Image fallback ladder** — an event's picture resolves in [src/lib/organiser-images.ts](../../src/lib/organiser-images.ts) as: `image_url_override` → scraped `image_url` → **organiser default** → **site placeholder**, so no event ever renders imageless. The organiser default lives in the `organiser_defaults` table (keyed by `source_name`), uploaded self-service via the admin UI (Retool → Vercel Blob) and joined in at read time by `getAllEvents()`. Final catch-all: `public/default-event.svg`.
- [src/db/queries.ts](../../src/db/queries.ts) `getAllEvents()` filters `status = 'published'`.
- **Revert an edit** by setting its override back to `NULL` (falls back to the latest scraped value).
- Edits appear on the next render of the calendar page (it reads the DB at request time). If ISR/caching is added later, revalidate after edits — see [references/next-16.md](../references/next-16.md).

## Why edits survive re-scrapes
The scraper's `onConflictDoUpdate` set block in [scripts/lib/upsert.ts](../../scripts/lib/upsert.ts) lists **only base columns**. Columns it doesn't list are untouched on conflict, so curation columns persist automatically.
**⚠️ Never add `status`, `*_override`, or `curated_at` to that set block** (there's a guard comment there).

## Workflow
Events publish immediately (`status` defaults to `published`). The operator uses the editor to fix images/titles/descriptions and set `status='hidden'` for junk — "fix & hide", not "approve everything". To switch to opt-in moderation later, default `status` to `pending` (the read query already filters to `published`).

Editing happens in Retool: [references/retool.md](../references/retool.md). Image uploads: [references/vercel-blob.md](../references/vercel-blob.md). Rationale: [decision #0002](../design/decisions.md).

## Manual events
For places with **no scrapable source** (Instagram-only venues, e.g. Svet Space), events are hand-entered as reviewable data in [scripts/manual/events.ts](../../scripts/manual/events.ts), then `npm run events:manual` upserts them.
- Each entry gives title, type and date (+ optional times, price, description); venue, address, image and booking link fall back to the venue's defaults in `MANUAL_VENUES` there.
- Same write path as the scraper (`upsertEvents`), so curation columns survive re-syncs. The id is `hash("manual:<venue>" + title + date[+time])`, so fixing a typo in a title creates a new row: hide the old one via curation.
- Removing an entry does **not** delete the row; past entries can stay in the file.
- Only add what the source says: poster/post details, no invented descriptions. Skip non-art items (language clubs) and studio-time offers (coworking), as with scraped sources.

## Known duplicate source: Disco Wheel
Disco Wheel sometimes republishes a workshop slot as a new Shopify product. The parser's id hashes the product URL, so the slot gets a second row and the old one stays. `npx tsx scripts/dev/hide-disco-wheel-dupes.ts` lists the older copies (dry run; add `--prod` for production and `--apply` to hide them). It only sets `status='hidden'`, which can be reversed. The root fix is a slot-based id in [scripts/parsers/disco-wheel.ts](../../scripts/parsers/disco-wheel.ts), still to do.
