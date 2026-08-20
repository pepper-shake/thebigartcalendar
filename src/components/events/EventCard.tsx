'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArtEvent } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { getCardColor } from '@/lib/eventColor';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';
import ViewerLocalTime from '@/components/events/ViewerLocalTime';

function placeLabel(event: ArtEvent): string {
  const parts = [event.city, event.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Virtual';
}

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '18px',
};

interface Props {
  event: ArtEvent;
}

/** Today as YYYY-MM-DD, for lexicographic comparison against event dates. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EventCard({ event }: Props) {
  const bgColor = getCardColor(event.id);
  const [hovered, setHovered] = useState(false);
  const typeLabel = eventTypeColors[event.type]?.label ?? event.type;

  // Past events stay visible (e.g. on earlier calendar months) but are shown
  // in grayscale and are NOT linked — we don't suggest navigating to them.
  const isPast = (event.endDate ?? event.date) < todayISO();
  const active = hovered && !isPast;

  const card = (
      <div
        className="w-full flex flex-col items-start"
        style={{
          backgroundColor: active ? '#FFFFFF' : bgColor,
          border: `1px ${active ? 'dashed' : 'solid'} ${active ? bgColor : 'transparent'}`,
          borderRadius: 24,
          padding: 24,
          gap: 16,
          height: 460,
          maxHeight: 460,
          transition: 'background-color 150ms ease, border-color 150ms ease',
        }}
      >
        {/* Event type pill */}
        <div className="flex-none">
          <span
            className="inline-block"
            style={{
              backgroundColor: 'rgba(251,250,246,0.7)',
              color: '#000',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '14px',
              padding: '8px 16px',
              borderRadius: 42,
              whiteSpace: 'nowrap',
            }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Title — max 2 lines, ellipsis beyond */}
        <h3
          className="text-black line-clamp-2 flex-none w-full"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 600,
            fontSize: 32,
            lineHeight: '36px',
            letterSpacing: '-0.02em',
          }}
        >
          {event.title}
        </h3>

        {/* Place · date, then time (event-local + viewer-local) */}
        <div className="flex-none flex flex-col w-full" style={{ gap: 8 }}>
          <p className="text-black w-full" style={metaStyle}>
            {placeLabel(event)} · {formatDateShort(event.date)}
          </p>
          {event.startTime && (
            <p className="text-black w-full" style={metaStyle}>
              {event.startTime}
              {event.city ? ` ${event.city}` : ''}
              <ViewerLocalTime event={event} />
            </p>
          )}
        </div>

        {/* Image — grows to fill remaining space (taller when title is one line) */}
        <div className="flex-1 min-h-0 w-full overflow-hidden" style={{ borderRadius: 17 }}>
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              style={isPast ? { filter: 'grayscale(1)' } : undefined}
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: '#FBFAF6' }} />
          )}
        </div>
      </div>
  );

  // Past events render as a non-interactive card (no link); current events link
  // to their detail page with the hover treatment.
  if (isPast) {
    return <div className="block w-full text-left">{card}</div>;
  }

  return (
    <Link
      href={`/events/${eventSlug(event)}`}
      prefetch={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="block w-full text-left focus:outline-none"
    >
      {card}
    </Link>
  );
}
