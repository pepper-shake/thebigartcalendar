import Link from 'next/link';
import TrackedLink from '@/components/analytics/TrackedLink';
import type { ArtEvent } from '@/types';
import { CARD_SCHEMES } from '@/lib/eventColor';
import { MONTH_NAMES } from '@/lib/calendarUtils';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';
import { EVENT_TYPES } from '@/lib/eventTypes';
import ViewerLocalTime from '@/components/events/ViewerLocalTime';
import s from './Home.module.css';

// Figma "Home page": the olive card scheme's background with the footer's
// off-white text; everything inside the band takes that one foreground.
const OLIVE = { bg: CARD_SCHEMES[4].bg, fg: '#FFFEF9' };

function placeLabel(e: ArtEvent): string {
  const parts = [e.city, e.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Virtual';
}

function Item({ event, lead, position }: { event: ArtEvent; lead: boolean; position: number }) {
  const slug = eventSlug(event);
  return (
    <TrackedLink
      href={`/events/${slug}`}
      event="editor_choice_click"
      params={{ item: slug, position }}
      className={s.item}
    >
      {/* The band sits just below the intro, so its images load straight away. */}
      <div className={s.img}>
        {event.image && (
          // eslint-disable-next-line @next/next/no-img-element -- scraped remote images, as in EventCard
          <img src={event.image} alt={event.title} />
        )}
      </div>
      {/* The lead card has the width for place, date and time on one line;
          small cards break before the time. */}
      <div className={s.meta}>
        <p>
          {placeLabel(event)} · {formatDateShort(event.date)}
          {lead && event.startTime && ' · '}
        </p>
        {event.startTime && (
          <p>
            {event.startTime}
            {event.city ? ` ${event.city}` : ''}
            <ViewerLocalTime event={event} />
          </p>
        )}
      </div>
      <h3 className={s.title}>{event.title}</h3>
      {lead && event.description && <p className={`${s.excerpt} line-clamp-4`}>{event.description}</p>}
    </TrackedLink>
  );
}

/** "Editor choice in November": a large event card and up to four small ones
 *  on an olive band (Myoan's "Editor's Choice" grid), with links to the type
 *  hubs on the label row. */
export default function EditorChoice({
  events,
  curated,
  month,
  activeTypes,
}: {
  events: ArtEvent[];
  curated: boolean;
  /** 1–12 */
  month: number;
  activeTypes: string[];
}) {
  if (!events.length) return null;
  const hubs = EVENT_TYPES.filter((t) => activeTypes.includes(t.type));
  const label = `${curated ? 'Editor choice' : 'Coming up'} in ${MONTH_NAMES[month - 1]}`;

  return (
    <section aria-labelledby="editor-choice">
      <div className={`${s.wrap} ${s.label}`}>
        <h2 id="editor-choice">{label}</h2>
        {hubs.length > 0 && (
          <nav aria-label="Event types" className={s.tags}>
            {hubs.map((t) => (
              <Link key={t.slug} href={`/${t.slug}`}>
                #{t.slug}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className={s.band} style={{ backgroundColor: OLIVE.bg, color: OLIVE.fg }}>
        <div className={`${s.wrap} ${s.grid}`}>
          {events.map((e, i) => (
            <Item key={e.id} event={e} lead={i === 0} position={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
