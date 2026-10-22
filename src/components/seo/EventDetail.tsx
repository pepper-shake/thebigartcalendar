import Link from 'next/link';
import { ArtEvent } from '@/types';
import { EventImage } from '@/components/events/EventImage';
import EventActions from '@/components/events/EventActions';
import { getCardScheme } from '@/lib/eventColor';
import { formatDateShort } from '@/lib/format';
import { typeMeta } from '@/lib/eventTypes';
import { citySlug, eventSlug } from '@/lib/slug';
import { absoluteUrl } from '@/lib/site';
import ViewerLocalTime from '@/components/events/ViewerLocalTime';

// Server-rendered event page body. Two Figma layouts share the same building
// blocks:
//  • Desktop (node 249:1475): title + copy/source actions on top, then the
//    place/date/time, organiser & venue pills and description on the left with
//    the image + tags on the right.
//  • Mobile (nodes 207:2760 / 254:1989): a full-bleed tinted panel — actions
//    alone at the top (right-aligned), the image (with a type pill overlaid
//    bottom-left), then the title, meta, pills, description and tags stacked.
// Semantic <h1> and internal links keep it indexable (this is the content
// behind the JSON-LD).

// The panel is the event's card scheme at full strength (Figma 287:4572): one
// background, one foreground for every word, pill and icon in it. Meta lines
// and pills use Geist like the cards; title and description the light serif.
const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 400,
  fontSize: 22,
  lineHeight: '26px',
};

const pillBase: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 400,
  fontSize: 22,
  lineHeight: '18px',
  height: 44,
  padding: '0 16px',
};

export default function EventDetail({ event }: { event: ArtEvent }) {
  const scheme = getCardScheme(event);
  const pillStyle: React.CSSProperties = { ...pillBase, backgroundColor: scheme.chip };
  const eventUrl = absoluteUrl(`/events/${eventSlug(event)}`);
  const typeLabel = typeMeta(event.type).label;

  // A finished event's hero is shown in grayscale (it's kept for reference but
  // no longer promoted).
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isPast = (event.endDate ?? event.date) < todayStr;

  const titleEl = (
    <h1
      style={{
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
        fontSize: 42,
        lineHeight: '46px',
        letterSpacing: '-0.02em',
      }}
    >
      {event.title}
    </h1>
  );

  const actionsEl = <EventActions eventUrl={eventUrl} sourceUrl={event.sourceUrl} scheme={scheme} />;

  const attendance = event.city || event.venue ? 'Offline' : 'Online';

  const metaLines = (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <p style={metaStyle}>
        {event.city ? (
          <Link href={`/cities/${citySlug(event.city)}`} className="hover:underline underline-offset-2">
            {event.city}
          </Link>
        ) : null}
        {event.country ? `${event.city ? ', ' : ''}${event.country}` : !event.city ? 'Virtual' : ''}
        {` · ${formatDateShort(event.date)}`}
      </p>
      {event.startTime && (
        <p style={metaStyle}>
          {event.startTime}
          {event.city ? ` ${event.city}` : ''}
          <ViewerLocalTime event={event} />
        </p>
      )}
      <p style={metaStyle}>
        {attendance}
        {event.price ? ` · Price ${event.price}` : ''}
      </p>
    </div>
  );

  // Organiser / venue pills. A linked place (/places/<slug>) wins over the
  // external website; when organiser and venue are the same place (or name),
  // show a single pill.
  const entityPill = (key: string, name: string, place?: { slug: string }, url?: string) =>
    place ? (
      <Link
        key={key}
        href={`/places/${place.slug}`}
        style={pillStyle}
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {name}
      </Link>
    ) : url ? (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={pillStyle}
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
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

  const entityPills =
    organiserName || event.venue ? (
      <div className="flex flex-wrap items-start" style={{ gap: 16 }}>
        {organiserName &&
          entityPill('organiser', organiserName, event.organiserPlace, event.organiserUrl)}
        {event.venue &&
          !sameEntity &&
          entityPill('venue', event.venue, event.venuePlace, event.venueUrl)}
      </div>
    ) : null;

  const description = event.description ? (
    <p
      className="whitespace-pre-line"
      style={{
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
        fontSize: 22,
        lineHeight: '34px',
      }}
    >
      {event.description}
    </p>
  ) : null;

  const tagsEl =
    event.tags && event.tags.length > 0 ? (
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {event.tags.map((t) => (
          <span
            key={t}
            style={{
              backgroundColor: scheme.chip,
              fontFamily: 'var(--font-meta)',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '22px',
              padding: '8px 16px',
            }}
          >
            #{t}
          </span>
        ))}
      </div>
    ) : null;

  // `withTypePill` overlays the event type in the bottom-left of the image
  // (mobile only, per Figma node 207:2856).
  const renderImage = (withTypePill = false) => (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '568 / 438' }}>
      <EventImage
        candidates={event.imageCandidates ?? []}
        alt={event.title}
        className="w-full h-full object-cover"
        style={isPast ? { filter: 'grayscale(1)' } : undefined}
      />
      {withTypePill && (
        <span
          className="absolute left-[14px] bottom-[14px]"
          style={{
            backgroundColor: scheme.bg,
            color: scheme.fg,
            fontFamily: 'var(--font-meta)',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '22px',
            padding: '8px 16px',
          }}
        >
          {typeLabel} event
        </span>
      )}
    </div>
  );

  return (
    <div
      className="-mx-6 w-[calc(100%+3rem)] lg:w-full px-6 py-8 lg:mx-0 lg:px-[42px] lg:py-[62px]"
      style={{ backgroundColor: scheme.bg, color: scheme.fg }}
    >
      {/* Desktop: title + actions on top, then meta/pills/description | image + tags.
          Figma: left column flexes, image column is a fixed 568px (so the left
          column is the wider of the two, never dwarfed by the image). */}
      <div className="hidden lg:flex lg:flex-col" style={{ gap: 32 }}>
        <div className="flex items-start justify-between gap-4 w-full">
          {titleEl}
          {actionsEl}
        </div>
        <div className="flex items-start" style={{ gap: 32 }}>
          <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 32 }}>
            {metaLines}
            {entityPills}
            {description}
          </div>
          <div className="shrink-0 flex flex-col w-[568px]" style={{ gap: 16 }}>
            {renderImage()}
            {tagsEl}
          </div>
        </div>
      </div>

      {/* Mobile: actions (right-aligned) → image (with type pill) → title →
          meta → pills → description → tags. */}
      <div className="flex flex-col lg:hidden" style={{ gap: 28 }}>
        <div className="flex justify-end">{actionsEl}</div>
        {renderImage(true)}
        {titleEl}
        {metaLines}
        {entityPills}
        {description}
        {tagsEl}
      </div>
    </div>
  );
}
