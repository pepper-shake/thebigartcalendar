'use client';

import { useState } from 'react';
import { ArtEvent } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { formatDateShort } from '@/lib/format';
import ViewerLocalTime from '@/components/events/ViewerLocalTime';

const CARD_COLORS = ['#E06927', '#EFCEEE', '#C8CC17', '#BFDBD8'];

function getCardColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

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
  onClick: (e: ArtEvent) => void;
  fullWidth?: boolean;
}

export default function EventCard({ event, onClick, fullWidth = false }: Props) {
  const bgColor = getCardColor(event.id);
  const [hovered, setHovered] = useState(false);
  const typeLabel = eventTypeColors[event.type]?.label ?? event.type;

  return (
    <button
      onClick={() => onClick(event)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`w-full text-left focus:outline-none ${fullWidth ? '' : 'max-w-[346px]'}`}
    >
      <div
        className="w-full flex flex-col items-start"
        style={{
          backgroundColor: hovered ? '#FFFFFF' : bgColor,
          border: `1px ${hovered ? 'dashed' : 'solid'} ${hovered ? bgColor : 'transparent'}`,
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
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: '#FBFAF6' }} />
          )}
        </div>
      </div>
    </button>
  );
}
