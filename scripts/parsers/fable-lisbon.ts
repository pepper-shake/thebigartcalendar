import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const LINKTREE = 'https://linktr.ee/fablelisbon';

// Fable is an English bookshop, specialty-coffee café and natural-wine bar in
// Lisbon that runs creative events and workshops. It has no website; its
// Linktree ("SIGN UP FOR AN EVENT BELOW!") links each upcoming event to an
// Eventbrite page, and every Eventbrite page carries a schema.org Event in
// JSON-LD (start/end with UTC offset, venue, price, image). So: read the
// Linktree's __NEXT_DATA__ for the Eventbrite links, then each page's JSON-LD —
// deterministic, no LLM (same structured-source idea as disco-wheel.ts).

// Non-art events on the same list (a phone-free garden hangout).
const SKIP = /offline sunday/i;

// Everything else is a workshop / writing session, except stage nights.
const PERFORMANCE = /open mic|concert|performance|reading night|poetry night/i;

interface LinktreeLink {
  title?: string;
  url?: string;
}

interface JsonLdEvent {
  '@type'?: string | string[];
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  image?: string | string[];
  url?: string;
  eventStatus?: string;
  offers?: { lowPrice?: string; price?: string; priceCurrency?: string }[];
}

function eventbriteLinks(html: string): string[] {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Linktree __NEXT_DATA__ not found');
  const links: LinktreeLink[] = JSON.parse(m[1])?.props?.pageProps?.account?.links ?? [];
  return links
    .filter((l) => !!l.url && /eventbrite\.[a-z.]+\/e\//i.test(l.url) && !SKIP.test(l.title ?? ''))
    .map((l) => l.url!.split('?')[0]); // drop the affiliate/tracking query
}

function jsonLdEvent(html: string): JsonLdEvent | null {
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      for (const x of Array.isArray(data) ? data : [data]) {
        if (/Event$/.test(String(x?.['@type']))) return x as JsonLdEvent;
      }
    } catch {
      // not JSON we care about
    }
  }
  return null;
}

// "2026-10-17T19:00:00+01:00" → ["2026-10-17", "19:00"] (the venue's wall time).
function splitLocal(iso?: string): [string | null, string | null] {
  const m = iso?.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
  return m ? [m[1], m[2] ?? null] : [null, null];
}

function formatPrice(offers: JsonLdEvent['offers']): string | null {
  const raw = offers?.[0]?.lowPrice ?? offers?.[0]?.price;
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return 'Free';
  return `€${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export async function run(): Promise<void> {
  const res = await fetch(LINKTREE);
  if (!res.ok) throw new Error(`Linktree HTTP ${res.status}`);
  const urls = eventbriteLinks(await res.text());

  const today = new Date().toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const url of urls) {
    await new Promise((r) => setTimeout(r, 300));
    const page = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!page.ok) {
      console.warn(`[Fable] ${url}: HTTP ${page.status}, skipping`);
      continue;
    }
    const ev = jsonLdEvent(await page.text());
    if (!ev?.name || !ev.startDate) {
      console.warn(`[Fable] ${url}: no Event JSON-LD, skipping`);
      continue;
    }
    if (/Cancelled|Postponed/i.test(ev.eventStatus ?? '')) continue;

    const [startDate, startTime] = splitLocal(ev.startDate);
    const [endDay, endTime] = splitLocal(ev.endDate);
    if (!startDate || startDate < today) continue; // upcoming only (no extract.ts guard here)

    const sourceUrl = (ev.url ?? url).split('?')[0];
    const title = ev.name.replace(/\s+at Fable$/i, '').trim();
    const image = Array.isArray(ev.image) ? ev.image[0] : ev.image;

    events.push({
      id: makeId(sourceUrl, title, startDate),
      title,
      type: PERFORMANCE.test(title) ? 'performance' : 'workshop',
      startDate,
      endDate: endDay && endDay !== startDate ? endDay : null,
      startTime,
      endTime,
      venue: 'Fable',
      city: 'Lisbon',
      country: 'Portugal',
      address: 'Rua dos Prazeres 10A, 1200-820 Lisboa',
      organiserName: 'Fable',
      organiserUrl: 'https://www.instagram.com/fablelisbon/',
      description: ev.description?.trim() || null,
      imageUrl: image ?? null,
      ticketsUrl: sourceUrl,
      price: formatPrice(ev.offers),
      tags: ['lisbon', 'books', ...(PERFORMANCE.test(title) ? ['open-mic'] : ['workshop'])],
      sourceUrl,
      sourceName: 'Fable',
      externalId: sourceUrl.match(/(\d+)\/?$/)?.[1] ?? null,
      scrapedAt: new Date(),
    });
  }

  console.log(`[Fable] ${events.length} upcoming event(s) found via Linktree → Eventbrite`);
  await upsertEvents(events);
}
