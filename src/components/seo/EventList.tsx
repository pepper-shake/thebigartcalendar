import Link from 'next/link';
import { ArtEvent } from '@/types';
import { EventImage } from '@/components/events/EventImage';
import { eventSlug } from '@/lib/slug';
import { formatDateRange } from '@/lib/format';
import { typeMeta } from '@/lib/eventTypes';
import { getCardScheme } from '@/lib/eventColor';


// Server-rendered grid of real <a> links to event pages — the crawlable path
// from city/type hubs to individual events.
export default function EventList({ events }: { events: ArtEvent[] }) {
  if (events.length === 0) {
    return (
      <p
        className="text-ink/60 italic"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18 }}
      >
        No upcoming events here right now — check back soon.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => {
        const meta = typeMeta(e.type);
        const scheme = getCardScheme(e.id);
        return (
          <li key={e.id}>
            <Link href={`/events/${eventSlug(e)}`} className="group block h-full">
              <article
                className="flex h-full flex-col"
                style={{ backgroundColor: scheme.bg, color: scheme.fg, padding: 24, gap: 12 }}
              >
                <div
                  className="flex items-center justify-between opacity-80"
                  style={{ fontFamily: 'var(--font-meta)', fontSize: 14 }}
                >
                  <span>{meta.label}</span>
                  <time dateTime={e.date}>{formatDateRange(e)}</time>
                </div>

                <h2
                  className="line-clamp-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 300,
                    fontSize: 28,
                    lineHeight: '32px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {e.title}
                </h2>

                <div className="overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                  <EventImage
                    candidates={e.imageCandidates ?? []}
                    alt={e.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.015]"
                  />
                </div>

                {(e.city || e.country) && (
                  <p
                    className="opacity-80"
                    style={{ fontFamily: 'var(--font-meta)', fontSize: 15 }}
                  >
                    {[e.city, e.country].filter(Boolean).join(', ')}
                  </p>
                )}

                <span
                  className="mt-auto border-t border-current pt-3 inline-flex items-center gap-1 italic"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 20 }}
                >
                  View details
                </span>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
