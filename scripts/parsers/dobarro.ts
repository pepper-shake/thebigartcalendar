import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const BASE = 'https://dobarro.art';
const AGENDA = `${BASE}/agenda`;

// DoBarro is a ceramics & visual-arts studio in Porto. /agenda is a monthly
// table: "October Workshops / Oficinas de Outubro", then per workshop
//   PT TITLE / en title / 50€ [— pacote de 4 aulas] / <days> / <time> [/ <days> / <time>…]
// with days as day-of-month lists ("1, 12, 29" or "7, 14, 21 (Outubro), 4 (Novembro)")
// and times like "11h–14h" / "18h30–20h30". The page also keeps older months'
// tables further down with inconsistent labels, so only the FIRST block (the one
// headed "<Month> Workshops") is parsed. Deterministic, no LLM.

const IMG = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1200,fit=crop/YBgeXyjjz9H06Bbb';
const IMAGES = {
  ceramics: `${IMG}/whatsapp-image-2024-10-22-at-15.52.14-2-AMql0n3LE1Hon0Qv.jpeg`,
  visual: `${IMG}/whatsapp-image-2024-10-22-at-15.53.34-3-YbNqjalropuV8abP.jpeg`,
  printing: `${IMG}/dsc02322-AGBbq1akorfEl7lM.jpg`,
};

type Kind = keyof typeof IMAGES;

// Short descriptions in our own words, keyed by a pattern on the PT title.
const WORKSHOPS: [RegExp, Kind, string][] = [
  [/fundamentos/, 'ceramics', 'Four-session course in the fundamentals of hand-building with clay.'],
  [/explora[cç][aã]o criativa/, 'ceramics', 'Four-session course for people with some clay experience, exploring creative approaches and more advanced techniques.'],
  [/cer[aâ]mica livre/, 'ceramics', 'Open three-hour clay session with no set project: work on your own ideas and surfaces with guidance. All levels; materials and firing included.'],
  [/nerikomi/, 'ceramics', 'Nerikomi: the Japanese technique of layering coloured clays to build patterns into the body of a piece.'],
  [/azulejo/, 'ceramics', 'Design and paint a small four-tile mural, from sketch to transfer, taking cues from Porto\'s tiled façades and patterns.'],
  [/impress[aã]o em cer[aâ]mica/, 'ceramics', 'Bring drawing into clay: mark, print and transfer images onto the surface of your own ceramic piece. Materials and firing included.'],
  [/domingo|pinta a tua/, 'ceramics', 'A relaxed ceramics session at the studio.'],
  [/tetrapa/, 'printing', 'Printmaking with recycled milk cartons and a pasta machine as the press: make your own plate and pull prints. About two hours, everything included.'],
  [/lego/, 'printing', 'Build printing plates from LEGO bricks and print your designs on paper. About two hours; all levels, ages 6+.'],
  [/cianotipia/, 'printing', 'Cyanotype sun printing in deep blue on paper or fabric, using objects, drawings or plants. About two hours.'],
  [/pinhole/, 'printing', 'Pinhole photography: make pictures with a simple lens-less camera.'],
  [/acr[ií]lico/, 'visual', 'Open acrylic painting session.'],
  [/[aá]gua e cor/, 'visual', 'Watercolour painting, wet on wet.'],
  [/zine/, 'visual', 'Make your own zine, from idea to folded copy.'],
  [/banda desenhada|lata/, 'visual', 'Comics creation workshop.'],
  [/desenhar/, 'visual', 'Drawing sessions for adults who want to start (or restart) drawing.'],
];

const MONTHS: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const pad = (n: number) => String(n).padStart(2, '0');

function tokens(html: string): string[] {
  return html
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, '|')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .split('|')
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const TIME_RE = /^(\d{1,2})h(\d{2})?\s*[–-]\s*(\d{1,2})h(\d{2})?$/i;
const DAYS_RE = /^\d{1,2}(\s*\([^)]*\))?(\s*,\s*\d{1,2}(\s*\([^)]*\))?)*$/;
const PRICE_RE = /(\d+)\s*€/;
const isTitle = (t: string) => /[A-ZÀ-Ý]{3}/.test(t) && t === t.toUpperCase() && !/\d/.test(t);

// "7, 14, 21 (Outubro), 4 (Novembro)" → [[7,10],[14,10],[21,10],[4,11]]; an
// unqualified list takes the block's month.
function parseDays(t: string, defaultMonth: number): [number, number][] {
  const out: [number, number][] = [];
  let pending: number[] = [];
  for (const m of t.matchAll(/(\d{1,2})|\(([^)]+)\)/g)) {
    if (m[1]) pending.push(Number(m[1]));
    else {
      const month = MONTHS[fold(m[2].trim())] ?? defaultMonth;
      out.push(...pending.map((d) => [d, month] as [number, number]));
      pending = [];
    }
  }
  out.push(...pending.map((d) => [d, defaultMonth] as [number, number]));
  return out;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sp: string, c: string) => sp + c.toUpperCase())
    .replace(/\b(Em|De|Da|Do|Com|E|A|Ao|Of|And|The|On)\b/g, (w, _o, i) => (i === 0 ? w : w.toLowerCase()));
}

interface Session {
  pt: string;
  en: string;
  price: string | null;
  isPackage: boolean;
  dates: { date: string; start: string; end: string }[];
}

export async function run(): Promise<void> {
  const res = await fetch(AGENDA);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const tk = tokens(await res.text());

  // First "<Month> Workshops" heading = the current month's table.
  const head = tk.findIndex((t) => /^([A-Za-z]+) Workshops$/.test(t) && MONTHS[fold(t.split(' ')[0])]);
  if (head < 0) throw new Error('No "<Month> Workshops" heading found');
  const blockMonth = MONTHS[fold(tk[head].split(' ')[0])];
  // The table ends at the category links ("Cerâmica / Ceramics / …").
  const end = tk.findIndex((t, i) => i > head && t === 'Cerâmica' && tk[i + 1] === 'Ceramics');
  const block = tk.slice(head + 1, end > 0 ? end : undefined);

  // Year for the block's month: this year, or next year if it's well in the past.
  const now = new Date();
  const thisYear = now.getUTCFullYear();
  const blockYear = blockMonth < now.getUTCMonth() + 1 - 2 ? thisYear + 1 : thisYear;
  const yearFor = (month: number) => (month < blockMonth ? blockYear + 1 : blockYear);

  const workshops: Session[] = [];
  let cur: Session | null = null;
  let pendingDays: [number, number][] | null = null;
  let pendingTime: [string, string] | null = null;

  const emit = (days: [number, number][], [start, endT]: [string, string]) => {
    for (const [d, m] of days) cur?.dates.push({ date: `${yearFor(m)}-${pad(m)}-${pad(d)}`, start, end: endT });
  };

  for (let i = 0; i < block.length; i++) {
    const t = block[i];
    if (/^Oficinas de /i.test(t)) continue;
    if (isTitle(t) && !PRICE_RE.test(t)) {
      cur = { pt: t, en: block[i + 1] ?? t, price: null, isPackage: false, dates: [] };
      workshops.push(cur);
      pendingDays = pendingTime = null;
      i++; // skip the English subtitle
      continue;
    }
    if (!cur) continue;
    const price = t.match(PRICE_RE);
    if (price && cur.price === null) {
      cur.price = `€${price[1]}`;
      cur.isPackage = /pacote|aulas/i.test(t);
      continue;
    }
    const time = t.match(TIME_RE);
    if (time) {
      const hhmm: [string, string] = [`${pad(+time[1])}:${time[2] ?? '00'}`, `${pad(+time[3])}:${time[4] ?? '00'}`];
      if (pendingDays) { emit(pendingDays, hhmm); pendingDays = null; } else pendingTime = hhmm;
      continue;
    }
    if (DAYS_RE.test(t)) {
      const days = parseDays(t, blockMonth);
      if (pendingTime) { emit(days, pendingTime); pendingTime = null; } else pendingDays = days;
    }
  }

  const today = now.toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const w of workshops) {
    if (w.dates.length === 0) continue;
    const key = fold(w.pt);
    const known = WORKSHOPS.find(([re]) => re.test(key));
    const kind: Kind = known?.[1] ?? (/ceram|nerikomi|azulejo|barro/.test(key) ? 'ceramics' : 'visual');
    const en = titleCase(w.en);
    const pt = titleCase(w.pt);
    const title = fold(en) === fold(pt) ? en : `${en} (${pt})`;
    const base = known?.[2] ?? `${en} workshop.`;
    const studio = 'At DoBarro, a ceramics and visual-arts studio in Porto.';

    // A course package is one event on its first session; single workshops are
    // one event per session.
    const sessions = [...w.dates].sort((a, b) => a.date.localeCompare(b.date));
    const list = w.isPackage ? [sessions[0]] : sessions;
    const sessionNote = w.isPackage
      ? ` Sessions: ${sessions.map((s) => s.date.slice(5).split('-').reverse().join('/')).join(', ')}, ${sessions[0].start}–${sessions[0].end}.`
      : '';

    for (const s of list) {
      if (s.date < today) continue; // upcoming only (no extract.ts guard here)
      events.push({
        id: makeId(AGENDA, title, `${s.date} ${s.start}`),
        title,
        type: 'workshop',
        startDate: s.date,
        endDate: null,
        startTime: s.start,
        endTime: s.end,
        venue: 'DoBarro',
        venueUrl: `${BASE}/`,
        city: 'Porto',
        country: 'Portugal',
        address: 'Rua da Alegria 246, Porto',
        organiserName: 'DoBarro',
        organiserUrl: `${BASE}/`,
        description: `${base}${sessionNote} ${studio}`,
        imageUrl: IMAGES[kind],
        ticketsUrl: AGENDA,
        price: w.isPackage && w.price ? `${w.price} (4 sessions)` : w.price,
        tags: ['workshop', 'porto', kind === 'ceramics' ? 'ceramics' : kind === 'printing' ? 'printmaking' : 'drawing-painting'],
        sourceUrl: AGENDA,
        sourceName: 'DoBarro',
        externalId: null,
        scrapedAt: new Date(),
      });
    }
  }

  console.log(`[DoBarro] ${events.length} upcoming session(s) from the ${tk[head]} agenda`);
  await upsertEvents(events);
}
