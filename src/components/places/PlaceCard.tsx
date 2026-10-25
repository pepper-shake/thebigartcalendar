import Link from 'next/link';
import { type Place } from '@/db/schema';
import { EventImage } from '@/components/events/EventImage';
import { categoryLabel, PLACE_COLOR } from '@/lib/places';
import { SITE_DEFAULT_IMAGE } from '@/lib/organiser-images';

// Server-rendered card linking to a place page — the crawlable path from
// /places to each /places/<slug>. Layout mirrors the event cards, but in one
// neutral colour (PLACE_COLOR) rather than per-id colours.
export default function PlaceCard({ place, upcomingCount }: { place: Place; upcomingCount: number }) {
  return (
    <Link href={`/places/${place.slug}`} className="group block h-full">
      <article
        className="flex h-full flex-col"
        style={{ backgroundColor: PLACE_COLOR, padding: 24, gap: 12 }}
      >
        <div
          className="flex items-center justify-between text-ink/60"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 13 }}
        >
          <span>{categoryLabel(place.category)}</span>
          {upcomingCount > 0 && (
            <span>
              {upcomingCount} upcoming event{upcomingCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <h2
          className="text-ink line-clamp-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 24,
            lineHeight: '28px',
            letterSpacing: '-0.02em',
          }}
        >
          {place.name}
        </h2>

        <div className="overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
          <EventImage
            candidates={[place.imageUrl, SITE_DEFAULT_IMAGE].filter((u): u is string => !!u)}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {(place.city || place.country) && (
          <p
            className="text-ink/70"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 15 }}
          >
            {[place.city, place.country].filter(Boolean).join(', ')}
          </p>
        )}

        <span
          className="mt-auto inline-flex items-center gap-1 text-ink group-hover:underline underline-offset-2"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 15 }}
        >
          View place
        </span>
      </article>
    </Link>
  );
}
