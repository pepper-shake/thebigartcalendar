import { extractEventsFromHtml, stripHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const CALENDAR_URL = 'https://www.2tauresmeno.lt/rengini-kalendorius';

// 2 Taurės (Dvi Taurės Meno studija) lists its painting evenings on a Wix
// calendar page, but the dates there carry no year. Each event links to a
// bilietai.lt ticket page whose visible text has the authoritative date (with
// year), price, venue and image — so we follow those links and pass the
// combined content to Claude in one extraction pass. (Mirrors pink-dolphin.ts.)

export async function run(): Promise<void> {
  const listRes = await fetch(CALENDAR_URL);
  if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
  const listHtml = await listRes.text();

  // Collect the unique bilietai.lt event links the calendar points at.
  const eventUrls = [
    ...new Set(
      [...listHtml.matchAll(/https:\/\/www\.bilietai\.lt\/renginiai\/[^"'?#\s]+/g)].map(
        (m) => m[0],
      ),
    ),
  ];

  if (eventUrls.length === 0) {
    console.log('[2 Taurės] No bilietai.lt event links found on calendar page');
    return;
  }

  console.log(`[2 Taurės] Found ${eventUrls.length} event link(s) — fetching details…`);

  // Fetch each ticket page with a small delay to be polite. Keep only the top
  // of each page (title, dated line, venue, description, price, image); the
  // long footer/boilerplate below is repeated noise.
  const pages: { url: string; text: string }[] = [];
  for (const url of eventUrls) {
    const r = await fetch(url);
    if (r.ok) pages.push({ url, text: stripHtml(await r.text()).slice(0, 3000) });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Combine all pages into one pass for Claude, labelling each URL so it can
  // set the correct sourceUrl per event.
  const combined = pages.map((p) => `[URL: ${p.url}]\n${p.text}`).join('\n\n---\n\n');

  const events = await extractEventsFromHtml(
    combined,
    {
      sourceName: 'Dvi Taurės Meno studija',
      defaultCity: 'Vilnius',
      defaultCountry: 'Lithuania',
      defaultVenue: 'Dvi Taurės meno tapybos studija',
      defaultAddress: 'S. Konarskio g. 35A, Vilnius',
    },
    { maxChars: 100_000 },
  );

  console.log(`[2 Taurės] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
