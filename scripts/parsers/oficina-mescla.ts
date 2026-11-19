import Anthropic from '@anthropic-ai/sdk';
import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://oficinamescla.com';
const AGENDA = `${BASE}/en/agenda-workshops/`;
const COURSES = `${BASE}/en/cursos-e-workshops/`;

// Oficina Mescla is a printmaking studio in Porto (screenprinting, etching,
// lithography, linocut, bookbinding). Its calendar page has NO dates in text —
// each month (OUTUBRO, NOVEMBRO, …) shows one poster image per course/workshop,
// named by month: /uploads/2026/07/OUT_seri.png, /2026/09/NOV_lito.png. The
// dates ("06—27.10", "10.10") exist only inside the poster art, so Claude reads
// each poster (vision) for its title and dates. Everything else — price,
// schedule, description — comes from the fixed catalogue below, written from
// /cursos-e-workshops/ (courses run 4 weekly 3-hour evening sessions; one-off
// workshops are held "at varying times", so they get no start time).

interface Offer {
  match: RegExp; // against the poster title Claude reads
  title: string;
  kind: 'course' | 'workshop';
  price: string | null;
  start?: string; // courses: fixed evening slot
  end?: string;
  description: string;
  tags: string[];
}

// Order matters: the first match wins, so specific titles come before the
// generic "seri…" course.
const CATALOGUE: Offer[] = [
  {
    match: /monotip/i,
    title: 'Monotype Screenprinting Workshop',
    kind: 'workshop',
    price: null,
    description:
      'Screenprinting workshop on monotypes: paint and draw directly on the screen to pull unique, one-off prints instead of editions. Materials included.',
    tags: ['printmaking', 'screenprinting', 'monotype', 'workshop', 'porto'],
  },
  {
    match: /introdu[cç][aã]o [aà] serigrafia|stencil|intro.*screen/i,
    title: 'Introduction to Screenprinting Workshop',
    kind: 'workshop',
    price: '€45',
    description:
      'Three-hour introduction to hand-made screenprinting with cut stencils and colour overlays: prepare and clean a screen, print with a squeegee and take your one-off prints home. No experience needed; materials included.',
    tags: ['printmaking', 'screenprinting', 'workshop', 'porto'],
  },
  {
    match: /seri\s*ter|screenprinting course/i,
    title: 'SeriTerças — Screenprinting Course',
    kind: 'course',
    price: '€120 (4 sessions)',
    start: '18:00',
    end: '21:00',
    description:
      'Four Tuesday-evening sessions covering the full screenprinting process: hand-made and digital film positives, emulsion and exposure, registration, printing and cleaning. Level I participants leave with two numbered, signed editions of ten 35×50 cm prints in 2–3 colours; Level II continues with your own editions. All materials included.',
    tags: ['printmaking', 'screenprinting', 'course', 'porto'],
  },
  {
    match: /calco|etching|gravura em metal/i,
    title: 'CalcoQuartas — Etching Course',
    kind: 'course',
    price: '€140 (4 sessions)',
    start: '18:00',
    end: '21:00',
    description:
      'Four Wednesday-evening sessions in chalcography: preparing a zinc plate, drypoint, varnish drawing and acid etching with aquatint, through to printing a numbered, signed edition. All materials included.',
    tags: ['printmaking', 'etching', 'course', 'porto'],
  },
  {
    match: /lito/i,
    title: 'LitoQuintas — Lithography Course',
    kind: 'course',
    price: '€140 (4 sessions)',
    start: '18:00',
    end: '21:00',
    description:
      'Four Thursday-evening sessions in stone lithography: preparing the stone, drawing, etching, proofing and printing an edition of ten prints in one or two colours, signed and numbered. All materials included.',
    tags: ['printmaking', 'lithography', 'course', 'porto'],
  },
  {
    match: /lino/i,
    title: 'Linocut Workshop',
    kind: 'workshop',
    price: '€45',
    description:
      'Three-hour introduction to relief printing: design, carve and print a linoleum block, learning the gouges, rollers and hand-printing techniques. Take home an edition of five prints in one or two colours. No experience needed; materials included.',
    tags: ['printmaking', 'linocut', 'workshop', 'porto'],
  },
  {
    match: /tetrapak|polipropileno|polypropylene|pl[aá]stic/i,
    title: 'Tetrapak & Polypropylene Printmaking Workshop',
    kind: 'workshop',
    price: '€45',
    description:
      'Three-hour introduction to intaglio printmaking on everyday matrices: draw and scratch into recycled tetrapak and polypropylene with drypoint tools, ink them and print on an etching press. No experience needed; materials included.',
    tags: ['printmaking', 'drypoint', 'workshop', 'porto'],
  },
  {
    match: /japon|japanese/i,
    title: 'Japanese Bookbinding Workshop (with Alfaiate do Livro)',
    kind: 'workshop',
    price: '€60',
    description:
      'Four-hour introduction to Japanese stab binding with Catarina Azevedo of Alfaiate do Livro: learn the basic method and a more complex stitch pattern, then bind a notebook to take home. Bring your own papers and threads to personalise it if you like.',
    tags: ['bookbinding', 'workshop', 'porto'],
  },
  {
    match: /encaderna|bookbinding/i,
    title: 'Traditional Bookbinding Workshop (with Alfaiate do Livro)',
    kind: 'workshop',
    price: '€60',
    description:
      'Four-hour introduction to traditional bookbinding with Catarina Azevedo of Alfaiate do Livro: build a small hardcover pocket notebook from scratch to take home.',
    tags: ['bookbinding', 'workshop', 'porto'],
  },
];

const MONTH_ABBR: Record<string, number> = {
  JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
  JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12,
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Poster images on the calendar page, keyed by URL, with the month from the filename. */
function posters(html: string): { url: string; month: number }[] {
  const found = new Map<string, number>();
  for (const m of html.matchAll(/https?:\/\/[^"'\s]*?\/wp-content\/uploads\/\d{4}\/\d{2}\/([A-Z]{3})_[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)/g)) {
    const month = MONTH_ABBR[m[1]];
    // Normalise the Jetpack CDN (i0.wp.com/…) and query variants to one URL.
    const url = m[0].replace(/^https?:\/\/i\d\.wp\.com\//, 'https://');
    if (month && !found.has(url)) found.set(url, month);
  }
  return [...found].map(([url, month]) => ({ url, month }));
}

interface PosterReading {
  title: string;
  level: string | null;
  start: string; // "DD.MM"
  end: string | null;
}

// Posters already read (by filename), so each poster costs one Claude call at
// most — and the calendar keeps working if the API is unavailable. Add new
// readings here when a run logs one; unknown posters are read by Claude.
const KNOWN: Record<string, PosterReading> = {
  'OUT_seri.png': { title: 'SeriTerças', level: 'nível I', start: '06.10', end: '27.10' },
  'OUT_jap-2.png': { title: 'Encadernação Japonesa', level: null, start: '10.10', end: null },
  'OUT_tetra.png': { title: 'Gravura em Tetrapak + Polipropileno', level: null, start: '17.10', end: null },
  'OUT_lino.png': { title: 'Linogravura', level: null, start: '24.10', end: null },
  'NOV_seri.png': { title: 'SeriTerças', level: 'nível II', start: '03.11', end: '24.11' },
  'NOV_lito.png': { title: 'LitoQuintas', level: null, start: '05.11', end: '26.11' },
  'NOV_intro.png': { title: 'Introdução à Serigrafia', level: null, start: '14.11', end: null },
  'NOV_monotipia.png': { title: 'Monotipia em Serigrafia', level: null, start: '28.11', end: null },
};

async function readPoster(getClient: () => Anthropic, url: string): Promise<PosterReading | null> {
  const known = KNOWN[url.split('/').pop() ?? ''];
  if (known) return known;
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url } },
          {
            type: 'text',
            text: `This is a poster for a printmaking course or workshop at Oficina Mescla (Porto). Read ONLY the text printed on it.
Return a single JSON object, no markdown:
{"title": the big title text as printed (e.g. "SeriTerças", "Linogravura", "Encadernação Japonesa"),
 "level": the level if printed (e.g. "nível I", "nível II") or null,
 "start": the first date as "DD.MM",
 "end": the last date as "DD.MM" if a range is printed (e.g. "06—27.10" → start "06.10", end "27.10"), else null}`,
          },
        ],
      },
    ],
  });
  const text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return null;
  try {
    const r = JSON.parse(json) as PosterReading;
    return r.title && /^\d{1,2}\.\d{1,2}$/.test(r.start) ? r : null;
  } catch {
    return null;
  }
}

export async function run(): Promise<void> {
  const res = await fetch(AGENDA);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const list = posters(await res.text());
  if (list.length === 0) throw new Error('No calendar posters found (filename pattern changed?)');

  // Only constructed if a poster isn't in KNOWN (it needs ANTHROPIC_API_KEY).
  let client: Anthropic | null = null;
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const { url, month: fileMonth } of list) {
    let reading: PosterReading | null = null;
    try {
      reading = await readPoster(() => (client ??= new Anthropic()), url);
    } catch (err) {
      console.warn(`[Oficina Mescla] could not read ${url}:`, err instanceof Error ? err.message : err);
      continue;
    }
    if (!reading) {
      console.warn(`[Oficina Mescla] no title/date on poster ${url}, skipping`);
      continue;
    }
    const offer = CATALOGUE.find((o) => o.match.test(reading.title));
    if (!offer) {
      console.warn(`[Oficina Mescla] unknown offer "${reading.title}" (${url}), skipping`);
      continue;
    }

    // "DD.MM" → date; the year is the poster month's next occurrence (a month
    // more than ~2 months behind today is taken to be next year's).
    const toDate = (ddmm: string) => {
      const [d, m] = ddmm.split('.').map(Number);
      const month = m || fileMonth;
      const year = month < now.getUTCMonth() + 1 - 2 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
      return `${year}-${pad(month)}-${pad(d)}`;
    };
    const startDate = toDate(reading.start);
    const lastDate = reading.end ? toDate(reading.end) : null;
    if (startDate < today) continue; // upcoming only (no extract.ts guard here)

    const level = reading.level?.replace(/n[ií]vel/i, 'Level').trim() ?? null;
    const title = level ? `${offer.title}, ${level}` : offer.title;

    // A course is one event on its first session; the sessions are listed.
    let description = offer.description;
    if (offer.kind === 'course' && lastDate) {
      const sessions: string[] = [];
      for (let t = Date.parse(`${startDate}T12:00:00Z`); t <= Date.parse(`${lastDate}T12:00:00Z`); t += 7 * 86400000) {
        const d = new Date(t);
        sessions.push(`${d.getUTCDate()}/${d.getUTCMonth() + 1}`);
      }
      description = `${sessions.length} sessions: ${sessions.join(', ')}, ${offer.start}–${offer.end}. ${description}`;
    }
    if (level === 'Level II') description += ' Level II requires having completed Level I.';

    events.push({
      id: makeId(AGENDA, title, startDate),
      title,
      type: 'workshop',
      startDate,
      endDate: null,
      startTime: offer.start ?? null,
      endTime: offer.end ?? null,
      venue: 'Oficina Mescla',
      venueUrl: `${BASE}/`,
      city: 'Porto',
      country: 'Portugal',
      address: 'Pátio do Bolhão 90, Porto',
      organiserName: 'Oficina Mescla',
      organiserUrl: `${BASE}/`,
      description,
      imageUrl: url,
      ticketsUrl: COURSES,
      price: level === 'Level II' && offer.kind === 'course' ? null : offer.price,
      tags: offer.tags,
      sourceUrl: AGENDA,
      sourceName: 'Oficina Mescla',
      externalId: url.split('/').pop() ?? null,
      scrapedAt: new Date(),
    });
  }

  console.log(`[Oficina Mescla] ${events.length} upcoming course(s)/workshop(s) from ${list.length} poster(s)`);
  await upsertEvents(events);
}
