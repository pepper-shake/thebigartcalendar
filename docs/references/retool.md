# Retool — event editor

Retool (free plan) provides the CRUD UI over the Neon `events` table. The app lives in Retool, not this repo ([decision #0001](../design/decisions.md)). Not built yet — this is the build spec.

## Connect
- Add a **PostgreSQL** resource pointing at the Neon `DATABASE_URL`.
- Store `ADMIN_UPLOAD_TOKEN` as a **Retool secret** (for the image-upload query).

## Events table + edit form
- Table query: `SELECT * FROM events ORDER BY scraped_at DESC` (filter to "needs attention" as desired, e.g. missing image or `status='pending'`).
- The edit form writes **only** override/status columns — never the base scraped columns:
  ```sql
  UPDATE events
  SET title_override = {{ form.title }},
      description_override = {{ form.description }},
      image_url_override = {{ form.imageUrl }},
      status = {{ form.status }},
      curated_at = now()
  WHERE id = {{ table.selectedRow.id }}
  ```
- **Revert to scraped:** set the relevant override to `NULL`. Show the scraped base value next to each override field so the editor can compare.

## Organiser + venue links

The event page shows **Organiser** and **Venue** as clickable pills (each opens its website in a new tab). Fill these in from Retool:

| Field | Column | Notes |
|---|---|---|
| Organiser name | `organiser_name` | shown as the "Organiser" pill label |
| Organiser website | `organiser_url` | makes the organiser pill a link |
| Venue website | `venue_url` | makes the venue pill a link |

These three columns are **written directly** (they are *not* `*_override` columns) — and that is safe because the scraper's upsert doesn't list them, so a daily re-scrape never clobbers your edits ([scripts/lib/upsert.ts](../../scripts/lib/upsert.ts) `set` block).

```sql
UPDATE events
SET organiser_name = {{ form.organiserName }},
    organiser_url  = {{ form.organiserUrl }},
    venue_url      = {{ form.venueUrl }},
    curated_at     = now()
WHERE id = {{ table.selectedRow.id }}
```

- Leave a field **empty (`NULL`)** to hide that pill / drop the link. A pill with a name but no URL still shows as plain (non-clickable) text.
- **`venue` (the name) is different** — it's a scraped base column that the scraper *refreshes daily*, so don't hand-edit it here (your change would be overwritten next morning). There is no `venue_override` column; if a venue name is wrong at the source, fix it via the parser, not Retool. You only add the venue's **link** (`venue_url`) here.
- Enter full URLs including `https://` so the pill links resolve correctly.

## Image-upload query
- `POST https://thebigartcalendar.vercel.app/api/admin/upload`
- Headers: `Authorization: Bearer {{ retoolSecret }}`, `Content-Type: application/json`.
- Body:
  ```json
  { "data": {{ fileInput.value[0] }}, "contentType": {{ fileInput.files[0].type }}, "filename": {{ fileInput.files[0].name }}, "folder": "events" }
  ```
- On success: write `image_url_override = {{ uploadQuery.data.url }}` for the selected row.

See [vercel-blob.md](vercel-blob.md) for the route contract and limits, and [../product/event-curation.md](../product/event-curation.md) for the curation model.
