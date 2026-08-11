import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://discowheel.com';

// Disco Wheel is a ceramic studio in Lisbon. Its drop-in workshops are sold as
// Shopify products titled only by weekday ("THURSDAY WORKSHOP") with empty
// bodies and no per-product images — the real session date + time live *only* in
// the variant SKU, e.g. `W260812-19` = 2026-08-12 at 19:00 (`WP…` = the pricier
// package variants). Because there is no date text anywhere for the LLM to read,
// this parser decodes the SKU deterministically from products.json and builds the
// events directly (mirrors the "authoritative structured source" idea behind
// dvi-taures.ts, but here the structure is exact enough that no LLM step is needed).

interface ShopifyVariant {
  sku: string | null;
  price: string;
  available: boolean;
}
interface ShopifyProduct {
  title: string;
  handle: string;
  variants: ShopifyVariant[];
}

// W260812-19 / WP260724-16C → [ , YY, MM, DD, HH ]
const SKU_RE = /^W[A-Z]?(\d{2})(\d{2})(\d{2})-(\d{2})/;

export async function run(): Promise<void> {
  const res = await fetch(`${BASE}/products.json?limit=250`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { products } = (await res.json()) as { products: ShopifyProduct[] };

  const today = new Date().toISOString().split('T')[0];

  // Disco Wheel runs many sessions a day; we surface just one evening session per
  // date so the calendar isn't flooded. Collect every upcoming session first, then
  // keep the latest-starting one on each date (the evening slot).
  interface Session {
    startDate: string;
    startHour: number;
    handle: string;
    price: string;
    sku: string | null;
  }
  const byDate = new Map<string, Session>();

  for (const p of products) {
    if (!/WORKSHOP/i.test(p.title)) continue;

    for (const v of p.variants) {
      const m = v.sku?.match(SKU_RE);
      if (!m) continue;

      const [, yy, mm, dd, hh] = m;
      const startDate = `20${yy}-${mm}-${dd}`;
      if (startDate < today) continue; // upcoming sessions only

      const startHour = Number(hh);
      const existing = byDate.get(startDate);
      // Prefer the latest start time on the day (the evening session).
      if (!existing || startHour > existing.startHour) {
        byDate.set(startDate, { startDate, startHour, handle: p.handle, price: v.price, sku: v.sku });
      }
    }
  }

  const events: NewEvent[] = [];
  for (const s of byDate.values()) {
    const startTime = `${String(s.startHour).padStart(2, '0')}:00`;
    // Workshops run 90 minutes.
    const endTime = `${String(s.startHour + 1).padStart(2, '0')}:30`;

    const sourceUrl = `${BASE}/products/${s.handle}`;
    const id = makeId(sourceUrl, 'Ceramic Workshop at Disco Wheel', `${s.startDate} ${startTime}`);

    events.push({
      id,
      title: 'Ceramic Workshop at Disco Wheel',
      type: 'workshop',
      startDate: s.startDate,
      endDate: null,
      startTime,
      endTime,
      venue: 'Disco Wheel',
      city: 'Lisbon',
      country: 'Portugal',
      address: 'Rua de São Paulo 150, Lisbon',
      description:
        'A 90-minute immersive drop-in ceramic workshop guided by a teacher, in a studio with dimmed lighting, music and scents. Up to 8 people.',
      imageUrl: '/venues/disco-wheel.jpg',
      ticketsUrl: sourceUrl,
      price: `€${Math.round(Number(s.price))}`,
      tags: ['ceramics', 'pottery', 'workshop'],
      sourceUrl,
      sourceName: 'Disco Wheel',
      externalId: s.sku,
      scrapedAt: new Date(),
    });
  }

  console.log(`[Disco Wheel] ${events.length} evening session(s) found (one per day)`);
  await upsertEvents(events);
}
