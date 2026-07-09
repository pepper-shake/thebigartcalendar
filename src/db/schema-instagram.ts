import { pgTable, text, date, timestamp, boolean, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { events } from './schema';

// ─────────────────────────────────────────────────────────────────────────
// ig-radar — Instagram ingestion layer (Phase 1: Watch)
//
// These tables are the RAW capture layer. They are deliberately separate from
// the published `events` table (src/db/schema.ts): raw → candidate → canonical
// stay distinct so extraction can be re-run without re-scraping.
//
// Legal posture (see docs/exec-plans/active/ig-radar.md):
//   • `caption` is WORKING DATA only — kept to extract facts, then purged.
//   • We never publish captions or Instagram images. Facts only.
// ─────────────────────────────────────────────────────────────────────────

/** Instagram accounts we monitor, with per-account fetch cursor + health. */
export const igAccounts = pgTable('ig_accounts', {
  id: text('id').primaryKey(),                 // normalized handle, e.g. "studioaqua"
  handle: text('handle').notNull().unique(),   // as displayed, e.g. "studioaqua"
  displayName: text('display_name'),
  defaultCity: text('default_city'),           // fallback city when a post omits it
  sourceType: text('source_type').notNull().default('scraped'), // 'scraped' | 'opt_in'

  // Delta fetching + health. `cursor` is the ISO timestamp of the newest post
  // we've already ingested; on each run we skip anything at-or-before it.
  cursor: text('cursor'),
  status: text('status').notNull().default('active'), // 'active' | 'paused' | 'failing'
  failureCount: integer('failure_count').notNull().default(0),
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),

  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Raw posts captured from Apify. Immutable; inserted once, never rewritten. */
export const igPosts = pgTable('ig_posts', {
  id: text('id').primaryKey(),                 // Instagram post id (natural key from Apify)
  accountId: text('account_id').notNull().references(() => igAccounts.id),
  shortCode: text('short_code'),               // for the permalink / human reference
  type: text('type').notNull(),               // 'post' | 'carousel' | 'reel' | 'story'
  permalink: text('permalink').notNull(),     // source link — safe to keep & link back
  caption: text('caption'),                   // WORKING DATA — nulled by the purge job
  publishedAt: timestamp('published_at', { withTimezone: true }),
  contentHash: text('content_hash'),          // hash(caption + media ref) for exact dedup

  // Filled by later phases; null in Phase 1.
  isEvent: boolean('is_event'),               // gate result (Phase 2)
  processedAt: timestamp('processed_at', { withTimezone: true }), // extraction done (Phase 3)
  purgedAt: timestamp('purged_at', { withTimezone: true }),       // when caption was cleared (Phase 6)

  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────
// Interpretation layer (Phase 3: Extract)
//
// One row per (post, extraction run). Facts are all nullable — real posts omit
// most. `description` is PARAPHRASED in English, never a copy of the caption.
// A single post can yield MANY candidates (e.g. a "July series" announcement).
// ─────────────────────────────────────────────────────────────────────────

export const eventCandidates = pgTable('event_candidates', {
  id: text('id').primaryKey(),                 // uuid, generated in code
  postId: text('post_id').notNull().references(() => igPosts.id),

  // extracted facts (all nullable)
  title: text('title'),
  organizer: text('organizer'),
  venue: text('venue'),
  type: text('type'),                          // maps to events.type vocabulary
  technique: text('technique'),                // watercolor | ceramics | bookbinding | ...
  startDate: date('start_date'),
  endDate: date('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  price: text('price'),
  ticketsUrl: text('tickets_url'),
  city: text('city'),
  country: text('country'),
  description: text('description'),            // PARAPHRASED English, model-generated
  tags: text('tags').array(),

  // extraction metadata
  confidence: real('confidence'),             // overall 0–1
  fieldConfidence: jsonb('field_confidence'), // optional per-field scores
  promptVersion: text('prompt_version').notNull(),
  model: text('model').notNull(),

  status: text('status').notNull().default('pending'), // pending | needs_review | merged | rejected
  canonicalEventId: text('canonical_event_id').references(() => events.id), // set on merge (Phase 4/5)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type IgAccount = typeof igAccounts.$inferSelect;
export type NewIgAccount = typeof igAccounts.$inferInsert;
export type IgPost = typeof igPosts.$inferSelect;
export type NewIgPost = typeof igPosts.$inferInsert;
export type EventCandidate = typeof eventCandidates.$inferSelect;
export type NewEventCandidate = typeof eventCandidates.$inferInsert;
