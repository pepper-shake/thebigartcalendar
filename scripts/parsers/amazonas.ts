import { makeId, upsertEvents } from '../lib/upsert';
import { MANUAL_EVENTS } from '../manual/events';
import type { LinktreeLink } from '../lib/google-form';
import type { NewEvent } from '../../src/db/schema';

const LINKTREE = 'https://linktr.ee/amz.amazonas';
const ORGANISER = 'Amazonas';
const INSTAGRAM = 'https://www.instagram.com/amazonas.events/';

// Amazonas curates recurring markets at 8 Marvila, Lisbon. Its Linktree lists
// each edition and every workshop on the programme, one link each, with the
// date and time only in the link title:
//   "Arraiolos Embroidery · 07.11 | 14:00–17:00"
//   "Phytography · Botanical Photography Workshop | 08.11 | 12:30 & 14:30"
//   "AMAZONAS CHRISTMAS MARKET | 12 & 13 DECEMBER | 8 MARVILA"
// Deterministic, no LLM. Titles carry no year, so see resolveDate().

// Stall sign-ups, the workshop open call, and the links that are not events.
const SKIP = /registration|\bcall\b|\|\s*workshops?\s*$|^website|discogs/i;
// Workshops run by clubs we already scrape. Amazonas links its own short URL to
// these forms, so the form's title is what identifies them, not the URL.
const SCRAPED_ELSEWHERE = /eventbrite\.[^ ]*collage-working-club|collage working club|drawing session #\d+|masterclass #\d+/i;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WORKSHOP_TITLE = /^(.+?)[\s·|]+(\d{1,2})\.(\d{1,2})\s*(?:\|\s*(.+))?$/;
const MARKET_DATE = new RegExp(`^((?:\\d{1,2}\\s*(?:&|,|-|–)\\s*)*\\d{1,2})\\s+(${MONTHS.join('|')})$`, 'i');

interface Link extends LinktreeLink {
  id?: string;
  metaData?: { title?: string } | null;
}

interface Parsed {
  title: string;
  type: 'workshop' | 'fair';
  startDate: string;
  endDate: string | null;
  slots: { start: string | null; end: string | null }[];
}

const pad = (n: number | string) => String(n).padStart(2, '0');

// The occurrence of a day and month closest to today. An edition stays linked
// for a while after it ends, and must not come back as next year's event.
function resolveDate(month: number, day: number, today: string): string {
  const year = Number(today.slice(0, 4));
  const distance = (y: number) => Math.abs(Date.parse(`${y}-${pad(month)}-${pad(day)}`) - Date.parse(today));
  const nearest = [year - 1, year, year + 1].reduce((a, b) => (distance(b) < distance(a) ? b : a));
  return `${nearest}-${pad(month)}-${pad(day)}`;
}

// "14:00–17:00" is one session; "12:30 & 14:30" is two, with no end time.
function parseSlots(text: string | undefined): Parsed['slots'] {
  const times = (text?.match(/\d{1,2}[:h]\d{2}/g) ?? []).map((t) => {
    const [h, m] = t.split(/[:h]/);
    return `${pad(h)}:${m}`;
  });
  if (times.length > 1 && /[&,+]/.test(text!)) return times.map((start) => ({ start, end: null }));
  return [{ start: times[0] ?? null, end: times[1] ?? null }];
}

function parseMarket(title: string, today: string): Parsed | null {
  const parts = title.split('|').map((s) => s.trim());
  const at = parts.findIndex((p) => MARKET_DATE.test(p));
  if (at < 1) return null;
  const [, days, monthName] = parts[at].match(MARKET_DATE)!;
  const month = MONTHS.indexOf(monthName.toLowerCase()) + 1;
  const numbers = days.match(/\d+/g)!.map(Number);
  const startDate = resolveDate(month, numbers[0], today);
  const last = resolveDate(month, numbers.at(-1)!, today);
  return {
    // All-caps in the Linktree: "AMAZONAS CHRISTMAS MARKET" → "Amazonas Christmas Market".
    title: parts.slice(0, at).join(': ').toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, s, c) => s + c.toUpperCase()),
    type: 'fair',
    startDate,
    endDate: last === startDate ? null : last,
    slots: [{ start: null, end: null }],
  };
}

function parseTitle(raw: string, today: string): Parsed | null {
  const title = raw.trim();
  const m = title.match(WORKSHOP_TITLE);
  if (!m) return parseMarket(title, today);
  const [, name, day, month, times] = m;
  if (Number(month) < 1 || Number(month) > 12) return null;
  return {
    title: name.trim(),
    type: 'workshop',
    startDate: resolveDate(Number(month), Number(day), today),
    endDate: null,
    slots: parseSlots(times),
  };
}

// Rows from scripts/manual/events.ts have curated titles and prices, and their
// own ids, so a link they already cover is left to them. Workshops match on the
// sign-up link; a market has none there, so it matches on its edition's date.
const bare = (url: string) => url.split(/[?#]/)[0];

function isHandEntered(link: Link, parsed: Parsed): boolean {
  return MANUAL_EVENTS.some(
    (e) =>
      (e.ticketsUrl && bare(e.ticketsUrl) === bare(link.url!)) ||
      ((e.venue as string) === 'amazonas' && e.type === 'fair' && parsed.type === 'fair' && e.startDate === parsed.startDate),
  );
}

// Luma's schema.org offer, or the Event Tickets block on Omira's WordPress site.
// Only these hosts: Shopify pages say "sold out" for any one variant. A failed
// check keeps the event.
const SOLD_OUT = /schema\.org\/SoldOut|tickets-item-quantity-unavailable[^>]*>\s*Sold Out/i;

async function isSoldOut(url: string): Promise<boolean> {
  if (!/\/\/(www\.)?(luma\.com|lu\.ma|omiralx\.com)\//i.test(url)) return false;
  try {
    return SOLD_OUT.test(await (await fetch(url)).text());
  } catch {
    return false;
  }
}

/** Fetch + parse without writing (also used for dry runs). */
export async function collect(): Promise<NewEvent[]> {
  // Plain fetch: Linktree answers HTTP 406 to a bare 'Mozilla/5.0' UA.
  const res = await fetch(LINKTREE);
  if (!res.ok) throw new Error(`Linktree HTTP ${res.status}`);
  const m = (await res.text()).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Linktree __NEXT_DATA__ not found');
  // pageProps.links, not account.links: only this copy has metaData (the page titles).
  const links: Link[] = JSON.parse(m[1])?.props?.pageProps?.links ?? [];

  const today = new Date().toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const link of links) {
    const title = link.title ?? '';
    if (!link.id || !link.url || SKIP.test(title)) continue;
    if (SCRAPED_ELSEWHERE.test(`${link.url} ${title} ${link.metaData?.title ?? ''}`)) continue;

    const parsed = parseTitle(title, today);
    if (!parsed) {
      console.warn(`[${ORGANISER}] No date in "${title.trim()}", skipping`);
      continue;
    }
    if (parsed.startDate < today || isHandEntered(link, parsed)) continue; // no extract.ts guard here
    if (await isSoldOut(link.url)) continue;

    parsed.slots.forEach((slot, i) => {
      events.push({
        // Keyed on the Linktree link, so a retitled workshop keeps its row. The
        // date covers a link reused for the next edition; the "linktree:" prefix
        // keeps it apart from the manual:amazonas ids.
        id: makeId(`linktree:amz.amazonas:${link.id}`, String(i), parsed.startDate),
        title: parsed.title,
        type: parsed.type,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        startTime: slot.start,
        endTime: slot.end,
        venue: ORGANISER,
        venueUrl: INSTAGRAM,
        city: 'Lisbon',
        country: 'Portugal',
        address: '8 Marvila, Praça David Leandro da Silva 8, 1950-064 Lisboa',
        organiserName: ORGANISER,
        organiserUrl: INSTAGRAM,
        description:
          parsed.type === 'fair'
            ? 'Amazonas market of independent artists, designers and makers at 8 Marvila, Lisbon.'
            : 'Workshop at the Amazonas market, 8 Marvila, Lisbon. Details and booking at the sign-up link.',
        imageUrl: link.modifiers?.thumbnailUrl ?? null,
        ticketsUrl: link.url,
        tags: [parsed.type, ...(parsed.type === 'fair' ? ['market'] : []), 'lisbon'],
        sourceUrl: link.url!,
        sourceName: ORGANISER,
        externalId: `linktree:${link.id}`,
        scrapedAt: new Date(),
      });
    });
  }

  console.log(`[${ORGANISER}] ${events.length} upcoming event(s) found via Linktree`);
  return events;
}

export async function run(): Promise<void> {
  await upsertEvents(await collect());
}
