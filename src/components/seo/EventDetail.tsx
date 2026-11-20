import Link from 'next/link';
import { ArtEvent } from '@/types';
import { EventImage } from '@/components/events/EventImage';
import { formatDateShort } from '@/lib/format';

// Server-rendered event panel (Figma "Event page" 421:4938), the same cream
// panel as the place page: title, date line, address, description, organiser /
// venue pills and tags in oxblood on the left with the source link pinned to
// the bottom, and a 568×630 image on the right (image first, stacked, on
// mobile). Semantic <h1> and internal links keep it indexable (this is the
// content behind the JSON-LD).

const PANEL_BG = '#fbfaf6';
const MUTED = '#909090';
const OXBLOOD = '#5A1F2E';
const PILL_BG = '#e5e1d3';

// Figma 421:4944 / 421:5046: Newsreader Regular 22, the address in grey italic.
const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 400,
  fontSize: 22,
  lineHeight: '26px',
};

// Description: Geist Light 22/38 (Figma 421:4945).
const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 300,
  fontSize: 22,
  lineHeight: '38px',
};

// Pills, tags and the source link are Host Grotesk Regular in Figma; we set
// them in Geist 400, the site's meta face.
const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 400,
  fontSize: 22,
  lineHeight: '30px',
};

const pillStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: PILL_BG,
  lineHeight: '18px',
  height: 44,
  padding: '0 16px',
};

const tagStyle: React.CSSProperties = {
  backgroundColor: 'rgba(251, 250, 246, 0.7)',
  fontFamily: 'var(--font-meta)',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '22px',
  padding: '8px 16px',
};

export default function EventDetail({ event }: { event: ArtEvent }) {
  // A finished event's image is shown in grayscale (it's kept for reference but
  // no longer promoted).
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isPast = (event.endDate ?? event.date) < todayStr;

  // "Nov 21, 2026 · 15:00 (Offline)"; multi-day events show the date range.
  const attendance = event.city || event.venue ? 'Offline' : 'Online';
  const dates =
    event.endDate && event.endDate !== event.date
      ? `${formatDateShort(event.date)} – ${formatDateShort(event.endDate)}`
      : formatDateShort(event.date);

  // "Rua de São Paulo 150, Lisboa"; without a street address, "Venue, City".
  const where = event.address || [event.venue, event.city].filter(Boolean).join(', ');

  // Organiser / venue pills. A linked place (/places/<slug>) wins over the
  // external website; when organiser and venue are the same place (or name),
  // show a single pill.
  const entityPill = (key: string, name: string, place?: { slug: string }, url?: string) =>
    place ? (
      <Link key={key} href={`/places/${place.slug}`} style={pillStyle} className="inline-flex items-center hover:opacity-80 transition-opacity">
        {name}
      </Link>
    ) : url ? (
      <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={pillStyle} className="inline-flex items-center hover:opacity-80 transition-opacity">
        {name}
      </a>
    ) : (
      <span key={key} style={pillStyle} className="inline-flex items-center">
        {name}
      </span>
    );

  // The organiser can also come from a place matched on the source name (e.g.
  // an Instagram-sourced event with no organiser field).
  const organiserName = event.organiserName ?? event.organiserPlace?.name;
  const sameEntity =
    !!organiserName &&
    !!event.venue &&
    (event.organiserPlace && event.venuePlace
      ? event.organiserPlace.slug === event.venuePlace.slug
      : organiserName.trim().toLowerCase() === event.venue.trim().toLowerCase());

  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-stretch lg:gap-8"
      style={{ backgroundColor: PANEL_BG, color: OXBLOOD }}
    >
      {/* On mobile the image leads; on desktop it's the fixed right column. */}
      <div className="aspect-[568/630] w-full overflow-hidden lg:order-2 lg:aspect-auto lg:h-[630px] lg:w-[568px] lg:shrink-0">
        <EventImage
          candidates={event.imageCandidates ?? []}
          alt={event.title}
          className="w-full h-full object-cover"
          style={isPast ? { filter: 'grayscale(1)' } : undefined}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-8 lg:order-1 lg:px-6 lg:py-[42px]">
        <div className="flex flex-col gap-8">
          {/* Figma 421:4941: Newsreader Regular 52/42, -1.04px. */}
          <h1
            className="text-[40px] leading-[40px] lg:text-[52px] lg:leading-[42px]"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            {event.title}
          </h1>

          <p style={metaStyle}>
            {dates}
            {event.startTime && ` · ${event.startTime}`} ({attendance})
            {event.price ? ` · ${event.price}` : ''}
          </p>

          {where && <p style={{ ...metaStyle, fontStyle: 'italic', color: MUTED }}>{where}</p>}

          {event.description && (
            <p className="whitespace-pre-line" style={bodyStyle}>
              {event.description}
            </p>
          )}

          {(organiserName || event.venue) && (
            <div className="flex flex-wrap items-start" style={{ gap: 16 }}>
              {organiserName && entityPill('organiser', organiserName, event.organiserPlace, event.organiserUrl)}
              {event.venue && !sameEntity && entityPill('venue', event.venue, event.venuePlace, event.venueUrl)}
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {event.tags.map((t) => (
                <span key={t} style={tagStyle}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Figma 421:4946: the source page link, pinned to the bottom. Long
            URLs read badly, so it's labelled "Link →" (operator's call). */}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start hover:underline underline-offset-2"
            style={linkStyle}
          >
            Link →
          </a>
        )}
      </div>
    </div>
  );
}
