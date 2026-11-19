import Link from 'next/link';
import TrackedLink from '@/components/analytics/TrackedLink';
import type { ArtEvent } from '@/types';
import { MONTH_NAMES } from '@/lib/calendarUtils';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';
import { EVENT_TYPES } from '@/lib/eventTypes';
import s from './Home.module.css';

function placeLabel(e: ArtEvent): string {
  const parts = [e.city, e.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Virtual';
}

function Item({ event, position }: { event: ArtEvent; position: number }) {
  const slug = eventSlug(event);
  return (
    <TrackedLink
      href={`/events/${slug}`}
      event="editor_choice_click"
      params={{ item: slug, position }}
      className={s.item}
    >
      <div className={s.img}>
        {event.image && (
          // eslint-disable-next-line @next/next/no-img-element -- scraped remote images, as in EventCard
          <img src={event.image} alt={event.title} />
        )}
      </div>
      <div>
        <div className={s.meta}>
          <p>{placeLabel(event)}</p>
          <p>
            {formatDateShort(event.date)}
            {event.startTime && ` · ${event.startTime}`}
          </p>
        </div>
        <h3 className={s.title}>{event.title}</h3>
      </div>
    </TrackedLink>
  );
}

/** "Editor choice in November" (Figma "Home page" 411:2294): four equal event
 *  cards on a sand band, with links to the type hubs on the label row. The
 *  band is the target of the header's "This month's events" link. */
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

  return (
    <section id="this-month" aria-labelledby="editor-choice" className={s.band}>
      <div className={`${s.wrap} ${s.label}`}>
        <h2 id="editor-choice">
          {curated ? 'Editor choice' : 'Coming up'} in <Link href="/calendar">{MONTH_NAMES[month - 1]}</Link>
        </h2>
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

      <div className={`${s.wrap} ${s.grid}`}>
        {events.map((e, i) => (
          <Item key={e.id} event={e} position={i + 1} />
        ))}
      </div>
    </section>
  );
}
