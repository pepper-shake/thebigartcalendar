import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';
import { MANUAL_EVENTS, MANUAL_VENUES } from './events';

// Existing env vars win, so `DATABASE_URL=… npm run events:manual` targets
// another DB (e.g. the local PGlite server from `npm run db:local`).
process.loadEnvFile('.env.local');

// Upsert every entry in events.ts through the same path as the scraper, so
// curation edits (status, *_override) survive re-syncs. Removing an entry from
// the file does NOT delete the row — hide it via curation instead.

const rows: NewEvent[] = MANUAL_EVENTS.map((e) => {
  const v = MANUAL_VENUES[e.venue];
  // Stable id: venue + title + date (+ time, for two sessions on one day).
  const sourceUrl = `manual:${e.venue}`;
  return {
    id: makeId(sourceUrl, e.title, e.startTime ? `${e.startDate} ${e.startTime}` : e.startDate),
    title: e.title,
    type: e.type,
    startDate: e.startDate,
    endDate: e.endDate ?? null,
    startTime: e.startTime ?? null,
    endTime: e.endTime ?? null,
    venue: v.venue,
    venueUrl: v.url,
    city: v.city,
    country: v.country,
    address: v.address,
    organiserName: v.venue,
    organiserUrl: v.url,
    description: [e.description, v.bookingNote].filter(Boolean).join(' '),
    imageUrl: e.imageUrl ?? v.imageUrl,
    ticketsUrl: e.ticketsUrl ?? v.url,
    price: e.price ?? null,
    tags: [e.type, ...(e.tags ?? []), v.city.toLowerCase()],
    sourceUrl: v.url,
    sourceName: v.venue,
    externalId: sourceUrl,
    scrapedAt: new Date(),
  };
});

upsertEvents(rows).then(() => console.log(`[manual] upserted ${rows.length} event(s)`));
