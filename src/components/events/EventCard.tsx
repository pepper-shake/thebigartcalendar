'use client';

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

interface Props {
  event: ArtEvent;
  onClick: (e: ArtEvent) => void;
  fullWidth?: boolean;
}

export default function EventCard({ event, onClick, fullWidth = false }: Props) {
  const bgColor = getCardColor(event.id);
  const typeLabel = eventTypeColors[event.type]?.label ?? event.type;

  return (
    <button
      onClick={() => onClick(event)}
      className={`w-full text-left ${fullWidth ? '' : 'max-w-[346px]'}`}
    >
      <div
        className="w-full flex flex-col"
        style={{
          backgroundColor: bgColor,
          borderRadius: 24,
          padding: 24,
          gap: 16,
          height: 460,
          maxHeight: 460,
        }}
      >
        {/* Event type pill */}
        <div className="flex-none">
          <span
            className="inline-block"
            style={{
              backgroundColor: '#FBFAF6',
              color: '#000',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 600,
              fontSize: 16,
              lineHeight: '20px',
              padding: '10px 20px',
              borderRadius: 9999,
            }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Title — max 2 lines */}
        <h3
          className="text-black line-clamp-2 flex-none"
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

        {/* Place · date, then time (event-local; viewer's local time added in Phase B) */}
        <div className="flex-none flex flex-col" style={{ gap: 4 }}>
          <p
            className="text-black"
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 500,
              fontSize: 18,
              lineHeight: '24px',
            }}
          >
            {placeLabel(event)} · {formatDateShort(event.date)}
          </p>
          {event.startTime && (
            <p
              className="text-black"
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontWeight: 500,
                fontSize: 18,
                lineHeight: '24px',
              }}
            >
              {event.startTime}
              {event.city ? ` ${event.city}` : ''}
              <ViewerLocalTime event={event} />
            </p>
          )}
        </div>

        {/* Image — grows to fill remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden" style={{ borderRadius: 12 }}>
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black/10" />
          )}
        </div>
      </div>
    </button>
  );
}
