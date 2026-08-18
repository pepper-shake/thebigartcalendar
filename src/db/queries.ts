import { asc, eq } from 'drizzle-orm';
import { db } from './index';
import { events, organiserDefaults, type Event } from './schema';

/** An event row plus its organiser's default image (null if none set). */
export type EventWithDefault = Event & { organiserDefaultImage: string | null };

export async function getAllEvents(): Promise<EventWithDefault[]> {
  const rows = await db
    .select({ event: events, organiserDefaultImage: organiserDefaults.imageUrl })
    .from(events)
    .leftJoin(organiserDefaults, eq(events.sourceName, organiserDefaults.sourceName))
    .where(eq(events.status, 'published'))
    .orderBy(asc(events.startDate));

  return rows.map((r) => ({ ...r.event, organiserDefaultImage: r.organiserDefaultImage }));
}
