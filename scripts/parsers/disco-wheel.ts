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
  const events: NewEvent[] = [];
  const seen = new Set<string>();

  for (const p of products) {
    if (!/WORKSHOP/i.test(p.title)) continue;

    for (const v of p.variants) {
      const m = v.sku?.match(SKU_RE);
      if (!m) continue;

      const [, yy, mm, dd, hh] = m;
      const startDate = `20${yy}-${mm}-${dd}`;
      if (startDate < today) continue; // upcoming sessions only

      const startHour = Number(hh);
      const startTime = `${hh}:00`;
      // Workshops run 90 minutes.
      const endTime = `${String(startHour + 1).padStart(2, '0')}:30`;

      const sourceUrl = `${BASE}/products/${p.handle}`;
      const id = makeId(sourceUrl, 'Ceramic Workshop at Disco Wheel', `${startDate} ${startTime}`);
      if (seen.has(id)) continue;
      seen.add(id);

      events.push({
        id,
        title: 'Ceramic Workshop at Disco Wheel',
        type: 'workshop',
        startDate,
        endDate: null,
        startTime,
        endTime,
        venue: 'Disco Wheel',
        city: 'Lisbon',
        country: 'Portugal',
        address: 'Rua de São Paulo 150, Lisbon',
        description:
          'A 90-minute immersive drop-in ceramic workshop guided by a teacher, in a studio with dimmed lighting, music and scents. Up to 8 people.',
        imageUrl: null,
        ticketsUrl: sourceUrl,
        price: `€${Math.round(Number(v.price))}`,
        tags: ['ceramics', 'pottery', 'workshop'],
        sourceUrl,
        sourceName: 'Disco Wheel',
        externalId: v.sku,
        scrapedAt: new Date(),
      });
    }
  }

  console.log(`[Disco Wheel] ${events.length} upcoming session(s) found`);
  await upsertEvents(events);
}
