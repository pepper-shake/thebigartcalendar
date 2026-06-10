import Link from 'next/link';
import { ArtEvent } from '@/types';
import { eventSlug } from '@/lib/slug';
import { formatDateRange } from '@/lib/format';
import { typeMeta } from '@/lib/eventTypes';

// Brand card colors (mirrors EventCard) — picked deterministically per event.
const CARD_COLORS = ['#E06927', '#EFCEEE', '#C8CC17', '#BFDBD8'];
function cardColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

// Server-rendered grid of real <a> links to event pages — the crawlable path
// from city/type hubs to individual events.
export default function EventList({ events }: { events: ArtEvent[] }) {
  if (events.length === 0) {
    return (
      <p
        className="text-black/40"
        style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18 }}
      >
        No upcoming events here right now — check back soon.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => {
        const meta = typeMeta(e.type);
        return (
          <li key={e.id}>
            <Link href={`/events/${eventSlug(e)}`} className="group block h-full">
              <article
                className="flex h-full flex-col"
                style={{ backgroundColor: cardColor(e.id), borderRadius: 24, padding: 20, gap: 12 }}
              >
                <div
                  className="flex items-center justify-between text-black/60"
                  style={{ fontFamily: 'var(--font-oxygen)', fontSize: 13 }}
                >
                  <span>{meta.label}</span>
                  <time dateTime={e.date}>{formatDateRange(e)}</time>
                </div>

                <h2
                  className="text-black line-clamp-2"
                  style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontWeight: 600,
                    fontSize: 24,
                    lineHeight: '28px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {e.title}
                </h2>

                {e.image && (
                  <div className="overflow-hidden" style={{ borderRadius: 12, aspectRatio: '4 / 3' }}>
                    <img
                      src={e.image}
                      alt={e.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {(e.city || e.country) && (
                  <p
                    className="text-black/70"
                    style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 15 }}
                  >
                    {[e.city, e.country].filter(Boolean).join(', ')}
                  </p>
                )}

                <span
                  className="mt-auto inline-flex items-center gap-1 text-black group-hover:underline underline-offset-2"
                  style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 15 }}
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
