'use client';

import { useEffect, useRef, useState } from 'react';
import { ArtEvent } from '@/types';
import { EventTypeBadge, eventTypeColors } from '@/components/calendar/EventTypeBadge';

interface Props {
  event: ArtEvent;
  anchorRect: DOMRect;
}

export default function EventPreviewCard({ event, anchorRect }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const pad = 10;

    let left =
      anchorRect.left + anchorRect.width / 2 > W / 2
        ? anchorRect.left - cw - pad
        : anchorRect.right + pad;

    let top = anchorRect.top;
    top = Math.max(pad, Math.min(top, H - ch - pad));
    left = Math.max(pad, Math.min(left, W - cw - pad));

    setPos({ left, top });
  }, [anchorRect]);

  const colors = eventTypeColors[event.type];

  return (
    <div
      ref={cardRef}
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden' }}
      className="fixed z-50 w-72 rounded-xl overflow-hidden shadow-xl border border-zinc-200 bg-white pointer-events-none"
    >
      {/* Image */}
      {event.image && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2">
            <EventTypeBadge type={event.type} />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-3 space-y-2">
        {!event.image && (
          <div className="mb-1">
            <EventTypeBadge type={event.type} />
          </div>
        )}
        <p className="text-zinc-900 font-semibold text-sm leading-tight line-clamp-2">{event.title}</p>
        <div className="flex items-center gap-1 text-zinc-500 text-xs">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{event.venue}, {event.city}</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-500 text-xs">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
          </span>
        </div>
        {event.price && (
          <div className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {event.price}
          </div>
        )}
        <p className="text-zinc-400 text-xs line-clamp-2 pt-0.5">{event.description}</p>
        <div className="pt-1 border-t border-zinc-100 text-zinc-400 text-xs">
          Click to view full details
        </div>
      </div>
    </div>
  );
}
