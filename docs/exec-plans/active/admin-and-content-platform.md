# Admin & content platform — active plan

**Goal:** give the operator a simple way to (1) fix auto-parsed events and (2) publish SEO-optimized blog posts, with proper image hosting.

## Status
- [x] **Event curation schema** — `status` + `image_url_override` / `title_override` / `description_override` + `curated_at` on `events`; merged at read time; scraper-protected. Applied to Neon via `db:push` on 2026-06-07.
- [x] **Image hosting** — public Vercel Blob store `thebigartcalendar-images`; `POST /api/admin/upload` (auth-gated); `@vercel/blob` installed; env wired (prod + dev). Verified end-to-end (upload → public 200; 401/415 guards).
- [x] **Deploy** — curation code + upload route live in production at `https://thebigartcalendar.vercel.app` (2026-06-07; merged to `main`, smoke-tested live).
- [ ] **Retool app** — events table + edit form writing override/status columns; image upload wired to the route; "revert to scraped" = null the override.
- [ ] **Blog** — `posts` table + SSR blog pages + SEO scaffolding (`generateMetadata`, JSON-LD Article, `sitemap.xml`, `robots.txt`, OG images).
- [ ] **(Deferred)** Claude skill for AI-assisted post drafting.

## Decision log
- 2026-06-07 — Chose Retool over Strapi (#0001), override columns over a lock flag (#0002), Vercel Blob (#0003), blog-as-Postgres-table (#0004), `db:push` (#0005). AI drafting skill deferred.
- 2026-06-07 — Image flow is **lazy**: scraped hotlinks display by default; an uploaded Blob URL in `image_url_override` wins. Bulk re-hosting deferred (see [tech-debt](../tech-debt.md)).
- 2026-06-07 — `status` defaults to `published` (events go live immediately; editor is "fix & hide", not "approve everything").
- 2026-06-07 — Shipped: two commits merged to `main` and deployed to production via `vercel deploy --prod`; upload route smoke-tested live.

## Open questions
- ~~Production domain for the Retool query base URL~~ — resolved: `https://thebigartcalendar.vercel.app`.
- Whether to adopt versioned migrations later (needs a baseline first).
