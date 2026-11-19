import Link from 'next/link';
import { type Place, type OpeningHours } from '@/db/schema';
import { EventImage } from '@/components/events/EventImage';
import { categoryLabel } from '@/lib/places';
import { citySlug } from '@/lib/slug';
import { SITE_DEFAULT_IMAGE } from '@/lib/organiser-images';

// Server-rendered place panel (Figma "Place page" 416:3856): a cream panel with
// title, italic meta lines and description in oxblood on the left, the website
// pinned to the bottom, and a tall image on the right (image first, stacked,
// on mobile).

const PANEL_BG = '#fbfaf6';
const MUTED = '#909090';
const OXBLOOD = '#5A1F2E';

// Figma 416:3860: Newsreader Italic 22, 18px apart.
const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 400,
  fontStyle: 'italic',
  fontSize: 22,
  lineHeight: '26px',
};

// Description, hours and links: Geist Light 22/38 (Figma 416:3863).
const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 300,
  fontSize: 22,
  lineHeight: '38px',
};

const DAYS: [keyof OpeningHours, string][] = [
  ['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'],
  ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun'],
];

function mapUrl(place: Place): string | null {
  if (place.lat != null && place.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  }
  const q = [place.name, place.address, place.city, place.country].filter(Boolean).join(', ');
  return place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

function Hours({ hours }: { hours: OpeningHours }) {
  const hasDays = DAYS.some(([d]) => hours[d]);
  return (
    <div style={{ color: OXBLOOD, fontFamily: 'var(--font-meta)', fontWeight: 300, fontSize: 16, lineHeight: '24px' }}>
      <h2 className="mb-2" style={{ ...metaStyle, color: MUTED }}>
        Opening hours
      </h2>
      {hasDays && (
        <dl className="grid grid-cols-[4rem_1fr] gap-y-1">
          {DAYS.map(([d, label]) => (
            <div key={d} className="contents">
              <dt style={{ color: MUTED }}>{label}</dt>
              <dd>{hours[d] ?? 'Closed'}</dd>
            </div>
          ))}
        </dl>
      )}
      {hours.note && <p className={hasDays ? 'mt-3' : undefined}>{hours.note}</p>}
    </div>
  );
}

export default function PlaceDetail({ place }: { place: Place }) {
  const map = mapUrl(place);

  const links = [
    place.websiteUrl && { label: place.websiteUrl, href: place.websiteUrl },
    !place.address && map && { label: 'Map', href: map },
  ].filter((l): l is { label: string; href: string } => !!l);

  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-stretch lg:gap-8"
      style={{ backgroundColor: PANEL_BG }}
    >
      {/* On mobile the image leads; on desktop it's the fixed right column. */}
      <div className="aspect-[568/630] w-full overflow-hidden lg:order-2 lg:aspect-auto lg:h-[630px] lg:w-[568px] lg:shrink-0">
        <EventImage
          candidates={[place.imageUrl, SITE_DEFAULT_IMAGE].filter((u): u is string => !!u)}
          alt={place.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-8 lg:order-1 lg:px-6 lg:py-[42px]">
        <div className="flex flex-col gap-8">
          {/* Figma 416:3859: Newsreader Regular 52/42, -1.04px. */}
          <h1
            className="text-[40px] leading-[40px] lg:text-[52px] lg:leading-[42px]"
            style={{ color: OXBLOOD, fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            {place.name}
          </h1>

          <div className="flex flex-col" style={{ gap: 10 }}>
            {place.address && (
              <p style={{ ...metaStyle, color: MUTED }}>
                {map ? (
                  <a href={map} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
                    {place.address}
                  </a>
                ) : (
                  place.address
                )}
              </p>
            )}
            <p style={{ ...metaStyle, color: OXBLOOD }}>
              {categoryLabel(place.category)}
              {place.city && (
                <>
                  {' · '}
                  <Link href={`/cities/${citySlug(place.city)}`} className="underline underline-offset-2">
                    {place.city}
                  </Link>
                </>
              )}
              {place.country ? `, ${place.country}` : ''}
            </p>
          </div>

          {place.description && (
            <p className="whitespace-pre-line" style={{ ...bodyStyle, color: OXBLOOD }}>
              {place.description}
            </p>
          )}

          {place.openingHours && <Hours hours={place.openingHours} />}
        </div>

        {links.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-2 break-all" style={{ ...bodyStyle, color: OXBLOOD }}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-2"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
