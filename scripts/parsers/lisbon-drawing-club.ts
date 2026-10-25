import { extractEventsFromHtml } from '../lib/extract';
import { makeId, upsertEvents } from '../lib/upsert';
import { fetchForm, formText, linktreeFormLinks } from '../lib/google-form';
import type { NewEvent } from '../../src/db/schema';

const LINKTREE = 'https://linktr.ee/lisbondrawingclub';
const ORGANISER = 'Lisbon Drawing Club';

// Lisbon Drawing Club is a life-drawing collective: numbered drawing sessions
// with a live model (~€6 suggested donation) plus occasional masterclasses,
// each at a different Lisbon venue. Its Linktree links every upcoming session
// to a Google Form whose description has the date, time, venue + address,
// model and theme ("Our next drawing session will happen on Monday October
// 26th 2026 at DOIS CORVOS Intendente [ Rua dos Anjos 16B … ] from 19h00 to
// 21h30"). Same Linktree → Google Forms → Claude pattern as macs.ts.

// Only the event forms: skip private bookings, open calls, the mailing list.
const EVENT = /drawing session|masterclass|master class|workshop/i;
const SKIP = /private|personali[sz]ed|open call|mailing/i;

// "DRAWING SESSION #187 | Registration / Inscrição" → "Drawing Session #187".
function cleanTitle(raw: string): string {
  const head = raw.split('|')[0].trim();
  if (head !== head.toUpperCase()) return head;
  return head.toLowerCase().replace(/(^|[\s(-])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase());
}

/** Fetch + extract without writing (also used for dry runs). */
export async function collect(): Promise<NewEvent[]> {
  const links = (await linktreeFormLinks(LINKTREE)).filter(
    (l) => EVENT.test(l.title ?? '') && !SKIP.test(l.title ?? ''),
  );
  console.log(`[${ORGANISER}] ${links.length} event form(s) on Linktree`);

  const context = { sourceName: ORGANISER, defaultCity: 'Lisbon', defaultCountry: 'Portugal' };

  const events: NewEvent[] = [];
  for (const link of links) {
    const url = link.url!.split('?')[0];
    const imageUrl = link.modifiers?.thumbnailUrl ?? null;
    const form = await fetchForm(link.url!);
    if (!form) {
      console.warn(`[${ORGANISER}] No form data in "${link.title}" — skipped`);
      continue;
    }

    // The form's own title keeps the dedup id stable (the LLM rewords titles).
    const title = cleanTitle(form.title || link.title || '');
    const pages = [{ url, imageUrl }];
    // One call per session option (a masterclass form lists each workshop day).
    for (const date of form.dateOptions.length ? form.dateOptions : [undefined]) {
      const found = await extractEventsFromHtml(formText(form, url, imageUrl, date), context, { pages });
      for (const e of found) {
        events.push({
          ...e,
          title: title || e.title,
          // A listed session is one day, even if the form text spans several.
          endDate: date ? null : e.endDate,
          organiserName: ORGANISER,
          organiserUrl: LINKTREE,
          id: makeId(e.sourceUrl, title || e.title, e.startDate),
        });
      }
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`[${ORGANISER}] ${events.length} upcoming event(s) found`);
  return events;
}

export async function run(): Promise<void> {
  await upsertEvents(await collect());
}
