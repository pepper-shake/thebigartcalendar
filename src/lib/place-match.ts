import { type Place } from '@/db/schema';
import { type ArtEvent, type PlaceRef } from '@/types';
import { slugify } from '@/lib/slug';

// Read-time event → place linking. Events carry free-text venue / organiser
// names from the scraper; a place matches when one of its names (name + aliases)
// equals the event's name after normalization, in the same city (organisers may
// match across cities when unambiguous). Fixing a wrong or missing link = editing
// the place's `aliases` — the scraper and the events table are never touched.
// See docs/product/places.md.

/** Normalization for matching: "Hostelis ''El Nido''" ≈ "hostelis el nido". */
function key(name: string): string {
  return slugify(name);
}

export interface PlaceMatcher {
  /** `anyCity`: fall back to a same-name place in another city (organisers
   *  travel — a Vilnius studio runs sessions on the coast). Venues never do. */
  match(name: string | undefined, city: string | undefined, anyCity?: boolean): PlaceRef | undefined;
}

export function buildPlaceMatcher(places: Place[]): PlaceMatcher {
  // name-key → places carrying that name (several cities may share a name).
  const byName = new Map<string, Place[]>();
  for (const p of places) {
    for (const n of [p.name, ...(p.aliases ?? [])]) {
      const k = key(n);
      if (!k) continue;
      byName.set(k, [...(byName.get(k) ?? []), p]);
    }
  }

  return {
    match(name, city, anyCity = false) {
      if (!name) return undefined;
      const candidates = byName.get(key(name));
      if (!candidates) return undefined;
      const cityKey = city ? key(city) : '';
      // Same city wins; a place with no city set matches anywhere.
      const hit =
        candidates.find((p) => p.city && key(p.city) === cityKey) ??
        candidates.find((p) => !p.city) ??
        (anyCity && candidates.length === 1 ? candidates[0] : undefined);
      return hit ? { slug: hit.slug, name: hit.name } : undefined;
    },
  };
}

/** Attach venue/organiser place links to an event. The organiser falls back to
 *  the scraper's source name (e.g. an Instagram source with no organiser field). */
export function linkPlaces(e: ArtEvent, sourceName: string, m: PlaceMatcher): ArtEvent {
  const venuePlace = m.match(e.venue, e.city);
  const organiserPlace =
    m.match(e.organiserName ?? sourceName, e.city, true) ?? m.match(sourceName, e.city, true);
  return { ...e, venuePlace, organiserPlace };
}
