import { getAllEvents } from '@/db/queries';
import { toArtEvent } from '@/lib/transform';
import { ArtEvent, EventType } from '@/types';
import { eventSlug, citySlug } from '@/lib/slug';

// Read-side selectors for SEO routes. Everything funnels through getAllEvents()
// → toArtEvent() (the curation-safe chokepoint in ARCHITECTURE.md), so hidden
// events never leak and human overrides always win.

/** Today as YYYY-MM-DD (lexicographically comparable to ArtEvent.date). */
function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** True if the event hasn't finished yet (ongoing or upcoming). */
export function isCurrent(e: ArtEvent, ref: string = todayISO()): boolean {
  return (e.endDate ?? e.date) >= ref;
}

/** All published events, curation merged, ordered by start date (asc). */
export async function getPublishedEvents(): Promise<ArtEvent[]> {
  const rows = await getAllEvents();
  return rows.map(toArtEvent);
}

/** Published events that are ongoing or upcoming — the indexable surface. */
export async function getCurrentEvents(): Promise<ArtEvent[]> {
  const ref = todayISO();
  return (await getPublishedEvents()).filter((e) => isCurrent(e, ref));
}

/** Resolve a single event by its derived slug. Searches all published events
 *  (past included) so old links keep resolving. */
export async function getEventBySlug(slug: string): Promise<ArtEvent | undefined> {
  return (await getPublishedEvents()).find((e) => eventSlug(e) === slug);
}

/** Current events of a given type, start-date ascending. */
export async function getEventsByType(type: EventType): Promise<ArtEvent[]> {
  return (await getCurrentEvents()).filter((e) => e.type === type);
}

/** Current events for a city slug, plus the city's display name. */
export async function getEventsByCitySlug(
  slug: string,
): Promise<{ city: string; events: ArtEvent[] }> {
  const events = (await getCurrentEvents()).filter(
    (e) => e.city && citySlug(e.city) === slug,
  );
  return { city: events[0]?.city ?? '', events };
}

export interface CitySummary {
  name: string;
  slug: string;
  count: number;
}

/** All cities that currently have at least one ongoing/upcoming event. */
export async function listCities(): Promise<CitySummary[]> {
  const map = new Map<string, CitySummary>();
  for (const e of await getCurrentEvents()) {
    if (!e.city) continue;
    const slug = citySlug(e.city);
    const existing = map.get(slug);
    if (existing) existing.count++;
    else map.set(slug, { name: e.city, slug, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
