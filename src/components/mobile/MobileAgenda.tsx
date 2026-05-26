'use client';

import { useState } from 'react';
import { ArtEvent, CalendarFilters } from '@/types';
import { EventTypeBadge } from '@/components/calendar/EventTypeBadge';
import EventModal from '@/components/events/EventModal';
import { MONTH_NAMES } from '@/lib/calendarUtils';
import FilterBar from '@/components/filters/FilterBar';

interface Props {
  year: number;
  month: number;
  events: ArtEvent[];
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function MobileAgenda({
  year,
  month,
  events,
  filters,
  onFiltersChange,
  onPrev,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<ArtEvent | null>(null);

  const filtered = events.filter((e) => {
    if (filters.type !== 'all' && e.type !== filters.type) return false;
    if (filters.city !== 'all' && e.city !== filters.city) return false;
    const [y, m] = e.date.split('-').map(Number);
    return y === year && m - 1 === month;
  });

  const byDay = filtered.reduce<Record<string, ArtEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDay).sort();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <header className="flex-none px-4 pt-5 pb-3 border-b border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-zinc-900 text-xl font-bold tracking-tight">
            {MONTH_NAMES[month]} <span className="text-zinc-400 font-normal">{year}</span>
          </h1>
          <div className="flex gap-1">
            <MobileNavBtn onClick={onPrev}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </MobileNavBtn>
            <MobileNavBtn onClick={onNext}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </MobileNavBtn>
          </div>
        </div>
        <FilterBar filters={filters} onChange={onFiltersChange} />
      </header>

      {/* Agenda list */}
      <div className="flex-1 overflow-y-auto">
        {sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-sm">
            No events match your filters
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {sortedDates.map((dateStr) => {
              const [y, m, d] = dateStr.split('-').map(Number);
              const date = new Date(y, m - 1, d);
              const dayLabel = date.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              return (
                <div key={dateStr}>
                  <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 bg-zinc-50 sticky top-0 border-b border-zinc-100">
                    {dayLabel}
                  </div>
                  {byDay[dateStr].map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelected(event)}
                      className="w-full flex gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
                    >
                      {event.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={event.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <EventTypeBadge type={event.type} />
                        <p className="text-zinc-900 text-sm font-semibold leading-snug line-clamp-2">
                          {event.title}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {event.startTime} · {event.city}
                        </p>
                        {event.price && (
                          <p className="text-zinc-400 text-xs">{event.price}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MobileNavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
    </button>
  );
}
