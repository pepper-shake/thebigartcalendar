# ig-radar — Instagram event intelligence pipeline (active plan)

**Goal:** automatically discover creative events announced by Instagram organizers, extract clean structured facts, deduplicate them, and feed them into the existing `events` table — so they surface on The Big Art Calendar with minimal manual work.

**What this is not:** a "scraper." Scraping is only step one. The system watches accounts → filters → extracts facts → dedups → publishes. Hence *radar*, not scraper.

## Guiding constraints (legal posture — do not drift from these)
- **Facts only, never republish.** Store event *facts* (title, date, venue, price, city, link). Do **not** publish organizers' captions or images. Descriptions are **paraphrased** by the LLM, never copied. This keeps us clear of copyright — the main real legal risk. See [SECURITY.md](../../SECURITY.md).
- **Our own images.** Event images are supplied by us (curated / category placeholders), not taken from Instagram.
- **Captions are working data.** Raw captions are stored only long enough to (re)extract facts, then **purged**. Never surfaced publicly.
- **Apify moves engineering risk, not legal risk.** Using Apify avoids IP bans / proxy upkeep but does **not** remove the Instagram ToS violation. The facts-only posture is what keeps us safe; Apify is just the fetch tool. ToS breach = "Instagram can block/ban us," not a crime.
- **GDPR:** organizer handles/names are personal data. Defensible basis = listing public events; provide an opt-out contact.

## Architecture — a staged pipeline
Durable persistence at each boundary. Never re-scrape to re-process: raw → candidate → canonical are **separate tables** so prompt changes can re-run over stored posts.

```
[Watch]  Apify → ig_posts (caption = working data, purged later)
   ↓
[Filter] cheap LLM gate: "future attendable event? y/n"
   ↓
[Extract] multimodal LLM → facts + PARAPHRASED description → event_candidates
   ↓
[Dedup]  content hash + organizer/date blocking + (later) embeddings → merge
   ↓
[Publish] promote to existing `events` (curation guard respected) + attach our image
   ↓         ↘ low-confidence / incomplete → review queue (Retool)
```

## Schema (new, feeds the existing `events` table)
Proposed in `src/db/schema-instagram.ts` (separate from published `events`). Applied via `db:push` per [decision #0005](../../design/decisions.md) — **not yet pushed; needs sign-off.**
- `ig_accounts` — monitored handles, per-account cursor, health, `default_city`, `source_type` (scraped | opt_in).
- `ig_posts` — raw posts; `caption` is working data (nulled by purge job, `purged_at`); `content_hash` for exact dedup; `is_event` gate result.
- `event_candidates` — one row per (post, extraction run); all facts nullable; per-field + overall confidence; `prompt_version`, `model`; status pending | needs_review | merged | rejected; `canonical_event_id` on merge.
- `event_sources` — provenance join: many posts → one canonical event.
- Reuse `events.type` vocabulary (`gallery|fair|workshop|performance|auction`); extend there if art workshops need more, rather than a parallel taxonomy.
- **Deferred:** `organizers`/`venues` as first-class entities, and a `pgvector` embedding column — add only when volume/near-dupes justify it.

## Extraction contract (the quality lives here)
- **Two calls:** (1) cheap text-only gate rejects the ~70–80% non-events and **past/recap** posts (pass `published_at` so it reasons about tense); (2) multimodal structured extraction for passers.
- **Null over guess** — every field nullable; a hallucinated date is worse than a missing one.
- **Relative dates resolve against the post's `published_at`** → ISO 8601.
- **`description` is paraphrased** (neutral, ≤~300 chars, no copied phrases) — the copyright firewall.
- **`price`/`technique` stay strings** ("€25 / concession", "materials included").
- **Confidence gates routing:** missing a critical field (date/city) or low overall confidence → `needs_review`, not auto-published (mirrors existing curation model).
- **City fallback:** extractor returns null when unstated; deterministic fallback uses `ig_accounts.default_city` (keep the guess out of the LLM).
- **Multi-event posts:** extraction returns an **array** — one carousel can announce a whole season.

## Tags — controlled vocabulary, three axes
Free-form tags fragment (watercolour/watercolor/aquarelle). Fixed lists, model maps to nearest term; unmapped → `uncategorized` bucket reviewed weekly to grow the vocab.
- **technique** (semi-open, normalized): watercolor, oil, ceramics, bookbinding, printmaking, life-drawing…
- **atmosphere** (closed): beginner-friendly, wine, relaxed, date-night, community, kids…
- **event-type** (closed): workshop, exhibition, open-studio, talk, market, course, meetup…

## Promotion into `events`
A dedicated `upsertInstagramEvents()` **mirrors [scripts/lib/upsert.ts](../../../scripts/lib/upsert.ts) exactly** — same guarded `set`, curation columns (`status`, `*_override`, `curated_at`) omitted — so IG events respect manual edits like the daily scraper. `sourceName = 'instagram'` (or handle); id via existing `makeId(sourceUrl, title, startDate)`.

## Build order — one phase fully working before the next
- [x] **Phase 1 — Watch.** Shipped + verified live 2026-07-09. Built: `src/db/schema-instagram.ts` (`ig_accounts`, `ig_posts`); `drizzle.config.ts` widened to an array so `db:push` sees both files; Apify client (`scripts/ig-radar/apify.ts`, `fetch`-based, no new dep); store/cursor/health helpers (`store.ts`, lazy DB connect to dodge ESM import-hoisting vs. `loadEnvFile`); runner (`run.ts`, `npm run radar`); account seed (`seed-accounts.ts`, `npm run radar:seed`). `db:push` applied to Neon; first run pulled 12 posts from `arthome.lisbon`. **Still pending:** GitHub Actions cron every 6–12h (not yet wired). *Done: fresh posts land automatically.*
  - **Finding (real data):** captured posts are mostly **Ukrainian** (Ukrainian-community studio in Lisbon), some PT/EN. The 12 posts mix real events (Oratory Club, Singing Circle, Art Camp) with **past-event recaps** ("thank you for the clay class") and filler. Confirms Phase 2 must gate on **tense/future-attendability** (not keywords) and Phase 3 must be **multilingual** with **city fallback** from `ig_accounts.default_city` (captions rarely name the city).
- [~] **Phase 2 — Filter (gate).** Built + tested on real data 2026-07-09. `scripts/ig-radar/gate.ts` (Haiku, multilingual, tense/intent-aware) + `gate-run.ts` (`npm run radar:gate [limit]`, idempotent via `is_event IS NULL`) + `getUngatedPosts`/`setIsEvent` helpers. First 3 posts: 2 events (recurring club, July series), 1 correct skip (a −20% promo with no specific event — the case a keyword filter fails). **Still pending:** run over the remaining posts; decide whether to persist gate confidence/reason (needs a schema add) for threshold tuning. *Done: only future events pass.*
  - **Finding:** the July "series" post is one post → many events — the multi-event case Phase 3 must handle (extraction returns an array).
- [~] **Phase 3 — Extract.** Built + verified live 2026-07-09. `event_candidates` table added (`db:push`ed); `scripts/ig-radar/extract.ts` (Haiku, `PROMPT_VERSION='extract-v1'`, multilingual→English, null-over-guess, relative dates vs. publish date, paraphrased description, multi-event array, city/country fallback) + `extract-run.ts` (`npm run radar:extract [limit]`, idempotent via `processed_at`) + store helpers. First run: post #1 → 1 clean candidate ("Speaking Club, Tue 18:30, Lisbon" — city fallback + PT inference worked); post #2 (July teaser) → 0 (no concrete dates — correct). Fixed a brittle JSON parse (model wrapped `[]` in fences + commentary → now grabs first-`[`-to-last-`]`). *Done: clean facts, no raw captions.*
  - **Scope decision (2026-07-09): ART/CREATIVE ONLY.** Gate prompt tightened to accept only creative/artistic attendable events and explicitly reject non-creative ones (speaking/debate clubs, language lessons, networking, fitness, support groups). Full-account re-run: **7/12 gated as events** (July series, Art Camp ×2 posts, drum lessons, workshops offering, Singing Circle, June series); 5 correctly rejected (speaking club, language classes, discount promo, 2 past-event recaps).
  - **Full extract run: 7 candidates.** Multi-event split works (Art Camp post → 2 sessions; Singing Circle → 3 dated instances); vague teasers → 0. **New findings for later phases:** (a) **past-dated events leak** (Singing Circle Jun 9/11/19, future when posted, now past) → Phase 5 publish must drop past events like `scripts/lib/extract.ts` does; (b) **dateless "ongoing offerings"** (drum/custom workshops, no `start_date`) need a product decision — a date-based calendar can't place them.
- [ ] **Phase 4 — Dedup/merge.** Group same-event posts (hash + organizer/date blocking); merge fields without clobbering best/curated values. *Done: 3 posts about 1 workshop = 1 event.*
- [ ] **Phase 5 — Publish.** Promote to `events` (guard respected) + attach our image; low-confidence → review queue. *Done: good events appear on the site.*
- [ ] **Phase 6 — Review & purge.** Retool approve/reject/edit screen over the queue; purge job nulls captions after the retention window. *Done: few-click approval; raw data auto-cleaned.*

## Thin first slice (before the fancy parts)
~10 accounts, posts+captions only, text-only gate + extraction, naive dedup, human approves into `events`. Measures **true event yield and false-positive rate** — the numbers that decide whether Stories/vision/video are ever worth building. (They are deferred by default: Stories = highest bot-protection for marginal yield; Reels/video-frame extraction = cut.)

## Decision log
- 2026-07-06 — **Acquisition = Apify**, public posts + carousels + captions, behind a swappable `Source` interface (opt-in Graph API can slot in later). DIY scraping rejected (proxy/anti-bot upkeep is a full-time job).
- 2026-07-06 — **Facts-only retention, our own images.** Kills copyright risk. Descriptions paraphrased, never copied. Captions stored transiently then purged.
- 2026-07-06 — **No separate OCR / video-frame stage.** Multimodal LLM reads flyer text directly; Reels/video deferred. Vision gated behind the cheap text gate to control cost.
- 2026-07-06 — **raw → candidate → canonical as separate tables** so extraction can re-run without re-scraping.
- 2026-07-06 — Reuse the existing curation guard for promotion; do not write a second one.

## Open questions
- **Store captions at all?** Current plan: yes, transiently, for cheap reprocessing during active prompt iteration, then purge. Alternative: never store → lose cheap reprocessing. (Leaning: store + purge.)
- **Retention window** length before the purge job nulls `caption` (e.g. 14 / 30 days).
- **Apify cost** at target account count × cadence — model before committing; may argue for opt-in sooner.
- **Auto-publish threshold** — confidence bar for going live vs. review queue (trades coverage vs. precision).
- **Hybrid opt-in path** — worth building the Instagram Graph API "Connect your account" flow for organizers, or defer? (Only path that removes ToS risk entirely; realistic uptake is low early.)
- **Naming** — `ig-radar` (proposed) vs `event-sonar` / `ig-ingest`.
