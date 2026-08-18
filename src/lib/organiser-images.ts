import { type Event } from '@/db/schema';

// Per-organiser default images. When an event has no image of its own, we fall
// back to a picture that represents the organiser/source that runs it.
//
// Keyed by `events.source_name` (always set by the parser — see scripts/parsers/*),
// NOT by `organiser_name` (nullable, hand-edited). The value is a path under
// `public/`, so the file is committed to the repo and served free from the app's
// own CDN — no upload, no token, no external host that can break.
//
// To add one: drop `public/venues/<slug>.jpg` and add a line here mapping the
// parser's `sourceName` to it. Onboarding a source = add parser + add this line.
export const ORGANISER_DEFAULT_IMAGES: Record<string, string> = {
  'Disco Wheel': '/venues/disco-wheel.jpg',
  'La Biennale di Venezia': '/venues/la-biennale.jpg',
};

// Last-resort placeholder so no event ever renders imageless.
export const SITE_DEFAULT_IMAGE = '/default-event.svg';

// Resolve an event's image via the fallback ladder:
//   admin override → scraped image → organiser default → site placeholder
export function resolveEventImage(row: Event): string {
  return (
    row.imageUrlOverride ??
    row.imageUrl ??
    ORGANISER_DEFAULT_IMAGES[row.sourceName] ??
    SITE_DEFAULT_IMAGE
  );
}
