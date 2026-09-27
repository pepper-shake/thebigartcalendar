import { and, asc, eq, inArray, sql, type Column } from 'drizzle-orm';
import { db } from './index';
import { events, organiserDefaults, places, type Event, type Place } from './schema';
import { PORTUGAL_ONLY_MODE, VISIBLE_COUNTRIES } from '@/config/feature-flags';

// Geographic feature flag, applied once here so every page (calendar, filters,
// hubs, event/place pages, sitemap) sees the same restricted dataset. Returns
// undefined (no condition) when the flag is off.
function visibleCountry(country: Column) {
  if (!PORTUGAL_ONLY_MODE) return undefined;
  return inArray(
    sql`lower(${country})`,
    VISIBLE_COUNTRIES.map((c) => c.toLowerCase()),
  );
}

/** An event row plus its organiser's default image (null if none set). */
export type EventWithDefault = Event & { organiserDefaultImage: string | null };

export async function getAllEvents(): Promise<EventWithDefault[]> {
  const rows = await db
    .select({ event: events, organiserDefaultImage: organiserDefaults.imageUrl })
    .from(events)
    .leftJoin(organiserDefaults, eq(events.sourceName, organiserDefaults.sourceName))
    .where(and(eq(events.status, 'published'), visibleCountry(events.country)))
    .orderBy(asc(events.startDate));

  return rows.map((r) => ({ ...r.event, organiserDefaultImage: r.organiserDefaultImage }));
}

/** Published places, name ascending. */
export async function getAllPlaces(): Promise<Place[]> {
  return db
    .select()
    .from(places)
    .where(and(eq(places.status, 'published'), visibleCountry(places.country)))
    .orderBy(asc(places.name));
}
