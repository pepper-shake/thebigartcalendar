import { pgTable, text, date, timestamp } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: text('id').primaryKey(), // hash(sourceUrl + title + startDate)
  title: text('title').notNull(),
  type: text('type').notNull(), // gallery | fair | workshop | performance | auction
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  venue: text('venue'),
  venueUrl: text('venue_url'), // venue's website
  city: text('city'),
  country: text('country'),
  address: text('address'),
  organiserName: text('organiser_name'), // who runs the event, for credit + link
  organiserUrl: text('organiser_url'),   // organiser's website
  description: text('description'),
  imageUrl: text('image_url'),
  ticketsUrl: text('tickets_url'),
  price: text('price'),
  tags: text('tags').array(),
  sourceUrl: text('source_url').notNull(),
  sourceName: text('source_name').notNull(),
  externalId: text('external_id'),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),

  // --- curation (written by the admin UI, never by the scraper) ---
  status: text('status').notNull().default('published'), // 'published' | 'hidden' | 'pending'

  // Human overrides — null means "use the scraped value above".
  // Merged at read time in toArtEvent(); the scraper never writes these.
  imageUrlOverride: text('image_url_override'),
  titleOverride: text('title_override'),
  descriptionOverride: text('description_override'),

  curatedAt: timestamp('curated_at', { withTimezone: true }), // last manual edit
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// Per-organiser default image, uploaded via the admin UI (Retool → Vercel Blob).
// Used as a fallback when an event has no image of its own. Keyed by
// `events.source_name` (always set by the parser). Written only by the admin UI,
// never by the scraper.
export const organiserDefaults = pgTable('organiser_defaults', {
  sourceName: text('source_name').primaryKey(), // matches events.source_name
  imageUrl: text('image_url'),                  // hosted default image URL (nullable in prod)
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type OrganiserDefault = typeof organiserDefaults.$inferSelect;
