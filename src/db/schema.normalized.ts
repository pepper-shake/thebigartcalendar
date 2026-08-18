/**
 * NORMALIZED EVENT DATA MODEL — proposed, NOT yet live.
 *
 * Design + rationale: docs/design/event-data-model.md, decision #0007.
 * This file is intentionally NOT referenced by drizzle.config.ts, so
 * `npm run db:push` will NOT apply it. To adopt: point the config's
 * `schema` at this file (or merge these tables into schema.ts), verify the
 * diff, then push — see the migration path in docs/design/event-data-model.md.
 *
 * Key decisions encoded here:
 *  - Occurrences hold dates/times (one event → many dates/venues).
 *  - Wall-clock local time (`localStart`/`localEnd` + IANA `timezone`) is the
 *    source of truth; `startAt`/`endAt` are the derived UTC instants used for
 *    querying. The instants are computed in the scraper's normalize step —
 *    NOT a DB generated column — so nothing here depends on generated-column
 *    support in drizzle-kit/db:push.
 *  - Type (taxonomy table) is kept separate from Tags (taxonomy + N:M).
 */
import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  numeric,
  char,
  doublePrecision,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// --- enums (small, fixed sets) ---------------------------------------------
export const organiserType = pgEnum('organiser_type', ['organisation', 'person']);
export const eventStatus = pgEnum('event_status', [
  'draft',
  'published',
  'hidden',
  'cancelled',
  'archived',
]);
export const attendanceMode = pgEnum('attendance_mode', ['in_person', 'online', 'hybrid']);
export const organiserRole = pgEnum('organiser_role', [
  'host',
  'co_organiser',
  'sponsor',
  'partner',
]);
export const tagCategory = pgEnum('tag_category', [
  'topic',
  'medium',
  'audience',
  'price',
  'format',
]);

// --- taxonomies ------------------------------------------------------------
export const eventTypes = pgTable('event_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  parentId: uuid('parent_id'), // self-FK (sub-types); .references added below via relations if needed
  jsonLdType: text('json_ld_type'), // schema.org @type, e.g. 'ExhibitionEvent'
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: tagCategory('category'),
});

// --- places ----------------------------------------------------------------
export const cities = pgTable(
  'cities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    countryCode: char('country_code', { length: 2 }).notNull(), // ISO 3166-1 alpha-2
    region: text('region'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    timezone: text('timezone'), // IANA, default zone for the city
  },
  (t) => [uniqueIndex('cities_name_country_uq').on(sql`lower(${t.name})`, t.countryCode)],
);

export const venues = pgTable(
  'venues',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    address: text('address'),
    cityId: uuid('city_id')
      .notNull()
      .references(() => cities.id),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    website: text('website'),
    description: text('description'),
    rawName: text('raw_name'), // pre-normalization name, for dedup audit
  },
  (t) => [uniqueIndex('venues_name_city_uq').on(sql`lower(${t.name})`, t.cityId)],
);

// --- organisers ------------------------------------------------------------
export const organisers = pgTable(
  'organisers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: organiserType('type').notNull(),
    website: text('website'),
    description: text('description'),
    rawName: text('raw_name'),
  },
  (t) => [uniqueIndex('organisers_name_website_uq').on(sql`lower(${t.name})`, t.website)],
);

// --- sources (provenance) --------------------------------------------------
export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  baseUrl: text('base_url'),
});

// --- event -----------------------------------------------------------------
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    dedupeHash: text('dedupe_hash').notNull().unique(), // hash(source_url + normalized_title + first_start_date)

    name: text('name').notNull(),
    typeId: uuid('type_id')
      .notNull()
      .references(() => eventTypes.id),
    summary: text('summary'), // short, for cards / meta description
    description: text('description'),

    status: eventStatus('status').notNull().default('published'), // curation column
    attendanceMode: attendanceMode('attendance_mode').notNull().default('in_person'),

    isFree: boolean('is_free').notNull().default(false),
    priceMin: numeric('price_min', { precision: 10, scale: 2 }),
    priceMax: numeric('price_max', { precision: 10, scale: 2 }),
    currency: char('currency', { length: 3 }), // ISO 4217
    ticketUrl: text('ticket_url'),
    imageUrl: text('image_url'),

    rrule: text('rrule'), // OPTIONAL provenance only; never queried at request time

    sourceId: uuid('source_id').references(() => sources.id),
    sourceUrl: text('source_url'),
    scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),

    // --- curation (written by the admin UI, never by the scraper) ---
    curatedAt: timestamp('curated_at', { withTimezone: true }),
    nameOverride: text('name_override'),
    descriptionOverride: text('description_override'),
    imageUrlOverride: text('image_url_override'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('events_type_idx').on(t.typeId), index('events_status_idx').on(t.status)],
);

// --- occurrences (dates/times live here) -----------------------------------
export const eventOccurrences = pgTable(
  'event_occurrences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    venueId: uuid('venue_id').references(() => venues.id),

    // Source of truth: intended local wall-clock time (NO timezone).
    // mode:'string' keeps JS from coercing these into a local Date/zone.
    localStart: timestamp('local_start', { withTimezone: false, mode: 'string' }).notNull(),
    localEnd: timestamp('local_end', { withTimezone: false, mode: 'string' }),
    timezone: text('timezone').notNull(), // IANA, e.g. 'Europe/Berlin'

    // Derived UTC instants, computed in the scraper's normalize step.
    // Indexed — all calendar/range queries run against these.
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }),

    isAllDay: boolean('is_all_day').notNull().default(false),
    isCancelled: boolean('is_cancelled').notNull().default(false),
    doorTime: timestamp('door_time', { withTimezone: true }),
  },
  (t) => [
    index('occ_start_idx').on(t.startAt),
    index('occ_venue_start_idx').on(t.venueId, t.startAt),
    index('occ_event_idx').on(t.eventId),
  ],
);

// --- join tables (N:M) -----------------------------------------------------
export const eventOrganisers = pgTable(
  'event_organisers',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    organiserId: uuid('organiser_id')
      .notNull()
      .references(() => organisers.id),
    role: organiserRole('role').notNull().default('host'),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.organiserId] })],
);

export const eventTags = pgTable(
  'event_tags',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.tagId] })],
);

// --- inferred types --------------------------------------------------------
export type EventType = typeof eventTypes.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type Organiser = typeof organisers.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventOccurrence = typeof eventOccurrences.$inferSelect;
export type NewEventOccurrence = typeof eventOccurrences.$inferInsert;
