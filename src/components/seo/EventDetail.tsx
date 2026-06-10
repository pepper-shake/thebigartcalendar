import Link from 'next/link';
import { ArtEvent } from '@/types';
import { EventTypeBadge } from '@/components/calendar/EventTypeBadge';
import { typeMeta } from '@/lib/eventTypes';
import { citySlug } from '@/lib/slug';
import { formatDateRange, formatTimeRange } from '@/lib/format';

// Full server-rendered event page body: semantic <h1>, meta, description, and
// internal links to the event's city + type hubs. This is the indexable content
// behind the Event JSON-LD.
export default function EventDetail({ event }: { event: ArtEvent }) {
  const meta = typeMeta(event.type);
  const time = formatTimeRange(event);

  return (
    <article>
      {event.image && (
        <div className="overflow-hidden mb-8" style={{ borderRadius: 20, aspectRatio: '16 / 9' }}>
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-4">
        <Link href={`/${meta.slug}`} aria-label={`Browse ${meta.plural}`}>
          <EventTypeBadge type={event.type} size="md" />
        </Link>
      </div>

      <h1
        className="text-black"
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontWeight: 800,
          fontSize: 'clamp(34px, 5vw, 56px)',
          lineHeight: 1,
          letterSpacing: '-1.5px',
        }}
      >
        {event.title}
      </h1>

      <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <Meta label="Date">{formatDateRange(event)}</Meta>
        {time && <Meta label="Time">{time}</Meta>}
        {event.venue && <Meta label="Venue">{event.venue}</Meta>}
        {(event.city || event.country) && (
          <Meta label="Location">
            {event.city ? (
              <Link
                href={`/cities/${citySlug(event.city)}`}
                className="underline underline-offset-2 hover:text-black"
              >
                {event.city}
              </Link>
            ) : null}
            {event.country ? `${event.city ? ', ' : ''}${event.country}` : ''}
          </Meta>
        )}
        {event.price && <Meta label="Price">{event.price}</Meta>}
      </dl>

      {event.description && (
        <div className="mt-10">
          <SectionTitle>About</SectionTitle>
          <p
            className="text-black/80 whitespace-pre-line"
            style={{
              fontFamily: 'var(--font-oxygen)',
              fontWeight: 300,
              fontSize: 18,
              lineHeight: '28px',
            }}
          >
            {event.description}
          </p>
        </div>
      )}

      {event.tags && event.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {event.tags.map((t) => (
            <span
              key={t}
              className="text-black/50 bg-black/5 rounded-full px-3 py-1"
              style={{ fontFamily: 'var(--font-oxygen)', fontSize: 13 }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {event.ticketsUrl && event.ticketsUrl !== '#' && (
        <div className="mt-10">
          <a
            href={event.ticketsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white rounded-full px-6 py-3 hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 16 }}
          >
            Get tickets
          </a>
        </div>
      )}

      <nav
        className="mt-12 pt-6 border-t border-black/10 flex flex-wrap gap-x-6 gap-y-2 text-black/60"
        style={{ fontFamily: 'var(--font-oxygen)', fontSize: 15 }}
      >
        <Link href={`/${meta.slug}`} className="hover:text-black hover:underline">
          More {meta.plural.toLowerCase()}
        </Link>
        {event.city && (
          <Link
            href={`/cities/${citySlug(event.city)}`}
            className="hover:text-black hover:underline"
          >
            More events in {event.city}
          </Link>
        )}
        <Link href="/" className="hover:text-black hover:underline">
          Browse the calendar
        </Link>
      </nav>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-black/40" style={{ fontFamily: 'var(--font-oxygen)', fontSize: 13 }}>
        {label}
      </dt>
      <dd
        className="text-black/90 mt-0.5"
        style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 17 }}
      >
        {children}
      </dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest text-black/40 mb-3"
      style={{ fontFamily: 'var(--font-host-grotesk)' }}
    >
      {children}
    </h2>
  );
}
