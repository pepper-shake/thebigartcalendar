import Anthropic from '@anthropic-ai/sdk';
import { makeId, upsertEvents } from '../lib/upsert';
import type { NewEvent } from '../../src/db/schema';

const SITE = 'https://peanut-blu.carrd.co';
const INSTAGRAM = 'https://www.instagram.com/peanut.blu/';

// Peanut Blu is an arts & crafts studio in Lisbon (walk-ins + weekly
// workshops: mosaic, resin, embroidery, "& Sip" evenings…). Its Carrd site
// posts each month's programme only as a calendar image, captioned/alt-texted
// "October Schedule" etc. Claude reads the workshops off that image (vision,
// like oficina-mescla.ts); walk-in hours are skipped. Booking is by Instagram DM.

// Workshop photos on the site, alt-texted by craft. A workshop whose title
// shares a word with one of these gets that photo; otherwise the calendar.
interface SiteImage {
  url: string;
  alt: string;
}

interface Reading {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
}

function siteImages(html: string): SiteImage[] {
  return [...html.matchAll(/<img src="(assets\/images\/[^"?]+)[^"]*" alt="([^"]*)"/g)].map((m) => ({
    url: `${SITE}/${m[1]}`,
    alt: m[2],
  }));
}

async function readSchedule(client: Anthropic, url: string, label: string): Promise<Reading[]> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url } },
          {
            type: 'text',
            text: `This is the "${label}" calendar of Peanut Blu, an arts & crafts studio. List every WORKSHOP on it (the named sessions such as "Mosaic Coaster" or "Collage & Sip"). Skip "Walk-ins" and closed days.
The year is printed on the calendar. Days from the neighbouring month (e.g. a "1" in the last row) belong to that month.
Return ONLY a JSON array, no markdown, one object per workshop session:
[{"title": the workshop name as printed, on one line (e.g. "Eco Resin Tray"),
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM" 24-hour or null,
  "endTime": "HH:MM" 24-hour or null}]`,
          },
        ],
      },
    ],
  });
  const text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const json = text.match(/\[[\s\S]*\]/)?.[0];
  if (!json) return [];
  const parsed = JSON.parse(json) as Reading[];
  return parsed.filter((r) => r.title && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}

function imageFor(title: string, photos: SiteImage[], fallback: string): string {
  const words = new Set(title.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  const hit = photos.find((p) => (p.alt.toLowerCase().match(/[a-z]{4,}/g) ?? []).some((w) => words.has(w)));
  return hit?.url ?? fallback;
}

/** Fetch + read without writing (also used for dry runs). */
export async function collect(): Promise<NewEvent[]> {
  const res = await fetch(SITE);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const images = siteImages(await res.text());
  const schedules = images.filter((i) => /\bschedule\b/i.test(i.alt));
  if (schedules.length === 0) throw new Error('No "<Month> Schedule" image found (site layout changed?)');
  const photos = images.filter((i) => i.alt && !schedules.includes(i));

  const client = new Anthropic();
  const today = new Date().toISOString().split('T')[0];
  const events: NewEvent[] = [];

  for (const schedule of schedules) {
    const readings = await readSchedule(client, schedule.url, schedule.alt);
    for (const r of readings) {
      if (r.date < today) continue; // upcoming only (no extract.ts guard here)
      events.push({
        // Keyed on date + start time, not the title: one workshop per slot, and
        // the vision reading of a title can vary run to run ("&" vs "and").
        id: makeId(SITE, `slot ${r.startTime ?? ''}`, r.date),
        title: r.title,
        type: 'workshop',
        startDate: r.date,
        endDate: null,
        startTime: r.startTime,
        endTime: r.endTime,
        venue: 'Peanut Blu',
        venueUrl: SITE,
        city: 'Lisbon',
        country: 'Portugal',
        address: 'Rua Marcos Portugal 18A, Lisboa (enter through Wel Well Cafe)',
        organiserName: 'Peanut Blu',
        organiserUrl: SITE,
        description:
          'A 1.5–2 hour hands-on craft workshop at Peanut Blu, a Lisbon arts & crafts studio made for adults who want to try something new. All materials provided. Book by sending a DM on Instagram @peanut.blu.',
        imageUrl: imageFor(r.title, photos, schedule.url),
        ticketsUrl: INSTAGRAM,
        price: null,
        tags: ['workshop', 'crafts', 'lisbon'],
        sourceUrl: SITE,
        sourceName: 'Peanut Blu',
        externalId: null,
        scrapedAt: new Date(),
      });
    }
  }

  console.log(`[Peanut Blu] ${events.length} upcoming workshop(s) from ${schedules.length} schedule image(s)`);
  return events;
}

export async function run(): Promise<void> {
  await upsertEvents(await collect());
}
