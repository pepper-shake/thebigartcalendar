import { getAllPlaces } from '@/db/queries';
import { type Place } from '@/db/schema';
import { type ArtEvent } from '@/types';
import { getPublishedEvents, isCurrent, todayISO } from '@/lib/events';
import { citySlug } from '@/lib/slug';

// Read-side selectors for the /places directory. Places are curated by hand;
// events are linked at read time (src/lib/place-match.ts).

export const PLACE_CATEGORIES: Record<string, string> = {
  gallery: 'Gallery',
  museum: 'Museum',
  studio: 'Studio',
  'workshop-space': 'Workshop space',
  shop: 'Art shop',
  'artist-run': 'Artist-run space',
  collective: 'Collective',
  other: 'Art place',
};

export function categoryLabel(category: string | null): string {
  return (category && PLACE_CATEGORIES[category]) || PLACE_CATEGORIES.other;
}

export interface PlaceSummary {
  place: Place;
  upcomingCount: number;
}

function eventsFor(place: Place, events: ArtEvent[]): ArtEvent[] {
  return events.filter(
    (e) => e.venuePlace?.slug === place.slug || e.organiserPlace?.slug === place.slug,
  );
}

/** Published places with their upcoming-event counts, optionally filtered by
 *  city slug and/or category. */
export async function listPlaces(filter: { city?: string; category?: string } = {}): Promise<
  PlaceSummary[]
> {
  const [places, events] = await Promise.all([getAllPlaces(), getPublishedEvents()]);
  const ref = todayISO();
  const current = events.filter((e) => isCurrent(e, ref));
  return places
    .filter((p) => !filter.city || (p.city && citySlug(p.city) === filter.city))
    .filter((p) => !filter.category || p.category === filter.category)
    .map((place) => ({ place, upcomingCount: eventsFor(place, current).length }));
}

/** One place by slug, with its upcoming (asc) and past (most recent first) events. */
export async function getPlaceBySlug(
  slug: string,
): Promise<{ place: Place; upcoming: ArtEvent[]; past: ArtEvent[] } | undefined> {
  const [places, events] = await Promise.all([getAllPlaces(), getPublishedEvents()]);
  const place = places.find((p) => p.slug === slug);
  if (!place) return undefined;
  const ref = todayISO();
  const linked = eventsFor(place, events);
  return {
    place,
    upcoming: linked.filter((e) => isCurrent(e, ref)),
    past: linked.filter((e) => !isCurrent(e, ref)).reverse(),
  };
}
