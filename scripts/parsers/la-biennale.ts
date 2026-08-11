import { extractEventsFromHtml, stripHtml } from '../lib/extract';
import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://www.labiennale.org';
const AGENDA_URL = `${BASE}/en/agenda`;

// Fallback image shown for any Biennale event that has no image of its own.
const VENUE_IMAGE = '/venues/la-biennale.jpg';

// The LLM sometimes returns the same festival under slightly different titles
// ("Biennale Danza 2026" vs "Biennale Danza 2026 – 20th International Festival…"),
// which would otherwise become separate rows on the same date. Collapse a title to
// its base (the part before a dash) so those variants are treated as one event.
function baseTitle(title: string): string {
  return title.split(/[–—-]/)[0].trim();
}

// The agenda paginates via ?page=N with 5 entries per page.
// We walk pages until one returns no new content.
async function fetchAllAgendaPages(): Promise<string> {
  const pages: string[] = [];
  let page = 0;

  while (true) {
    const url = page === 0 ? AGENDA_URL : `${AGENDA_URL}?sector=All&place=All&year=All&month=All&day=All&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const html = await res.text();
    const text = stripHtml(html);

    // Stop when the page has no event dates (Drupal agenda entries always contain a year)
    if (page > 0 && !text.includes('2026') && !text.includes('2027')) break;

    pages.push(`[page ${page}]\n${text}`);
    page++;

    // Safety cap — avoid infinite loops if the site changes structure
    if (page > 20) break;

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return pages.join('\n\n---\n\n');
}

export async function run(): Promise<void> {
  console.log('[La Biennale] Fetching paginated agenda…');
  const combined = await fetchAllAgendaPages();

  const events = await extractEventsFromHtml(
    combined,
    {
      sourceName: 'La Biennale di Venezia',
      defaultCity: 'Venice',
      defaultCountry: 'Italy',
      defaultVenue: 'La Biennale di Venezia',
    },
    { maxChars: 120_000 },
  );

  // Keep one event per (festival, date): collapse same-day duplicates and give a
  // stable id (base title + date) so re-scrapes update in place instead of piling
  // up new rows when the title text varies. Prefer the longest title in a group as
  // the most descriptive one, and fall back to the venue image when none was found.
  const byKey = new Map<string, NewEvent>();
  for (const e of events) {
    const key = `${baseTitle(e.title)}::${e.startDate}`;
    const existing = byKey.get(key);
    if (!existing || e.title.length > existing.title.length) {
      byKey.set(key, {
        ...e,
        id: makeId('labiennale', baseTitle(e.title), e.startDate),
        imageUrl: e.imageUrl ?? VENUE_IMAGE,
      });
    }
  }
  const deduped = [...byKey.values()];

  console.log(
    `[La Biennale] ${deduped.length} event(s) after dedupe (from ${events.length} extracted)`,
  );
  await upsertEvents(deduped);
}
