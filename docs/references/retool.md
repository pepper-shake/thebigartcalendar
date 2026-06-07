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

## Image-upload query
- `POST https://thebigartcalendar.vercel.app/api/admin/upload`
- Headers: `Authorization: Bearer {{ retoolSecret }}`, `Content-Type: application/json`.
- Body:
  ```json
  { "data": {{ fileInput.value[0] }}, "contentType": {{ fileInput.files[0].type }}, "filename": {{ fileInput.files[0].name }}, "folder": "events" }
  ```
- On success: write `image_url_override = {{ uploadQuery.data.url }}` for the selected row.

See [vercel-blob.md](vercel-blob.md) for the route contract and limits, and [../product/event-curation.md](../product/event-curation.md) for the curation model.
