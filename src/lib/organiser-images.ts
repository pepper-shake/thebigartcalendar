import { type Event } from '@/db/schema';

// Last-resort placeholder so no event ever renders imageless.
export const SITE_DEFAULT_IMAGE = '/default-event.svg';

// Resolve an event's image via the fallback ladder:
//   admin override → scraped image → organiser default → site placeholder
//
// The organiser default is uploaded via the admin UI and stored in the
// `organiser_defaults` table, joined in at read time (see getAllEvents).
export function resolveEventImage(
  row: Event,
  organiserDefaultImage: string | null,
): string {
  return (
    row.imageUrlOverride ??
    row.imageUrl ??
    organiserDefaultImage ??
    SITE_DEFAULT_IMAGE
  );
}
