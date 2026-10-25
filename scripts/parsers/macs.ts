import { extractEventsFromHtml } from '../lib/extract';
import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const LINKTREE = 'https://linktr.ee/macs_pt';

// MACS is an artist-run space (associação artística e cultural) in Porto. It has
// no website: its Linktree links each event to a Google Form, and the form is
// the only place with the details — title + description in the header, and for
// multi-session workshops a "Workshop date" choice question listing each
// session ("Wednesday 11st November 19:00-21:30"). Google Forms ships all of it
// as JSON (FB_PUBLIC_LOAD_DATA_, same as ajuda-lab.ts). Forms are free text
// written differently each time, so Claude reads them.
//
// One LLM call per date option: extract.ts merges same-title dates into one
// date range (right for exhibitions), but these are separate sessions.

// Linktree links that are not dated events: rolling studio-time packages, an
// open call for workshop proposals, the newsletter.
const SKIP = /cowork|organi[sz]e your own|newsletter/i;

interface LinktreeLink {
  title?: string;
  url?: string;
  modifiers?: { thumbnailUrl?: string | null } | null;
}

interface FormData {
  title: string;
  description: string;
  /** Other questions' titles + help text (some forms put details there). */
  details: string[];
  /** Options of a date-choice question, if the form has one. */
  dateOptions: string[];
}

function linktreeLinks(html: string): LinktreeLink[] {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Linktree __NEXT_DATA__ not found');
  const links: LinktreeLink[] = JSON.parse(m[1])?.props?.pageProps?.account?.links ?? [];
  return links.filter(
    (l) => !!l.url && /docs\.google\.com\/forms|forms\.gle/i.test(l.url) && !SKIP.test(l.title ?? ''),
  );
}

// FB_PUBLIC_LOAD_DATA_ layout: [, [description, questions[], …, title], …].
// Each question is [id, title, helpText, type, [[id, options[[label]…]]]].
function parseForm(html: string): FormData | null {
  const m = html.match(/FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);<\/script>/);
  if (!m) return null;
  const data = JSON.parse(m[1]);
  const form = data?.[1];
  const questions: unknown[][] = form?.[1] ?? [];
  const details: string[] = [];
  let dateOptions: string[] = [];
  for (const q of questions) {
    const title = typeof q[1] === 'string' ? q[1] : '';
    const help = typeof q[2] === 'string' ? q[2] : '';
    if (title || help) details.push([title, help].filter(Boolean).join(' — '));
    const options = ((q[4] as unknown[][] | undefined)?.[0]?.[1] as unknown[][] | undefined) ?? [];
    if (/\bdate|data\b|session|sess[aã]o/i.test(title) && options.length) {
      dateOptions = options.map((o) => String(o[0])).filter(Boolean);
    }
  }
  return { title: form?.[8] ?? data?.[3] ?? '', description: form?.[0] ?? '', details, dateOptions };
}

function formText(form: FormData, url: string, imageUrl: string | null, date?: string): string {
  return [
    `[URL: ${url}]`,
    imageUrl ? `[IMAGE: ${imageUrl}]` : '',
    `Title: ${form.title}`,
    date ? `Session date: ${date}` : '',
    form.description,
    ...form.details,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Fetch + extract without writing (also used for dry runs). */
export async function collect(): Promise<NewEvent[]> {
  const res = await fetch(LINKTREE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Linktree HTTP ${res.status}`);
  const links = linktreeLinks(await res.text());
  console.log(`[MACS] ${links.length} event form(s) on Linktree`);

  const context = {
    sourceName: 'MACS',
    defaultVenue: 'MACS',
    defaultCity: 'Porto',
    defaultCountry: 'Portugal',
    defaultAddress: 'Rua da Boavista 84, 4050-112 Porto',
  };

  const events: NewEvent[] = [];
  for (const link of links) {
    // forms.gle short links redirect to the form; keep the link as given.
    const url = link.url!.split('?')[0];
    const imageUrl = link.modifiers?.thumbnailUrl ?? null;
    const formRes = await fetch(link.url!, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!formRes.ok) throw new Error(`Form "${link.title}" HTTP ${formRes.status}`);
    const form = parseForm(await formRes.text());
    if (!form) {
      console.warn(`[MACS] No form data in "${link.title}" — skipped`);
      continue;
    }

    const pages = [{ url, imageUrl }];
    for (const date of form.dateOptions.length ? form.dateOptions : [undefined]) {
      const found = await extractEventsFromHtml(formText(form, url, imageUrl, date), context, { pages });
      for (const e of found) {
        // Keep the form's own title (the LLM rewords it run to run, and the
        // dedup id is built from it). Everything happens at MACS's address,
        // even when the form names the guest artist's studio.
        const title = form.title || e.title;
        events.push({ ...e, title, venue: 'MACS', id: makeId(e.sourceUrl, title, e.startDate) });
      }
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`[MACS] ${events.length} upcoming event(s) found`);
  return events;
}

export async function run(): Promise<void> {
  await upsertEvents(await collect());
}
