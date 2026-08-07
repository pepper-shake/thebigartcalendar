'use client';

import { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { ArtEvent, CalendarFilters, EventType } from '@/types';
import { FilterSelect } from '@/components/ui/FilterSelect';
import MonthStrip from '@/components/calendar/MonthStrip';
import DateStrip from '@/components/calendar/DateStrip';
import EventCard from '@/components/events/EventCard';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import EventModal from '@/components/events/EventModal';

const EVENT_TYPES: EventType[] = ['gallery', 'performance', 'fair', 'auction', 'workshop'];

const YEARS = [2024, 2025, 2026, 2027, 2028];

const ALL_TYPES: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  ...EVENT_TYPES.map((t) => ({ value: t, label: eventTypeColors[t].label })),
];

interface Props {
  year: number;
  onYearChange: (y: number) => void;
  month: number;
  onMonthChange: (m: number) => void;
  selectedDate: string | null;
  onSelectedDateChange: (d: string) => void;
  eventDates: string[];
  selectedEvents: ArtEvent[];
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
  cities: string[];
}

export default function MobileAgenda({
  year,
  onYearChange,
  month,
  onMonthChange,
  selectedDate,
  onSelectedDateChange,
  eventDates,
  selectedEvents,
  filters,
  onFiltersChange,
  cities,
}: Props) {
  const [modalEvent, setModalEvent] = useState<ArtEvent | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#fbfaf6' }}>

      {/* ── Scrollable area: controls + cards ── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Controls scroll away naturally — no layout reflow */}
        <div className="flex items-center justify-between px-2 pt-[20px] pb-3">
          <FilterSelect
            size="sm"
            value={filters.city}
            onChange={(v) => onFiltersChange({ ...filters, city: v ?? 'all' })}
            options={[{ value: 'all', label: 'All Cities' }, ...cities.map((c) => ({ value: c, label: c }))]}
          />
          <FilterSelect
            size="sm"
            value={filters.type}
            onChange={(v) => onFiltersChange({ ...filters, type: (v ?? 'all') as EventType | 'all' })}
            options={ALL_TYPES}
          />
          <FilterSelect
            size="sm"
            value={String(year)}
            onChange={(v) => onYearChange(Number(v ?? year))}
            options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
          />
        </div>

        <MonthStrip month={month} onChange={onMonthChange} scrollable />
        <DateStrip
          eventDates={eventDates}
          selectedDate={selectedDate}
          onChange={onSelectedDateChange}
          fullDayNames
        />

        {/* Event cards */}
        <div className="px-6 py-6">
          {selectedEvents.length === 0 ? (
            <div
              className="flex items-center justify-center h-48 text-black/40"
              style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 16 }}
            >
              {eventDates.length === 0 ? 'No events this month' : 'Select a date above'}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {selectedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={setModalEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Scroll-to-top FAB ── */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-9 right-6 bg-black rounded-full p-3 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isScrolled ? 1 : 0,
          pointerEvents: isScrolled ? 'auto' : 'none',
          transform: isScrolled ? 'scale(1)' : 'scale(0.75)',
        }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="size-6 text-white" strokeWidth={2} />
      </button>

      <EventModal event={modalEvent} onClose={() => setModalEvent(null)} />
    </div>
  );
}
