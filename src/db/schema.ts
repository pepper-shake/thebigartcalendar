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
  city: text('city'),
  country: text('country'),
  address: text('address'),
  description: text('description'),
  imageUrl: text('image_url'),
  ticketsUrl: text('tickets_url'),
  price: text('price'),
  tags: text('tags').array(),
  sourceUrl: text('source_url').notNull(),
  sourceName: text('source_name').notNull(),
  externalId: text('external_id'),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
