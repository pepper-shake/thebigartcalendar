// Shared readers for organisers whose events live in Google Forms linked from a
// Linktree (macs.ts, lisbon-drawing-club.ts). Google Forms ships the whole form
// as JSON (FB_PUBLIC_LOAD_DATA_, same as ajuda-lab.ts); Linktree ships its links
// in __NEXT_DATA__.

export interface LinktreeLink {
  title?: string;
  url?: string;
  modifiers?: { thumbnailUrl?: string | null } | null;
}

export interface FormData {
  title: string;
  description: string;
  /** Other questions' titles + help text (some forms put details there). */
  details: string[];
  /** Options of a date-choice question, if the form has one — one per session. */
  dateOptions: string[];
}

const UA = { 'User-Agent': 'Mozilla/5.0' };

/** All Google Form links on a Linktree page. */
export async function linktreeFormLinks(linktreeUrl: string): Promise<LinktreeLink[]> {
  const res = await fetch(linktreeUrl, { headers: UA });
  if (!res.ok) throw new Error(`Linktree HTTP ${res.status}`);
  const m = (await res.text()).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Linktree __NEXT_DATA__ not found');
  const links: LinktreeLink[] = JSON.parse(m[1])?.props?.pageProps?.account?.links ?? [];
  return links.filter((l) => !!l.url && /docs\.google\.com\/forms|forms\.gle/i.test(l.url));
}

// A choice option that names a date: a month next to a day number, e.g.
// "Wednesday 11st November 19:00-21:30", "WORKSHOP 1 - October 24",
// "24 de outubro". (A bare month-like prefix is not enough: "apresentação".)
const MONTH = '(?:jan|feb|fev|mar|apr|abr|may|mai|jun|jul|aug|ago|sep|set|oct|out|nov|dec|dez)[a-zç]*';
const DATE_OPTION = new RegExp(
  `\\b\\d{1,2}(?:st|nd|rd|th|º)?\\s+(?:de\\s+)?${MONTH}(?![a-zà-ÿ])|(?<![a-zà-ÿ])${MONTH}\\s+\\d{1,2}\\b`,
  'i',
);

// FB_PUBLIC_LOAD_DATA_ layout: [, [description, questions[], …, title], …].
// Each question is [id, title, helpText, type, [[id, options[[label]…]]]].
export function parseForm(html: string): FormData | null {
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
    const options = (((q[4] as unknown[][] | undefined)?.[0]?.[1] as unknown[][] | undefined) ?? [])
      .map((o) => String(o[0]))
      .filter(Boolean);
    const isDateQuestion = /\bdate|data\b|session|sess[aã]o/i.test(title) || options.some((o) => DATE_OPTION.test(o));
    if (isDateQuestion && options.length) dateOptions = options;
  }
  return { title: form?.[8] ?? data?.[3] ?? '', description: form?.[0] ?? '', details, dateOptions };
}

export async function fetchForm(url: string): Promise<FormData | null> {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`Form HTTP ${res.status} (${url})`);
  return parseForm(await res.text());
}

/** Plain-text rendering of a form (optionally for one session) for extractEventsFromHtml. */
export function formText(form: FormData, url: string, imageUrl: string | null, date?: string): string {
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
