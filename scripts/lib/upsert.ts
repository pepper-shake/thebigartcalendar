import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, type NewEvent } from '../../src/db/schema';
import { sql } from 'drizzle-orm';

export function makeId(sourceUrl: string, title: string, startDate: string): string {
  return createHash('sha256')
    .update(`${sourceUrl}::${title}::${startDate}`)
    .digest('hex')
    .slice(0, 32);
}

export async function upsertEvents(newEvents: NewEvent[]): Promise<void> {
  if (newEvents.length === 0) return;
  // One INSERT … ON CONFLICT can't touch the same id twice, so drop repeats
  // within a batch (last wins) instead of failing the whole source.
  newEvents = [...new Map(newEvents.map((e) => [e.id, e])).values()];

  const client = neon(process.env.DATABASE_URL!);
  const db = drizzle(client);

  await db
    .insert(events)
    .values(newEvents)
    .onConflictDoUpdate({
      target: events.id,
      // ⚠️ Curation columns (status, *_override, curated_at) are intentionally
      // absent below so manual edits survive the daily re-scrape. Do not add them.
      set: {
        title: sql`excluded.title`,
        type: sql`excluded.type`,
        startDate: sql`excluded.start_date`,
        endDate: sql`excluded.end_date`,
        startTime: sql`excluded.start_time`,
        endTime: sql`excluded.end_time`,
        venue: sql`excluded.venue`,
        city: sql`excluded.city`,
        country: sql`excluded.country`,
        address: sql`excluded.address`,
        description: sql`excluded.description`,
        imageUrl: sql`excluded.image_url`,
        ticketsUrl: sql`excluded.tickets_url`,
        price: sql`excluded.price`,
        tags: sql`excluded.tags`,
        sourceUrl: sql`excluded.source_url`,
        sourceName: sql`excluded.source_name`,
        externalId: sql`excluded.external_id`,
        scrapedAt: sql`now()`,
      },
    });
}
