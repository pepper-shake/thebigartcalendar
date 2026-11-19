import { extractEventsFromHtml } from '../lib/extract';
import { makeId, upsertEvents } from '../lib/upsert';
import { fetchForm, formText, linktreeFormLinks } from '../lib/google-form';
import type { NewEvent } from '../../src/db/schema';

const LINKTREE = 'https://linktr.ee/macs_pt';

// MACS is an artist-run space (associação artística e cultural) in Porto. It has
// no website: its Linktree links each event to a Google Form, and the form is
// the only place with the details — title + description in the header, and for
// multi-session workshops a "Workshop date" choice question listing each
// session ("Wednesday 11st November 19:00-21:30"). Google Forms ships all of it
// as JSON (FB_PUBLIC_LOAD_DATA_, same as ajuda-lab.ts). Forms are free text
// written differently each time, so Claude reads them. Readers: lib/google-form.ts.
//
// One LLM call per date option: extract.ts merges same-title dates into one
// date range (right for exhibitions), but these are separate sessions.

// Linktree links that are not dated events: rolling studio-time packages, an
// open call for workshop proposals, the newsletter.
const SKIP = /cowork|organi[sz]e your own|newsletter/i;

/** Fetch + extract without writing (also used for dry runs). */
export async function collect(): Promise<NewEvent[]> {
  const links = (await linktreeFormLinks(LINKTREE)).filter((l) => !SKIP.test(l.title ?? ''));
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
    const form = await fetchForm(link.url!);
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
        events.push({
          ...e,
          title,
          venue: 'MACS',
          endDate: date ? null : e.endDate, // a listed session is one day
          id: makeId(e.sourceUrl, title, e.startDate),
        });
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
