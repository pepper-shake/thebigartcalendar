import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';
import { jsonLdEvent } from './fable-lisbon';

const ORGANISER = 'https://www.eventbrite.pt/o/collage-working-club-55562553233';

// Collage Working Club is a Lisbon collage community: drop-in Scissor Sessions
// and masterclasses at Jardins do Bombarda, plus sessions at partner venues. All
// of it is ticketed on Eventbrite, whose organiser page embeds the upcoming
// events (venue, price) in __NEXT_DATA__. That list repeats the start time as
// the end time, so each event page supplies the real end time, description and
// image. Deterministic, no LLM (same Eventbrite idea as fable-lisbon.ts, reached
// from the organiser page rather than a Linktree).

interface Listing {
  eventbrite_event_id: string;
  name: string;
  url: string;
  is_online_event?: boolean;
  is_cancelled?: boolean;
  primary_venue?: {
    name?: string;
    address?: { city?: string; address_1?: string; localized_address_display?: string };
  };
  ticket_availability?: {
    is_free?: boolean;
    minimum_ticket_price?: { major_value?: string };
  };
}

// Events sit at different depths of __NEXT_DATA__, and an event can repeat.
function findListings(node: unknown, found = new Map<string, Listing>()): Map<string, Listing> {
  if (Array.isArray(node)) {
    for (const x of node) findListings(x, found);
  } else if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (typeof o.eventbrite_event_id === 'string' && typeof o.url === 'string') {
      found.set(o.eventbrite_event_id, o as unknown as Listing);
    }
    for (const v of Object.values(o)) findListings(v, found);
  }
  return found;
}

// Wall time at the venue. Preferred over the JSON-LD dates, which carry a `Z`.
function localTime(html: string, key: 'startDate' | 'endDate') {
  const m = html.match(new RegExp(`"${key}":\\{[^}]*"local":"(\\d{4}-\\d{2}-\\d{2})T(\\d{2}:\\d{2})`));
  return m ? { date: m[1], time: m[2] } : null;
}

function formatPrice(t: Listing['ticket_availability']): string | null {
  if (t?.is_free) return 'Free';
  const n = Number(t?.minimum_ticket_price?.major_value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `€${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export async function collect(): Promise<NewEvent[]> {
  const res = await fetch(ORGANISER);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const m = (await res.text()).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Eventbrite __NEXT_DATA__ not found');
  const listings = [...findListings(JSON.parse(m[1])).values()];

  const today = new Date().toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const l of listings) {
    if (l.is_online_event || l.is_cancelled) continue;

    await new Promise((r) => setTimeout(r, 300));
    const sourceUrl = l.url.split('?')[0];
    const page = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!page.ok) {
      console.warn(`[Collage Working Club] ${sourceUrl}: HTTP ${page.status}, skipping`);
      continue;
    }
    const html = await page.text();
    const start = localTime(html, 'startDate');
    const end = localTime(html, 'endDate');
    const ev = jsonLdEvent(html);
    if (!start) {
      console.warn(`[Collage Working Club] ${sourceUrl}: no start date, skipping`);
      continue;
    }
    if (start.date < today) continue; // upcoming only (no extract.ts guard here)
    if (/Cancelled|Postponed/i.test(ev?.eventStatus ?? '')) continue;

    // Their home base is listed under two names; both are this address.
    const address = l.primary_venue?.address;
    const atBase = /Gomes Freire/i.test(address?.address_1 ?? '');
    const image = Array.isArray(ev?.image) ? ev.image[0] : ev?.image;

    events.push({
      // Keyed on the Eventbrite id, so a retitled event keeps its row.
      id: makeId(`eventbrite:${l.eventbrite_event_id}`, '', start.date),
      title: l.name.trim(),
      type: 'workshop',
      startDate: start.date,
      endDate: end && end.date !== start.date ? end.date : null,
      startTime: start.time,
      endTime: end?.time ?? null,
      venue: atBase ? 'Jardins do Bombarda' : (l.primary_venue?.name ?? null),
      city: !address?.city || /^lisboa$/i.test(address.city) ? 'Lisbon' : address.city,
      country: 'Portugal',
      address: atBase ? 'Rua Gomes Freire 161, Lisboa' : (address?.localized_address_display ?? null),
      organiserName: 'Collage Working Club',
      organiserUrl: 'https://www.instagram.com/collageworkingclub/',
      description: ev?.description?.trim() || null,
      imageUrl: image ?? null,
      ticketsUrl: sourceUrl,
      price: formatPrice(l.ticket_availability),
      tags: ['collage', 'paper', 'workshop'],
      sourceUrl,
      sourceName: 'Collage Working Club',
      externalId: l.eventbrite_event_id,
      scrapedAt: new Date(),
    });
  }

  console.log(`[Collage Working Club] ${events.length} upcoming event(s) found via Eventbrite`);
  return events;
}

export async function run(): Promise<void> {
  await upsertEvents(await collect());
}
