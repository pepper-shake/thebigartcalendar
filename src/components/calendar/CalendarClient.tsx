'use client';

import { useState, useMemo, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { ArtEvent, CalendarFilters } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import MonthStrip from '@/components/calendar/MonthStrip';
import DateStrip from '@/components/calendar/DateStrip';
import EventCard from '@/components/events/EventCard';
import EventModal from '@/components/events/EventModal';
import MobileAgenda from '@/components/mobile/MobileAgenda';

interface Props {
  events: ArtEvent[];
  cities: string[];
}

const DEFAULT_FILTERS: CalendarFilters = { type: 'all', city: 'all' };

export default function CalendarClient({ events, cities }: Props) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);
  const [modalEvent, setModalEvent] = useState<ArtEvent | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Events active during this year/month (including spanning exhibitions)
  const monthEvents = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    return events.filter((e) => {
      const start = new Date(e.date);
      const end = e.endDate ? new Date(e.endDate) : start;

      if (start > lastOfMonth || end < firstOfMonth) return false;
      if (filters.type !== 'all' && e.type !== filters.type) return false;
      if (filters.city !== 'all' && e.city !== filters.city) return false;
      return true;
    });
  }, [events, year, month, filters]);

  // Unique sorted dates — spanning events pinned to 1st of month
  const eventDates = useMemo(() => {
    const firstOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const dates = monthEvents.map((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === year && m - 1 === month ? e.date : firstOfMonth;
    });
    return [...new Set(dates)].sort();
  }, [monthEvents, year, month]);

  // The date to show: keep the user's explicit selection while it's still a
  // valid event date this month, otherwise fall back to the current day-of-month
  // (when it has events) or the first event date. Derived during render rather
  // than pushed into state from an effect, to avoid cascading renders.
  const effectiveSelectedDate = useMemo<string | null>(() => {
    if (eventDates.length === 0) return null;
    if (selectedDate && eventDates.includes(selectedDate)) return selectedDate;
    const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return eventDates.includes(todayStr) ? todayStr : eventDates[0];
  }, [eventDates, selectedDate, year, month, today]);

  // Events for the selected date
  const selectedEvents = useMemo(() => {
    if (!effectiveSelectedDate) return [];
    const firstOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    return monthEvents.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      const effectiveDate = y === year && m - 1 === month ? e.date : firstOfMonth;
      return effectiveDate === effectiveSelectedDate;
    });
  }, [monthEvents, effectiveSelectedDate, year, month]);

  const handleMonthChange = (m: number) => {
    setMonth(m);
    setSelectedDate(null);
  };

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────── */}
      <div className="hidden md:flex flex-col h-full overflow-hidden relative" style={{ backgroundColor: '#FBFAF6' }}>

        {/* Filters bar with fading bottom border on scroll */}
        <div className="flex-none relative">
          <AppHeader
            year={year}
            onYearChange={setYear}
            filters={filters}
            onFiltersChange={setFilters}
            cities={cities}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px bg-[#b1b1b1] transition-opacity duration-300"
            style={{ opacity: isScrolled ? 1 : 0 }}
          />
        </div>

        {/* Scrollable: month strip + date strip + cards */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto"
          onScroll={handleScroll}
        >
          <MonthStrip month={month} onChange={handleMonthChange} />
          <DateStrip eventDates={eventDates} selectedDate={effectiveSelectedDate} onChange={setSelectedDate} />

          <main className="px-6 py-4">
            {selectedEvents.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
                {eventDates.length === 0 ? 'No events this month' : 'Select a date above'}
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${Math.min(selectedEvents.length, 4)}, 1fr)` }}
              >
                {selectedEvents.map((event) => (
                  <EventCard key={event.id} event={event} onClick={setModalEvent} />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Scroll-to-top FAB */}
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

      {/* ── Mobile ──────────────────────────────────────── */}
      <div className="flex md:hidden flex-col h-full overflow-hidden">
        <MobileAgenda
          year={year}
          onYearChange={setYear}
          month={month}
          onMonthChange={handleMonthChange}
          selectedDate={effectiveSelectedDate}
          onSelectedDateChange={setSelectedDate}
          eventDates={eventDates}
          selectedEvents={selectedEvents}
          filters={filters}
          onFiltersChange={setFilters}
          cities={cities}
        />
      </div>
    </>
  );
}
