import { getCurrentEvents, listActiveTypes, listCities } from '@/lib/events';
import { listPlaces, categoryLabel } from '@/lib/places';
import { EVENT_TYPES } from '@/lib/eventTypes';
import { eventSlug } from '@/lib/slug';
import { formatDateRange } from '@/lib/format';
import { absoluteUrl, REGION, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

// /llms.txt — a plain-Markdown map of the site for AI assistants and LLM
// crawlers (https://llmstxt.org). Built from the same curation-safe, flag-aware
// selectors as the pages, so it only lists what's actually visible.
export const dynamic = 'force-dynamic';

const MAX_EVENTS = 100;

export async function GET() {
  const [events, cities, places, activeTypes] = await Promise.all([
    getCurrentEvents(),
    listCities(),
    listPlaces(),
    listActiveTypes(),
  ]);

  // Recurring sessions (same title at the same venue) collapse to their next
  // date + a count, so a daily workshop doesn't flood the list.
  const groups = new Map<string, { e: (typeof events)[number]; more: number }>();
  for (const e of events) {
    const key = `${e.title}|${e.venue}|${e.city}`;
    const g = groups.get(key);
    if (g) g.more++;
    else groups.set(key, { e, more: 0 });
  }
  const upcoming = [...groups.values()];

  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} is a free calendar of art events in ${REGION}: workshops, exhibitions, performances and more, collected daily from venues' own websites. Each event page lists the date, time, venue, price and a link to book with the organiser. Event and place pages include schema.org JSON-LD.`,
    '',
    '## Browse',
    `- [Calendar](${absoluteUrl('/')}): all upcoming events by date`,
    ...EVENT_TYPES.filter((t) => activeTypes.includes(t.type)).map(
      (t) => `- [${t.plural}](${absoluteUrl(`/${t.slug}`)}): ${t.blurb}`,
    ),
    `- [Cities](${absoluteUrl('/cities')}): events by city`,
    ...cities.map((c) => `  - [${c.name}](${absoluteUrl(`/cities/${c.slug}`)}): ${c.count} upcoming event(s)`),
    `- [Places](${absoluteUrl('/places')}): galleries, studios and workshop spaces`,
    '',
    '## Places',
    ...places.map(({ place, upcomingCount }) => {
      const where = [place.city, place.country].filter(Boolean).join(', ');
      const count = upcomingCount ? `, ${upcomingCount} upcoming event(s)` : '';
      return `- [${place.name}](${absoluteUrl(`/places/${place.slug}`)}): ${categoryLabel(place.category)}, ${where}${count}`;
    }),
    '',
    '## Upcoming events',
    ...upcoming.slice(0, MAX_EVENTS).map(({ e, more }) => {
      const where = [e.venue, e.city].filter(Boolean).join(', ');
      const time = e.startTime ? ` ${e.startTime}` : '';
      const price = e.price ? ` · ${e.price}` : '';
      const repeats = more ? ` (+${more} more date${more === 1 ? '' : 's'})` : '';
      return `- [${e.title}](${absoluteUrl(`/events/${eventSlug(e)}`)}): ${formatDateRange(e)}${time}${repeats} · ${where}${price}`;
    }),
    ...(upcoming.length > MAX_EVENTS
      ? ['', `More events: ${absoluteUrl('/')} and ${absoluteUrl('/sitemap.xml')}`]
      : []),
    '',
    '## More',
    `- [About](${absoluteUrl('/about')})`,
    `- [Sitemap](${absoluteUrl('/sitemap.xml')})`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
