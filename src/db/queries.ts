import { unstable_cache } from 'next/cache';
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

// Sources that publish far more sessions than the calendar should show (Disco
// Wheel runs a drop-in workshop almost every day). Each is capped at N events
// per calendar month, picked evenly across the month so the remaining ones
// still cover early, mid and late dates. Applied here so the calendar, event
// pages, hubs and sitemap all agree on which events exist.
const MONTHLY_CAP_BY_SOURCE: Record<string, number> = {
  'Disco Wheel': 6,
};

function capPerSourceMonth<T extends Event>(rows: T[]): T[] {
  // source → 'YYYY-MM' → that month's rows (already in startDate order)
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    if (!(r.sourceName in MONTHLY_CAP_BY_SOURCE)) continue;
    const key = `${r.sourceName}|${r.startDate.slice(0, 7)}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(r);
  }

  const keep = new Set<string>();
  for (const [key, group] of groups) {
    const cap = MONTHLY_CAP_BY_SOURCE[key.split('|')[0]];
    // One per date: a republished slot can leave a duplicate row behind.
    const byDate = [...new Map(group.map((r) => [r.startDate, r])).values()];
    const n = byDate.length;
    const picks = n <= cap ? byDate : Array.from({ length: cap }, (_, i) => byDate[Math.floor((i * n) / cap)]);
    for (const r of picks) keep.add(r.id);
  }

  return rows.filter((r) => !(r.sourceName in MONTHLY_CAP_BY_SOURCE) || keep.has(r.id));
}

// Shared data cache for the two reads every page makes. The DB only changes
// once a day (scraper) plus the odd curation edit, so serving these from
// Next's data cache lets the Neon compute sleep between refreshes instead of
// waking on every visit and crawl (Free plan: 100 CU-hours a month). Curation
// edits show up within DB_CACHE_SECONDS. See docs/ARCHITECTURE.md §Caching.
const DB_CACHE_SECONDS = 3600;

// The cache stores JSON, so timestamp columns come back as strings.
const toDate = <T extends Date | null>(v: T | string): T => (typeof v === 'string' ? (new Date(v) as T) : v);

/** An event row plus its organiser's default image (null if none set). */
export type EventWithDefault = Event & { organiserDefaultImage: string | null };

async function queryAllEvents(): Promise<EventWithDefault[]> {
  const rows = await db
    .select({ event: events, organiserDefaultImage: organiserDefaults.imageUrl })
    .from(events)
    .leftJoin(organiserDefaults, eq(events.sourceName, organiserDefaults.sourceName))
    .where(and(eq(events.status, 'published'), visibleCountry(events.country)))
    .orderBy(asc(events.startDate));

  return capPerSourceMonth(
    rows.map((r) => ({ ...r.event, organiserDefaultImage: r.organiserDefaultImage })),
  );
}

async function queryAllPlaces(): Promise<Place[]> {
  return db
    .select()
    .from(places)
    .where(and(eq(places.status, 'published'), visibleCountry(places.country)))
    .orderBy(asc(places.name));
}

const cachedEvents = unstable_cache(queryAllEvents, ['all-events'], {
  revalidate: DB_CACHE_SECONDS,
  tags: ['events'],
});

const cachedPlaces = unstable_cache(queryAllPlaces, ['all-places'], {
  revalidate: DB_CACHE_SECONDS,
  tags: ['places'],
});

/** Published events (curation status applied, capped per source/month), start
 *  date ascending. Served from the data cache. */
export async function getAllEvents(): Promise<EventWithDefault[]> {
  return (await cachedEvents()).map((e) => ({
    ...e,
    scrapedAt: toDate(e.scrapedAt),
    curatedAt: toDate(e.curatedAt),
  }));
}

/** Published places, name ascending. Served from the data cache. */
export async function getAllPlaces(): Promise<Place[]> {
  return (await cachedPlaces()).map((p) => ({
    ...p,
    createdAt: toDate(p.createdAt),
    updatedAt: toDate(p.updatedAt),
  }));
}
