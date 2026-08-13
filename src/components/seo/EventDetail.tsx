import Link from 'next/link';
import { ArtEvent } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { getCardColor, tint } from '@/lib/eventColor';
import { formatDateShort } from '@/lib/format';
import { typeMeta } from '@/lib/eventTypes';
import { citySlug } from '@/lib/slug';
import ViewerLocalTime from '@/components/events/ViewerLocalTime';

// Server-rendered event page body, styled to match the event preview modal:
// a themed card with the About text beside the image + details. Semantic <h1>
// and internal links keep it indexable (this is the content behind the JSON-LD).

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '18px',
};

export default function EventDetail({ event }: { event: ArtEvent }) {
  const meta = typeMeta(event.type);
  const cardColor = getCardColor(event.id);
  const bgColor = tint(cardColor, 0.8);
  const typeLabel = eventTypeColors[event.type]?.label ?? event.type;

  const image = (aspect: string) => (
    <div className="relative w-full overflow-hidden rounded-[24px]" style={{ aspectRatio: aspect }}>
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full" style={{ backgroundColor: '#FBFAF6' }} />
      )}
      <Link
        href={`/${meta.slug}`}
        aria-label={`Browse ${meta.plural}`}
        className="absolute left-4 bottom-4 inline-block"
        style={{
          backgroundColor: cardColor,
          color: '#000',
          fontFamily: 'var(--font-host-grotesk)',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '14px',
          padding: '8px 16px',
          borderRadius: 42,
        }}
      >
        {typeLabel} event
      </Link>
    </div>
  );

  const titleEl = (
    <h1
      className="text-black"
      style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontWeight: 600,
        fontSize: 36,
        lineHeight: '42px',
        letterSpacing: '-0.02em',
      }}
    >
      {event.title}
    </h1>
  );

  const metaLines = (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <p className="text-black" style={metaStyle}>
        {event.city ? (
          <Link href={`/cities/${citySlug(event.city)}`} className="underline underline-offset-2">
            {event.city}
          </Link>
        ) : null}
        {event.country ? `${event.city ? ', ' : ''}${event.country}` : !event.city ? 'Virtual' : ''}
        {` · ${formatDateShort(event.date)}`}
      </p>
      {event.startTime && (
        <p className="text-black" style={metaStyle}>
          {event.startTime}
          {event.city ? ` ${event.city}` : ''}
          <ViewerLocalTime event={event} />
        </p>
      )}
      {event.price && (
        <p className="text-black" style={metaStyle}>
          Price: {event.price}
        </p>
      )}
    </div>
  );

  const tickets =
    event.ticketsUrl && event.ticketsUrl !== '#' ? (
      <a
        href={event.ticketsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center bg-black text-white rounded-full px-6 py-3 hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 16 }}
      >
        Get tickets
      </a>
    ) : null;

  const tagsEl =
    event.tags && event.tags.length > 0 ? (
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {event.tags.map((t) => (
          <span
            key={t}
            style={{
              backgroundColor: 'rgba(251,250,246,0.7)',
              color: '#000',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '22px',
              padding: '8px 16px',
              borderRadius: 42,
            }}
          >
            #{t}
          </span>
        ))}
      </div>
    ) : null;

  const aboutEl = event.description ? (
    <div>
      <h2
        className="text-black"
        style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 24, lineHeight: '32px' }}
      >
        About
      </h2>
      <p
        className="text-black mt-4 whitespace-pre-line"
        style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 400, fontSize: 16, lineHeight: '26px' }}
      >
        {event.description}
      </p>
    </div>
  ) : null;

  return (
    <article>
      <div className="w-full max-w-[1123px] mx-auto rounded-[32px] p-6 md:p-[42px]" style={{ backgroundColor: bgColor }}>
        {/* Desktop: About | image + details */}
        <div className="hidden md:flex md:gap-4">
          <div className="md:w-[455px] md:shrink-0 md:pr-[23px]">{aboutEl}</div>
          <div className="md:flex-1 md:min-w-0">
            {image('568 / 438')}
            <div className="mt-5">{titleEl}</div>
            <div className="mt-5">{metaLines}</div>
            {tickets && <div className="mt-6">{tickets}</div>}
            {tagsEl && <div className="mt-5">{tagsEl}</div>}
          </div>
        </div>

        {/* Mobile: single column */}
        <div className="md:hidden">
          {image('382 / 284')}
          <div className="mt-5">{titleEl}</div>
          <div className="mt-4">{metaLines}</div>
          {tickets && <div className="mt-6">{tickets}</div>}
          <div className="mt-6">{aboutEl}</div>
          {tagsEl && <div className="mt-6">{tagsEl}</div>}
        </div>
      </div>

      {/* Internal links for discovery + SEO */}
      <nav
        className="max-w-[1123px] mx-auto mt-8 flex flex-wrap gap-x-6 gap-y-2 text-black/60"
        style={{ fontFamily: 'var(--font-oxygen)', fontSize: 15 }}
      >
        <Link href={`/${meta.slug}`} className="hover:text-black hover:underline">
          More {meta.plural.toLowerCase()}
        </Link>
        {event.city && (
          <Link href={`/cities/${citySlug(event.city)}`} className="hover:text-black hover:underline">
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
