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
- **Image fallback ladder** — an event's picture resolves in [src/lib/organiser-images.ts](../../src/lib/organiser-images.ts) as: `image_url_override` → scraped `image_url` → **organiser default** → **site placeholder**, so no event ever renders imageless. Organiser defaults are committed files under `public/venues/<slug>.jpg`, mapped by `source_name` in that file (add a line when onboarding a source). Final catch-all: `public/default-event.svg`.
- [src/db/queries.ts](../../src/db/queries.ts) `getAllEvents()` filters `status = 'published'`.
- **Revert an edit** by setting its override back to `NULL` (falls back to the latest scraped value).
- Edits appear on the next render of the calendar page (it reads the DB at request time). If ISR/caching is added later, revalidate after edits — see [references/next-16.md](../references/next-16.md).

## Why edits survive re-scrapes
The scraper's `onConflictDoUpdate` set block in [scripts/lib/upsert.ts](../../scripts/lib/upsert.ts) lists **only base columns**. Columns it doesn't list are untouched on conflict, so curation columns persist automatically.
**⚠️ Never add `status`, `*_override`, or `curated_at` to that set block** (there's a guard comment there).

## Workflow
Events publish immediately (`status` defaults to `published`). The operator uses the editor to fix images/titles/descriptions and set `status='hidden'` for junk — "fix & hide", not "approve everything". To switch to opt-in moderation later, default `status` to `pending` (the read query already filters to `published`).

Editing happens in Retool: [references/retool.md](../references/retool.md). Image uploads: [references/vercel-blob.md](../references/vercel-blob.md). Rationale: [decision #0002](../design/decisions.md).
