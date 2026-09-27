# DB schema (snapshot)

> **Maintained from [src/db/schema.ts](../../src/db/schema.ts)** — the code is authoritative. Refresh this file when the schema changes; `npm run db:push` applies the schema to Neon, `npm run db:studio` browses it. Don't rely on this over the code.

## `events`
| Column | Type | Notes |
|---|---|---|
| `id` | text PK | `hash(sourceUrl + title + startDate)` |
| `title` | text NOT NULL | |
| `type` | text NOT NULL | gallery · fair · workshop · performance · auction |
| `start_date` | date NOT NULL | |
| `end_date` | date | |
| `start_time` / `end_time` | text | "HH:MM" |
| `venue` / `city` / `country` / `address` | text | |
| `description` | text | |
| `image_url` | text | scraped (often a hotlink) |
| `tickets_url` | text | |
| `price` | text | e.g. "€40", "Free" |
| `tags` | text[] | |
| `source_url` | text NOT NULL | |
| `source_name` | text NOT NULL | |
| `external_id` | text | |
| `scraped_at` | timestamptz NOT NULL, default `now()` | |
| **`status`** | text NOT NULL, default `'published'` | published · hidden · pending — see [curation](../product/event-curation.md) |
| **`image_url_override`** | text | wins over `image_url` at read time |
| **`title_override`** | text | display-only |
| **`description_override`** | text | |
| **`curated_at`** | timestamptz | last manual edit |

## `places`
Hand-curated directory — see [product/places.md](../product/places.md). Events link at read time (no FK).

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | = slug at creation, never changes |
| `slug` | text NOT NULL UNIQUE | `/places/<slug>` |
| `name` | text NOT NULL | |
| `aliases` | text[] | other names events use (matched after slug-normalization) |
| `kind` | text NOT NULL | venue · organiser · both |
| `category` | text | gallery · museum · studio · workshop-space · shop · artist-run · collective · other |
| `description` / `image_url` / `address` / `city` / `country` | text | |
| `lat` / `lng` | double precision | |
| `website_url` / `instagram_url` | text | |
| `opening_hours` | jsonb | `{ mon..sun: "HH:MM-HH:MM", note? }`; missing day = closed; null = unknown |
| `status` | text NOT NULL, default `'published'` | published · hidden |
| `created_at` / `updated_at` | timestamptz NOT NULL, default `now()` | |

**Blog `posts` table:** not yet created — planned in [exec-plans/active/admin-and-content-platform.md](../exec-plans/active/admin-and-content-platform.md).
