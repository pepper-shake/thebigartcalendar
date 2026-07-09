import { extractEventsFromHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const URL = 'https://collageclubldn.com/events';

// Collage Club LDN lists its in-person (London) events on a Squarespace events
// page — dates, venues and descriptions all render on that page, so we pass it
// straight to Claude. The separate /online-workshops page is intentionally not
// scraped: those are online-only (no physical European location).

export async function run(): Promise<void> {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const events = await extractEventsFromHtml(html, {
    sourceName: 'Collage Club LDN',
    defaultCity: 'London',
    defaultCountry: 'United Kingdom',
  });

  console.log(`[Collage Club] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
