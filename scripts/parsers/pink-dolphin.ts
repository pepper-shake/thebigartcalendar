import { extractEventsFromHtml, extractOgImage, stripHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const BASE = 'https://pinkdolphinlisbon.com';
const LISTING_URL = `${BASE}/pages/eventsandcreativeworkshops`;

// Pink Dolphin's events page lists workshops but the dates and images live on
// each individual product page, so we follow every /products/ link and pass the
// combined content to Claude in one extraction call. (Mirrors nacre-creative.ts —
// scraping the listing page alone yields no per-event images.)

export async function run(): Promise<void> {
  const listRes = await fetch(LISTING_URL);
  if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
  const listHtml = await listRes.text();

  // Extract unique product paths, e.g. /products/sardine-scenes-collage-workshop
  const productPaths = [
    ...new Set(
      [...listHtml.matchAll(/href="(\/products\/[^"?#]+)"/g)].map((m) => m[1]),
    ),
  ];

  if (productPaths.length === 0) {
    console.log('[Pink Dolphin] No product links found on listing page');
    return;
  }

  console.log(`[Pink Dolphin] Found ${productPaths.length} product link(s) — fetching details…`);

  // Fetch product pages with a small delay to be polite. Capture each page's
  // real URL + og:image so the extractor can snap the LLM's transcribed
  // sourceUrl/imageUrl back to ground truth.
  const pages: { url: string; text: string; imageUrl: string | null }[] = [];
  for (const path of productPaths) {
    const url = `${BASE}${path}`;
    const r = await fetch(url);
    if (r.ok) {
      const raw = await r.text();
      pages.push({ url, text: stripHtml(raw), imageUrl: extractOgImage(raw) });
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Combine all pages into one pass for Claude, labelling each URL so it can
  // set the correct sourceUrl per event.
  const combined = pages
    .map((p) => `[URL: ${p.url}]\n${p.text}`)
    .join('\n\n---\n\n');

  const events = await extractEventsFromHtml(
    combined,
    {
      sourceName: 'Pink Dolphin Lisbon',
      defaultCity: 'Lisbon',
      defaultCountry: 'Portugal',
      defaultVenue: 'Pink Dolphin',
      defaultAddress: 'Rua Poço dos Negros 37, Lisbon',
    },
    { pages: pages.map((p) => ({ url: p.url, imageUrl: p.imageUrl })) },
  );

  console.log(`[Pink Dolphin] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
