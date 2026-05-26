'use client';

import { useRef } from 'react';
import { ArtEvent } from '@/types';
import { EventTypeBadge, eventTypeColors } from './EventTypeBadge';

const MAX_VISIBLE = 3;

interface Props {
  date: Date;
  events: ArtEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onHoverEvent: (event: ArtEvent, rect: DOMRect) => void;
  onLeaveEvent: () => void;
  onClickEvent: (event: ArtEvent) => void;
}

export default function CalendarCell({
  date,
  events,
  isCurrentMonth,
  isToday,
  onHoverEvent,
  onLeaveEvent,
  onClickEvent,
}: Props) {
  const day = date.getDate();
  const hasEvents = events.length > 0;
  const visible = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  return (
    <div
      className={`flex-1 min-w-0 relative border-r border-b border-zinc-200 flex flex-col transition-colors bg-white ${
        isCurrentMonth ? '' : 'opacity-30'
      }`}
    >
      {/* Day number */}
      <div className="flex-none flex items-start justify-end p-1.5">
        <span
          className={`text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full leading-none ${
            isToday
              ? 'bg-zinc-900 text-white font-bold'
              : isCurrentMonth
              ? 'text-zinc-500'
              : 'text-zinc-300'
          }`}
        >
          {day}
        </span>
      </div>

      {/* Events area */}
      {hasEvents && (
        <div className="flex-1 flex flex-col gap-px px-1 pb-1 min-h-0 overflow-hidden">
          {visible.map((event) => (
            <EventChip
              key={event.id}
              event={event}
              compact={events.length > 1}
              onHover={onHoverEvent}
              onLeave={onLeaveEvent}
              onClick={onClickEvent}
            />
          ))}
          {overflow > 0 && (
            <div className="text-[10px] text-zinc-400 pl-1 flex-none">
              +{overflow} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  event: ArtEvent;
  compact: boolean;
  onHover: (event: ArtEvent, rect: DOMRect) => void;
  onLeave: () => void;
  onClick: (event: ArtEvent) => void;
}

function EventChip({ event, compact, onHover, onLeave, onClick }: ChipProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const colors = eventTypeColors[event.type];

  const handleMouseEnter = () => {
    if (ref.current) {
      onHover(event, ref.current.getBoundingClientRect());
    }
  };

  return (
    <button
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      onClick={() => onClick(event)}
      className="relative flex-1 min-h-0 rounded overflow-hidden text-left w-full group transition-all hover:ring-1 hover:ring-zinc-400/40 focus:outline-none focus:ring-1 focus:ring-zinc-400/60"
      style={{ minHeight: compact ? '28px' : '48px' }}
    >
      {/* Image background */}
      {event.image ? (
        <>
          <img
            src={event.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 ${colors.bg}`} />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-1">
        {!compact && (
          <div className="mb-0.5">
            <EventTypeBadge type={event.type} />
          </div>
        )}
        <p className={`text-[10px] font-semibold leading-tight line-clamp-2 drop-shadow ${event.image ? 'text-white' : colors.text}`}>
          {event.title}
        </p>
        {!compact && (
          <p className={`text-[9px] leading-tight mt-0.5 drop-shadow ${event.image ? 'text-white/70' : colors.text + ' opacity-70'}`}>
            {event.city}
          </p>
        )}
        {compact && event.image && (
          <span className={`inline-block w-1 h-1 rounded-full bg-white/60 mb-px`} />
        )}
      </div>
    </button>
  );
}
