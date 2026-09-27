import Link from 'next/link';
import { type Place, type OpeningHours } from '@/db/schema';
import { EventImage } from '@/components/events/EventImage';
import { getCardColor, hexToRgba } from '@/lib/eventColor';
import { categoryLabel } from '@/lib/places';
import { citySlug } from '@/lib/slug';
import { SITE_DEFAULT_IMAGE } from '@/lib/organiser-images';

// Server-rendered place page body, in the same visual language as EventDetail:
// tinted panel, big title, meta lines + link pills + description on the left,
// image + opening hours on the right (stacked on mobile).

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontWeight: 400,
  fontSize: 22,
  lineHeight: '28px',
};

const pillStyle: React.CSSProperties = {
  backgroundColor: 'rgba(251,250,246,0.7)',
  color: '#000',
  fontFamily: 'var(--font-host-grotesk)',
  fontWeight: 400,
  fontSize: 20,
  lineHeight: '18px',
  height: 44,
  padding: '0 16px',
  borderRadius: 8,
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
    <div
      className="rounded-[17px] p-5"
      style={{ backgroundColor: 'rgba(251,250,246,0.7)', fontFamily: 'var(--font-oxygen)', fontSize: 16 }}
    >
      <h2 className="mb-3 text-black" style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 20 }}>
        Opening hours
      </h2>
      {hasDays && (
        <dl className="grid grid-cols-[4rem_1fr] gap-y-1 text-black">
          {DAYS.map(([d, label]) => (
            <div key={d} className="contents">
              <dt className="text-black/60">{label}</dt>
              <dd>{hours[d] ?? 'Closed'}</dd>
            </div>
          ))}
        </dl>
      )}
      {hours.note && <p className={`${hasDays ? 'mt-3 ' : ''}text-black/70`}>{hours.note}</p>}
    </div>
  );
}

export default function PlaceDetail({ place }: { place: Place }) {
  const cardColor = getCardColor(place.id);
  const map = mapUrl(place);

  const title = (
    <h1
      className="text-black"
      style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 42, lineHeight: '46px', letterSpacing: '-0.02em' }}
    >
      {place.name}
    </h1>
  );

  const meta = (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <p className="text-black" style={metaStyle}>
        {categoryLabel(place.category)}
        {place.city && (
          <>
            {' · '}
            <Link href={`/cities/${citySlug(place.city)}`} className="hover:underline underline-offset-2">
              {place.city}
            </Link>
          </>
        )}
        {place.country ? `, ${place.country}` : ''}
      </p>
      {place.address && (
        <p className="text-black/80" style={{ ...metaStyle, fontSize: 18 }}>
          {map ? (
            <a href={map} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
              {place.address} ↗
            </a>
          ) : (
            place.address
          )}
        </p>
      )}
    </div>
  );

  const links = [
    place.websiteUrl && { label: 'Website', href: place.websiteUrl },
    place.instagramUrl && { label: 'Instagram', href: place.instagramUrl },
    !place.address && map && { label: 'Map', href: map },
  ].filter((l): l is { label: string; href: string } => !!l);

  const pills = links.length ? (
    <div className="flex flex-wrap" style={{ gap: 16 }}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          style={pillStyle}
          className="inline-flex items-center hover:opacity-80 transition-opacity"
        >
          {l.label} ↗
        </a>
      ))}
    </div>
  ) : null;

  const description = place.description ? (
    <p
      className="text-black whitespace-pre-line"
      style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 20, lineHeight: '34px' }}
    >
      {place.description}
    </p>
  ) : null;

  const image = (
    <div className="w-full overflow-hidden rounded-[17px]" style={{ aspectRatio: '568 / 438' }}>
      <EventImage
        candidates={[place.imageUrl, SITE_DEFAULT_IMAGE].filter((u): u is string => !!u)}
        alt={place.name}
        className="w-full h-full object-cover"
      />
    </div>
  );

  const hours = place.openingHours ? <Hours hours={place.openingHours} /> : null;

  return (
    <div
      className="-mx-6 w-[calc(100%+3rem)] lg:w-full rounded-none px-6 py-8 lg:mx-0 lg:rounded-[24px] lg:px-[42px] lg:py-[62px]"
      style={{
        backgroundColor: '#FBFAF6',
        backgroundImage: `linear-gradient(0deg, ${hexToRgba(cardColor, 0.2)}, ${hexToRgba(cardColor, 0.2)})`,
      }}
    >
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-8">
        {/* On mobile the image leads; on desktop it's the fixed right column. */}
        <div className="flex flex-col gap-4 lg:order-2 lg:w-[568px] lg:shrink-0">
          {image}
          <div className="hidden lg:block">{hours}</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-7 lg:order-1 lg:gap-8">
          {title}
          {meta}
          {pills}
          {description}
          <div className="lg:hidden">{hours}</div>
        </div>
      </div>
    </div>
  );
}
