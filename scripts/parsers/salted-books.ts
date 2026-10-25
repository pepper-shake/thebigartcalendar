import { extractEventsFromHtml, stripHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const BASE = 'https://saltedbookslisbon.com';

// Salted Books is an English-language bookshop in Lisbon. Its courses & events
// page (/pages/courses-events) is built from Shopify collections, so we read
// each collection's products.json instead of scraping the page: one request
// per collection, with the full description of every product. Dates only exist
// as free text in those descriptions ("Tuesday, November 17th, 6.30pm"), so the
// combined text goes to Claude in one extraction call.
//
// Scope (agreed 2026-10-22): courses and workshops only. The book-clubs and
// events (book launches, screenings) collections are left out as not art, and
// so are language courses.
const COLLECTIONS = ['writing-courses', 'other-courses'];
const EXCLUDE = /\blanguage\b/i;

interface ShopifyProduct {
  handle: string;
  title: string;
  body_html: string | null;
  images: { src: string }[];
  variants: { title: string; price: string; available: boolean }[];
}

export async function run(): Promise<void> {
  const products = new Map<string, ShopifyProduct>();
  for (const c of COLLECTIONS) {
    const res = await fetch(`${BASE}/collections/${c}/products.json?limit=250`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for collection ${c}`);
    const { products: list } = (await res.json()) as { products: ShopifyProduct[] };
    for (const p of list) if (!EXCLUDE.test(p.title)) products.set(p.handle, p);
  }

  if (products.size === 0) {
    console.log('[Salted Books] No products found');
    return;
  }
  console.log(`[Salted Books] ${products.size} course/workshop product(s) — extracting…`);

  const pages = [...products.values()].map((p) => ({
    url: `${BASE}/products/${p.handle}`,
    imageUrl: p.images[0]?.src.split('?')[0] ?? null,
    text: [
      `Title: ${p.title}`,
      `Price: ${p.variants.map((v) => `${v.title === 'Default Title' ? '' : `${v.title} `}€${v.price}`).join(' / ')}`,
      p.variants.some((v) => v.available) ? '' : 'Status: sold out',
      stripHtml(p.body_html ?? ''),
    ]
      .filter(Boolean)
      .join('\n'),
  }));

  const combined = pages.map((p) => `[URL: ${p.url}]\n${p.text}`).join('\n\n---\n\n');

  const events = await extractEventsFromHtml(
    combined,
    {
      sourceName: 'Salted Books',
      defaultCity: 'Lisbon',
      defaultCountry: 'Portugal',
      defaultVenue: 'Salted Books',
      defaultAddress: 'Calçada do Marquês de Abrantes 96, 1200-720 Lisboa',
    },
    { pages: pages.map((p) => ({ url: p.url, imageUrl: p.imageUrl })) },
  );

  console.log(`[Salted Books] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
