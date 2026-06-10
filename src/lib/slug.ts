import { ArtEvent } from '@/types';

// Combining diacritical marks (U+0300–U+036F) left behind by NFKD normalization,
// e.g. "Zürich" → "Zu" + combining-umlaut → stripped → "zurich". Built from
// char codes so the source stays pure ASCII.
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  'g',
);

/** Lowercase, diacritic-stripped, hyphen-separated URL slug. */
export function slugify(input: string): string {
  return (input ?? '')
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Stable, unique, human-readable slug for an event: `title-city-<idprefix>`.
 * The id is the dedup hash (stable across scrapes), so the slug never changes
 * for a given event, and the suffix keeps same-title/same-city events distinct.
 * No DB column needed — derived here and matched in getEventBySlug().
 */
export function eventSlug(event: ArtEvent): string {
  const base = [event.title, event.city]
    .map((s) => slugify(s ?? ''))
    .filter(Boolean)
    .join('-');
  const suffix = slugify(event.id).slice(0, 8);
  return [base, suffix].filter(Boolean).join('-') || event.id;
}

export function citySlug(city: string): string {
  return slugify(city);
}
