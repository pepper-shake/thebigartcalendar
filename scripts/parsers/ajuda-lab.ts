import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://ajudalab.pt';
const REGISTRATION_URL = `${BASE}/inscricao-no-workshop/`;
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSelyZuAy21TxXYBo2KFYYXmf3odKlnaoWDjvr-_9MlNqmgG_g/viewform';

// Ajuda Lab is an art/craft workshop atelier at Mercado da Ajuda, Lisbon. Its
// WordPress workshop pages carry no dates — the only dated schedule is the
// options list of the Google Form embedded on /inscricao-no-workshop/, e.g.
//   "Modelagem em Cera - Joalharia 11 Outubro 15H 35€ - Madalena Sereno"
// Google Forms ships its questions as a JSON blob (FB_PUBLIC_LOAD_DATA_) in the
// page HTML, so we read the options from there and parse them with a regex —
// no LLM step (same "structured source" idea as disco-wheel.ts).

// Known workshop pages, matched against the form option text. The title is kept
// stable per workshop so the dedup id doesn't churn when the form wording drifts.
interface Workshop {
  match: RegExp;
  title: string;
  page: string | null;
  imageUrl: string | null;
  durationHours: number | null;
  description: string;
  tags: string[];
}

const WORKSHOPS: Workshop[] = [
  {
    match: /cera|joalharia/i,
    title: 'Modelação em Cera para Joalharia',
    page: `${BASE}/workshop-de-modelacao-em-cera-para-joalharia/`,
    imageUrl: `${BASE}/wp-content/uploads/2026/06/jewellery_workshop_lisbon.png`,
    durationHours: 3,
    description:
      'A 3-hour lost-wax jewellery workshop: sculpt a wax model and turn it into a personalised ring, pendant or earrings (casting billed separately by weight/metal). Max 6 people.',
    tags: ['workshop', 'jewellery', 'wax-casting', 'lisbon'],
  },
  {
    match: /pintura|desenho/i,
    title: 'Pintura e Desenho à Vista',
    page: `${BASE}/workshop-de-pintura/`,
    imageUrl: `${BASE}/wp-content/uploads/2026/03/workshop_painting_lisbon-1.jpg`,
    durationHours: null,
    description: 'A painting and observational drawing workshop at Ajuda Lab.',
    tags: ['workshop', 'painting', 'drawing', 'lisbon'],
  },
  {
    match: /poster/i,
    title: 'PosterLab — Design de um Poster',
    page: null,
    imageUrl: null,
    durationHours: null,
    description: 'A hands-on graphic design workshop: design your own poster from idea to print-ready layout.',
    tags: ['workshop', 'graphic-design', 'poster', 'lisbon'],
  },
  {
    match: /macram/i,
    title: 'Macramé com Cristais',
    page: `${BASE}/workshop-artesanato-macrame/`,
    imageUrl: null,
    durationHours: null,
    description: 'A macramé craft workshop with crystals at Ajuda Lab.',
    tags: ['workshop', 'macrame', 'craft', 'lisbon'],
  },
  {
    match: /velas/i,
    title: 'Velas Aromáticas e Decorativas',
    page: `${BASE}/workshop-de-velas-aromaticas-e-decorativas/`,
    imageUrl: null,
    durationHours: null,
    description: 'A workshop on making scented and decorative candles at Ajuda Lab.',
    tags: ['workshop', 'candles', 'craft', 'lisbon'],
  },
];

// The form also lists non-art sessions (e.g. accounting for freelancers) — out of scope.
const SKIP = /contabilidade|contabilista/i;

const MONTHS: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

// "11 Outubro 15H 35€" / "12 de Setembro 10h 35€" / "25 Outubro 11h30 35€"
const DATE_RE = /(\d{1,2})\s+(?:de\s+)?([a-zç]+)\s+(\d{1,2})\s*h\s*(\d{2})?\s+(\d+)\s*€/i;

function extractOptions(html: string): string[] {
  const m = html.match(/FB_PUBLIC_LOAD_DATA_ = (\[[\s\S]*?\]);<\/script>/);
  if (!m) throw new Error('Google Form data blob not found');
  const data = JSON.parse(m[1]);
  // data[1][1] = questions; each question's [4][0][1] = its choice options.
  const questions: unknown[][] = data[1][1];
  const q = questions.find((x) => /workshop/i.test(String(x[1])));
  const choices = (q?.[4] as unknown[][] | undefined)?.[0]?.[1] as unknown[][] | undefined;
  if (!choices) throw new Error('Workshop question not found in form');
  return choices.map((c) => String(c[0]));
}

// The form gives no year: take the next occurrence of that day, allowing a
// ~2-month lookback so a stale past option doesn't jump to next year.
function inferYear(month: number, day: number, today: Date): number {
  const y = today.getUTCFullYear();
  const candidate = Date.UTC(y, month - 1, day);
  const lookback = today.getTime() - 60 * 24 * 3600 * 1000;
  return candidate < lookback ? y + 1 : y;
}

export async function run(): Promise<void> {
  const res = await fetch(FORM_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const options = extractOptions(await res.text());

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const option of options) {
    if (SKIP.test(option)) continue;

    const d = option.match(DATE_RE);
    const workshop = WORKSHOPS.find((w) => w.match.test(option));
    if (!d || !workshop) {
      console.warn(`[Ajuda Lab] Unparsed form option, skipping: "${option}"`);
      continue;
    }

    const [, dd, monthName, hh, min, price] = d;
    const month = MONTHS[monthName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')];
    if (!month) {
      console.warn(`[Ajuda Lab] Unknown month "${monthName}" in: "${option}"`);
      continue;
    }
    const day = Number(dd);
    const year = inferYear(month, day, now);
    const startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (startDate < today) continue; // upcoming sessions only (no extract.ts guard here)

    const startHour = Number(hh);
    const startTime = `${String(startHour).padStart(2, '0')}:${min ?? '00'}`;
    const endTime = workshop.durationHours
      ? `${String(startHour + workshop.durationHours).padStart(2, '0')}:${min ?? '00'}`
      : null;

    // Teacher is the trailing " - Name" segment.
    const teacher = option.split(/\s+-\s+/).at(-1)?.trim();
    const description = teacher ? `${workshop.description} With ${teacher}.` : workshop.description;

    const sourceUrl = workshop.page ?? REGISTRATION_URL;
    events.push({
      id: makeId(sourceUrl, workshop.title, startDate),
      title: workshop.title,
      type: 'workshop',
      startDate,
      endDate: null,
      startTime,
      endTime,
      venue: 'Ajuda Lab',
      venueUrl: `${BASE}/`,
      city: 'Lisbon',
      country: 'Portugal',
      address: 'Mercado da Ajuda, Lisbon',
      organiserName: 'Ajuda Lab',
      organiserUrl: `${BASE}/`,
      description,
      imageUrl: workshop.imageUrl,
      ticketsUrl: REGISTRATION_URL,
      price: `€${price}`,
      tags: workshop.tags,
      sourceUrl,
      sourceName: 'Ajuda Lab',
      externalId: null,
      scrapedAt: new Date(),
    });
  }

  console.log(`[Ajuda Lab] ${events.length} upcoming session(s) found in registration form`);
  await upsertEvents(events);
}
