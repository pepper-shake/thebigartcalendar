'use client';

import { ArtEvent } from '@/types';
import { EventTypeBadge } from '@/components/calendar/EventTypeBadge';

interface Props {
  event: ArtEvent;
  onClick: (e: ArtEvent) => void;
}

export default function EventListCard({ event, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(event)}
      className="w-full flex gap-0 rounded-xl overflow-hidden border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md transition-all text-left group"
    >
      {/* Image */}
      {event.image && (
        <div className="w-52 shrink-0 relative overflow-hidden">
          <img
            src={event.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-5 min-w-0">
        <div className="space-y-2">
          <EventTypeBadge type={event.type} size="md" />
          <h3 className="text-zinc-900 font-bold text-xl leading-tight">{event.title}</h3>
          <p className="text-zinc-500 text-sm line-clamp-2">{event.description}</p>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div className="space-y-1">
            <p className="text-zinc-500 text-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.venue}, {event.city}
            </p>
            <p className="text-zinc-500 text-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
            </p>
          </div>

          {event.price && (
            <span className="text-zinc-900 font-semibold text-sm">{event.price}</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center pr-4 text-zinc-300 group-hover:text-zinc-500 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
