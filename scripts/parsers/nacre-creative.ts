import { extractEventsFromHtml, extractOgImage, stripHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const BASE = 'https://nacrecreative.com';
const LISTING_URL = `${BASE}/pages/workshops`;

// Nacre Creative's listing page shows workshop names and prices but not dates.
// Dates live on each individual product page, so we follow every /products/ link
// and pass the combined content to Claude in one extraction call.

export async function run(): Promise<void> {
  const listRes = await fetch(LISTING_URL);
  if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
  const listHtml = await listRes.text();

  // Extract unique product paths, e.g. /products/watercolor-basics
  const productPaths = [
    ...new Set(
      [...listHtml.matchAll(/href="(\/products\/[^"?#]+)"/g)].map((m) => m[1]),
    ),
  ];

  if (productPaths.length === 0) {
    console.log('[Nacre Creative] No product links found on listing page');
    return;
  }

  console.log(`[Nacre Creative] Found ${productPaths.length} product link(s) — fetching details…`);

  // Fetch product pages with a small delay to be polite. Capture each page's
  // real URL + og:image so the extractor can snap the LLM's transcribed
  // sourceUrl/imageUrl back to ground truth (LLMs drop emoji from URLs, etc.).
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
      sourceName: 'Nacre Creative Budapest',
      defaultCity: 'Budapest',
      defaultCountry: 'Hungary',
    },
    { pages: pages.map((p) => ({ url: p.url, imageUrl: p.imageUrl })) },
  );

  console.log(`[Nacre Creative] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
