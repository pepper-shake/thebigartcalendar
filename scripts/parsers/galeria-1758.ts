import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://galeria1758.pt';

// Galeria 1758 is a contemporary art gallery in Ajuda, Lisbon. It sells each
// workshop session as its own WooCommerce product, titled only by date
// ("25 MARÇO 26", "23 FEVEREIRO 2026") in category "Workshop". The WooCommerce
// Store API lists them as JSON, so this parser is deterministic — no LLM
// (same "structured source" idea as disco-wheel.ts). The session time and
// activity name ("Atividade: PINTURA EM AZULEJO · Horário: QUARTA-FEIRA
// 10.30H-13.00H") appear only on the product page, so that page is fetched for
// upcoming sessions only. Its exhibitions (/eventos/) are Elementor pages with
// year-less date ranges and aren't scraped.

interface StoreProduct {
  name: string;
  permalink: string;
  is_in_stock: boolean;
  short_description: string;
  prices: { price: string; currency_minor_unit: number };
  categories: { slug: string }[];
  images: { src: string }[];
}

const MONTHS: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

// "25 MARÇO 26" / "23 FEVEREIRO 2026" / "2 FEVREIRO 26" → YYYY-MM-DD. Months are
// matched on their first 3 letters, which tolerates typos like "FEVREIRO".
function parseDateName(name: string): string | null {
  const m = stripAccents(name).match(/(\d{1,2})\s+([a-z]+)\s+(\d{2}|\d{4})\b/i);
  if (!m) return null;
  const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
  if (!month) return null;
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return `${year}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function pageText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

// "Horário: QUARTA-FEIRA 10.30H-13.00H" → ['10:30', '13:00']
function parseHours(text: string): [string | null, string | null] {
  const m = text.match(/Hor[aá]rio:[^0-9]{0,40}(\d{1,2})[.:h](\d{2})\s*H?\s*[-–]\s*(\d{1,2})[.:h](\d{2})/i);
  if (!m) return [null, null];
  const t = (h: string, mm: string) => `${h.padStart(2, '0')}:${mm}`;
  return [t(m[1], m[2]), t(m[3], m[4])];
}

// "Atividade: PINTURA EM AZULEJO Horário…" → "Pintura em Azulejo"
function parseActivity(text: string): string | null {
  const m = text.match(/Atividade:\s*([^:]+?)\s+Hor[aá]rio:/i);
  if (!m) return null;
  return m[1]
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_, sp: string, c: string) => sp + c.toUpperCase())
    .replace(/\b(Em|De|Da|Do|E)\b/g, (w) => w.toLowerCase());
}

const DESCRIPTIONS: [RegExp, string, string[]][] = [
  [
    /azulejo/i,
    'Learn traditional Portuguese azulejo (tile) painting: materials, transferring a design, and applying and mixing colours. Over about 2.5 hours you paint two 15×15 cm tiles, which are kiln-fired and ready 48 hours later. All materials and firing included; ages 3+.',
    ['workshop', 'azulejo', 'tile-painting', 'ceramics', 'lisbon'],
  ],
];

export async function run(): Promise<void> {
  // The Store API's `category` filter takes numeric ids only; fetch all
  // products (~40) and filter on the stable category slug instead.
  const res = await fetch(`${BASE}/wp-json/wc/store/v1/products?per_page=100`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const products = (await res.json()) as StoreProduct[];

  const today = new Date().toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const p of products) {
    if (!p.is_in_stock || !p.categories.some((c) => c.slug === 'workshop')) continue;
    const startDate = parseDateName(p.name);
    if (!startDate) continue; // vouchers, "Atividades para grupos", etc.
    if (startDate < today) continue; // upcoming sessions only (no extract.ts guard here)

    const pageRes = await fetch(p.permalink);
    const text = pageRes.ok ? pageText(await pageRes.text()) : '';
    await new Promise((r) => setTimeout(r, 300));

    const title = parseActivity(text) ?? 'Pintura em Azulejo';
    const [startTime, endTime] = parseHours(text);
    const known = DESCRIPTIONS.find(([re]) => re.test(title));
    const description =
      known?.[1] ?? pageText(p.short_description).trim().slice(0, 500);
    const price = Number(p.prices.price) / 10 ** p.prices.currency_minor_unit;

    events.push({
      id: makeId(p.permalink, title, startDate),
      title,
      type: 'workshop',
      startDate,
      endDate: null,
      startTime,
      endTime,
      venue: 'Galeria 1758',
      venueUrl: `${BASE}/`,
      city: 'Lisbon',
      country: 'Portugal',
      address: 'Travessa da Memória 47A, 1300-402 Lisboa',
      organiserName: 'Galeria 1758',
      organiserUrl: `${BASE}/`,
      description,
      imageUrl: p.images[0]?.src ?? null,
      ticketsUrl: p.permalink,
      price: price > 0 ? `€${Math.round(price)}` : null,
      tags: known?.[2] ?? ['workshop', 'lisbon'],
      sourceUrl: p.permalink,
      sourceName: 'Galeria 1758',
      externalId: null,
      scrapedAt: new Date(),
    });
  }

  console.log(`[Galeria 1758] ${events.length} upcoming workshop session(s) found`);
  await upsertEvents(events);
}
