import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://www.moniqueclara.com';

// Monique Clara Studio is a tufting studio in Amsterdam (Houthavens) selling
// rugs and prints and running small-group workshops: beginner tufting, tufting
// for two, tufted mirrors, punch needle, embroidered photos. The shop is Big
// Cartel, whose /products.json lists every product with its options; each
// workshop session is one option named by its date, e.g. "Sat 31st Oct 1pm".
// So: deterministic, no LLM (same structured-source idea as disco-wheel.ts).

interface BigCartelProduct {
  name: string;
  permalink: string;
  url: string;
  status: string;
  price: number;
  description: string;
  images: { url: string }[];
  categories: { name: string }[];
  options: { id: number; name: string; sold_out: boolean }[];
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Sat 31st Oct 1pm", "Sun 8th Nov 1:30pm", "Thur 12th Nov 6pm". The weekday is
// ignored (the shop sometimes gets it wrong); day + month + time are used.
const SESSION = /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;

const pad = (n: number) => String(n).padStart(2, '0');

function parseSession(name: string, now: Date): { date: string; time: string } | null {
  const m = name.match(SESSION);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase()) + 1;
  if (!month) return null;
  let hour = Number(m[3]) % 12;
  if (m[5].toLowerCase() === 'pm') hour += 12;
  // No year in the label: a month more than ~2 months behind today is next year's.
  const year = month < now.getUTCMonth() + 1 - 2 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  return { date: `${year}-${pad(month)}-${pad(Number(m[1]))}`, time: `${pad(hour)}:${m[4] ?? '00'}` };
}

// "2½-hour", "5 hour", "3 hrs" → minutes. A range ("3–5 hours") has no fixed end.
function durationMinutes(description: string): number | null {
  const m = description.match(/(?<![–-]\s?)\b(\d+)(½)?\s*-?\s*(?:hours?|hrs?)\b/i);
  return m ? Number(m[1]) * 60 + (m[2] ? 30 : 0) : null;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

// Opening paragraph(s) of the product description, up to ~300 characters,
// stopping at the first list ("During the workshop, you'll learn:", "- Wool").
function summary(description: string, title: string): string {
  const paras = description
    .split(/\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  let out = '';
  for (const p of paras) {
    if (/:$/.test(p) || /^[-*]/.test(p)) break;
    if (out && out.length + p.length > 300) break;
    out = out ? `${out} ${p}` : p;
  }
  return out.length >= 80 ? out : `${out} ${title} at Monique Clara Tufting Studio, Amsterdam. All materials included.`.trim();
}

/** Fetch + build without writing (also used for dry runs). */
export async function collect(): Promise<NewEvent[]> {
  const res = await fetch(`${BASE}/products.json?limit=100`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const products: BigCartelProduct[] = await res.json();
  const workshops = products.filter(
    (p) => p.status === 'active' && p.categories.some((c) => /workshop/i.test(c.name)),
  );

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const p of workshops) {
    const title = p.name.replace(/\s+amsterdam\s*$/i, '').replace(/\bworkshops\b/i, 'workshop').trim();
    const duration = durationMinutes(p.description);
    const forTwo = /for 2|for two/i.test(p.name);
    const pageUrl = `${BASE}${p.url}`;

    for (const option of p.options) {
      // Gift vouchers etc. have no date in the option name.
      const session = parseSession(option.name, now);
      if (!session || option.sold_out || session.date < today) continue;
      events.push({
        id: makeId(pageUrl, title, `${session.date} ${session.time}`),
        title,
        type: 'workshop',
        startDate: session.date,
        endDate: null,
        startTime: session.time,
        endTime: duration ? addMinutes(session.time, duration) : null,
        venue: 'Monique Clara Tufting Studio',
        venueUrl: BASE,
        city: 'Amsterdam',
        country: 'Netherlands',
        address: 'Condensatorweg 36, 1014 AX Amsterdam',
        organiserName: 'Monique Clara Studio',
        organiserUrl: BASE,
        description: summary(p.description, title),
        imageUrl: p.images[0]?.url.split('?')[0] ?? null,
        ticketsUrl: pageUrl,
        price: `€${p.price.toFixed(0)}${forTwo ? ' for two' : ''} + VAT`,
        tags: ['workshop', 'textile', /punch/i.test(title) ? 'punch-needle' : /embroider/i.test(title) ? 'embroidery' : 'tufting', 'amsterdam'],
        sourceUrl: pageUrl,
        sourceName: 'Monique Clara Studio',
        externalId: String(option.id),
        scrapedAt: new Date(),
      });
    }
  }

  console.log(`[Monique Clara] ${events.length} upcoming session(s) from ${workshops.length} workshop product(s)`);
  return events;
}

export async function run(): Promise<void> {
  await upsertEvents(await collect());
}
