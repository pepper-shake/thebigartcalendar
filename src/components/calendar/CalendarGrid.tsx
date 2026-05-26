'use client';

import { useState, useCallback } from 'react';
import { ArtEvent, CalendarFilters } from '@/types';
import { getCalendarDays, groupByWeeks, getEventsForDate, isToday } from '@/lib/calendarUtils';
import CalendarCell from './CalendarCell';
import EventPreviewCard from '@/components/events/EventPreviewCard';
import EventModal from '@/components/events/EventModal';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  year: number;
  month: number;
  events: ArtEvent[];
  filters: CalendarFilters;
}

export default function CalendarGrid({ year, month, events, filters }: Props) {
  const [hovered, setHovered] = useState<{ event: ArtEvent; rect: DOMRect } | null>(null);
  const [selected, setSelected] = useState<ArtEvent | null>(null);

  const days = getCalendarDays(year, month);
  const weeks = groupByWeeks(days);

  const filtered = events.filter((e) => {
    if (filters.type !== 'all' && e.type !== filters.type) return false;
    if (filters.city !== 'all' && e.city !== filters.city) return false;
    return true;
  });

  const handleHover = useCallback((event: ArtEvent, rect: DOMRect) => {
    setHovered({ event, rect });
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(null);
  }, []);

  const handleClick = useCallback((event: ArtEvent) => {
    setHovered(null);
    setSelected(event);
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Day name header row */}
        <div className="flex flex-none border-b border-zinc-200">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="flex-1 text-center text-[11px] font-semibold tracking-widest uppercase text-zinc-400 py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div className="flex flex-col flex-1 min-h-0">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-1 min-h-0">
              {week.map((day, di) => (
                <CalendarCell
                  key={di}
                  date={day}
                  events={getEventsForDate(filtered, day)}
                  isCurrentMonth={day.getMonth() === month}
                  isToday={isToday(day)}
                  onHoverEvent={handleHover}
                  onLeaveEvent={handleLeave}
                  onClickEvent={handleClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {hovered && <EventPreviewCard event={hovered.event} anchorRect={hovered.rect} />}
      <EventModal event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
