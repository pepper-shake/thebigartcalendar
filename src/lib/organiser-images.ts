import { type Event } from '@/db/schema';

// Last-resort placeholder so no event ever renders imageless.
export const SITE_DEFAULT_IMAGE = '/default-event.svg';

// The image fallback ladder, as an ordered, deduped list of candidate URLs:
//   admin override → scraped image → organiser default → site placeholder
//
// Returned as a list (not a single URL) so the client can advance to the next
// candidate when one fails to load — a non-null but dead scraped URL (e.g. a
// source deletes its image) then falls through to the organiser default instead
// of showing a broken image. The organiser default is uploaded via the admin UI
// and stored in `organiser_defaults`, joined in at read time (see getAllEvents).
export function eventImageCandidates(
  row: Event,
  organiserDefaultImage: string | null,
): string[] {
  const list = [
    row.imageUrlOverride,
    row.imageUrl,
    organiserDefaultImage,
    SITE_DEFAULT_IMAGE,
  ].filter((u): u is string => !!u);
  return [...new Set(list)];
}

// First (best) candidate — the image to render initially / server-side.
export function resolveEventImage(
  row: Event,
  organiserDefaultImage: string | null,
): string {
  return eventImageCandidates(row, organiserDefaultImage)[0];
}
