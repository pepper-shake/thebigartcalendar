import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const LISTING = 'https://shesgotyou.com/events/';

// She's Got You runs workshops and gatherings for women in Lisbon. Its /events/
// page carries a schema.org ItemList of the *upcoming* events in JSON-LD (past
// ones stay on the page as cards but drop out of the list), each with start/end
// (UTC offset), venue, price, image and its own page URL — so one request,
// deterministic, no LLM (same structured-source idea as fable-lisbon.ts).

interface JsonLdEvent {
  '@type'?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  eventStatus?: string;
  location?: { name?: string };
  image?: string | string[];
  offers?: { price?: string } | { price?: string }[];
  url?: string;
}

export function listedEvents(html: string): JsonLdEvent[] {
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      if (data?.['@type'] === 'ItemList') {
        return (data.itemListElement ?? [])
          .map((li: { item?: JsonLdEvent }) => li.item)
          .filter((x: JsonLdEvent | undefined): x is JsonLdEvent => x?.['@type'] === 'Event');
      }
    } catch {
      // not JSON we care about
    }
  }
  throw new Error('Events ItemList JSON-LD not found');
}

// "2026-11-21T11:00:00+00:00" → ["2026-11-21", "11:00"] (the venue's wall time).
function splitLocal(iso?: string): [string | null, string | null] {
  const m = iso?.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
  return m ? [m[1], m[2] ?? null] : [null, null];
}

function formatPrice(offers: JsonLdEvent['offers']): string | null {
  const raw = (Array.isArray(offers) ? offers[0] : offers)?.price;
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return 'Free';
  return `€${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export async function collect(): Promise<NewEvent[]> {
  const res = await fetch(LISTING, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Events page HTTP ${res.status}`);

  const today = new Date().toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const ev of listedEvents(await res.text())) {
    if (!ev.name || !ev.startDate) continue;
    if (/Cancelled|Postponed/i.test(ev.eventStatus ?? '')) continue;

    const [startDate, startTime] = splitLocal(ev.startDate);
    const [endDay, endTime] = splitLocal(ev.endDate);
    if (!startDate || startDate < today) continue; // upcoming only (no extract.ts guard here)

    const sourceUrl = ev.url ?? LISTING;
    const title = ev.name.trim();
    const image = Array.isArray(ev.image) ? ev.image[0] : ev.image;

    events.push({
      id: makeId(sourceUrl, title, startDate),
      title,
      type: 'workshop',
      startDate,
      endDate: endDay && endDay !== startDate ? endDay : null,
      startTime,
      endTime,
      // "Meia Lua Mercearia, Lisbon" — the site gives no street address.
      venue: ev.location?.name?.replace(/,\s*Lisbon$/i, '').trim() || null,
      city: 'Lisbon',
      country: 'Portugal',
      address: null,
      organiserName: 'She’s Got You',
      organiserUrl: 'https://shesgotyou.com/',
      description: ev.description?.trim() || null,
      imageUrl: image ?? null,
      ticketsUrl: sourceUrl,
      price: formatPrice(ev.offers),
      tags: ['lisbon', 'workshop', 'women'],
      sourceUrl,
      sourceName: 'She’s Got You',
      externalId: sourceUrl.match(/\/events\/([^/]+)\/?$/)?.[1] ?? null,
      scrapedAt: new Date(),
    });
  }

  return events;
}

export async function run(): Promise<void> {
  const events = await collect();
  console.log(`[She’s Got You] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
