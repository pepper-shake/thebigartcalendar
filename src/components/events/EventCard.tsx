'use client';

import Link from 'next/link';
import { ArtEvent } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { getCardScheme } from '@/lib/eventColor';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';

function placeLabel(event: ArtEvent): string {
  const parts = [event.city, event.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Virtual';
}

// Meta lines and the type chip are set in Geist (Figma card 285:4018).
const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '18px',
};

interface Props {
  event: ArtEvent;
  /** Text-only card: no image, height fits the text (stretches to its row). */
  hideImage?: boolean;
  /** Calendar card (Figma "Calendar" 387:2619): sand with oxblood text, date
   *  line first, a fixed 350px image. Otherwise the event's duotone scheme. */
  variant?: 'scheme' | 'calendar';
}

// Calendar card colours (Figma 387:2649).
const CALENDAR_SCHEME = { bg: '#E5E1D3', fg: '#5A1F2E', chip: '#F2F0E9' };

/** Today as YYYY-MM-DD, for lexicographic comparison against event dates. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EventCard({ event, hideImage = false, variant = 'scheme' }: Props) {
  const calendar = variant === 'calendar';
  const scheme = calendar ? CALENDAR_SCHEME : getCardScheme(event);
  const typeLabel = eventTypeColors[event.type]?.label ?? event.type;

  // Past events stay visible (e.g. on earlier calendar months) but are shown
  // in grayscale and are NOT linked — we don't suggest navigating to them.
  const isPast = (event.endDate ?? event.date) < todayISO();

  // Figma card (285:4018): a flat, square duotone block — one background, one
  // foreground for everything inside it. 552px tall; the image takes the rest.
  const card = (
      <div
        // Hover: the whole card zooms 1.5% (Style Reference "subtle zoom"). A
        // transform, so the grid never reflows — it grows ~3px per side into
        // the 16px gap. Past cards aren't links, so they have no group hover.
        className={`${hideImage || calendar ? 'h-full ' : ''}w-full flex flex-col items-start transition-transform duration-[250ms] ease-out group-hover:scale-[1.015]`}
        style={{
          backgroundColor: scheme.bg,
          color: scheme.fg,
          padding: 24,
          gap: 16,
          height: hideImage || calendar ? undefined : 552,
        }}
      >
        {/* Event type chip */}
        <div className="flex-none">
          <span
            className="inline-block"
            style={{
              backgroundColor: scheme.chip,
              fontFamily: 'var(--font-meta)',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '14px',
              padding: '8px 16px',
              whiteSpace: 'nowrap',
            }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Title — light serif, max 2 lines, ellipsis beyond */}
        <h3
          className="line-clamp-2 flex-none w-full"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 32,
            lineHeight: '36px',
            letterSpacing: '-0.64px',
          }}
        >
          {event.title}
        </h3>

        {/* Place and date · time (the venue's local time). The calendar card
            puts the date first and names the time's city: "Aug 8, 2026 ·
            16:30 Lisbon", then "Lisbon, Portugal". */}
        <div className={`flex-none flex w-full ${calendar ? 'flex-col-reverse' : 'flex-col'}`} style={{ gap: 8 }}>
          <p className="w-full" style={metaStyle}>
            {placeLabel(event)}
          </p>
          <p className="w-full" style={metaStyle}>
            {formatDateShort(event.date)}
            {event.startTime && ` · ${event.startTime}`}
            {calendar && event.startTime && event.city && ` ${event.city}`}
          </p>
        </div>

        {/* Image — square-cornered, grows to fill remaining space */}
        {!hideImage && (
          <div
            // Calendar: pinned to the card's foot, so chips and images line up
            // across a row even when one title runs to a single line.
            className={`${calendar ? 'flex-none mt-auto' : 'flex-1 min-h-0'} w-full overflow-hidden`}
            style={calendar ? { height: 350 } : undefined}
          >
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
                style={isPast ? { filter: 'grayscale(1)' } : undefined}
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: calendar ? '#FBFAF6' : 'var(--page)' }} />
            )}
          </div>
        )}
      </div>
  );

  // Past events render as a non-interactive card (no link); current events link
  // to their detail page with the hover treatment.
  if (isPast) {
    return <div className={`${hideImage || calendar ? 'h-full ' : ''}block w-full text-left`}>{card}</div>;
  }

  return (
    <Link
      href={`/events/${eventSlug(event)}`}
      prefetch={false}
      className={`${hideImage || calendar ? 'h-full ' : ''}group block w-full text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink`}
    >
      {card}
    </Link>
  );
}
