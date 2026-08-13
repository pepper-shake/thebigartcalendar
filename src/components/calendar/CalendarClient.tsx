'use client';

import { useState, useMemo, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { ArtEvent, CalendarFilters } from '@/types';
import { toDateString } from '@/lib/calendarUtils';
import AppHeader from '@/components/layout/AppHeader';
import MonthStrip from '@/components/calendar/MonthStrip';
import DateStrip from '@/components/calendar/DateStrip';
import EventCard from '@/components/events/EventCard';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Month boundaries as zero-padded ISO strings, so lexicographic comparison
  // is chronological — avoids timezone pitfalls of Date parsing/comparison.
  const { firstOfMonth, lastOfMonth } = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {
      firstOfMonth: `${year}-${pad(month + 1)}-01`,
      lastOfMonth: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
    };
  }, [year, month]);

  // Events active at any point during the viewed month (start/end inclusive),
  // including multi-day exhibitions that began before or run past it.
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const end = e.endDate ?? e.date;
      if (e.date > lastOfMonth || end < firstOfMonth) return false;
      if (filters.type !== 'all' && e.type !== filters.type) return false;
      if (filters.city !== 'all' && e.city !== filters.city) return false;
      return true;
    });
  }, [events, firstOfMonth, lastOfMonth, filters]);

  // Every in-month day covered by an event. A multi-day exhibition contributes
  // each day it is open (clamped to the month), so it is discoverable on any of
  // those days — not only its opening date.
  const eventDates = useMemo(() => {
    const days = new Set<string>();
    for (const e of monthEvents) {
      const rawEnd = e.endDate ?? e.date;
      const start = e.date < firstOfMonth ? firstOfMonth : e.date;
      const end = rawEnd > lastOfMonth ? lastOfMonth : rawEnd;
      const [y, m, d] = start.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      for (let s = toDateString(cur); s <= end; cur.setDate(cur.getDate() + 1), s = toDateString(cur)) {
        days.add(s);
      }
    }
    return [...days].sort();
  }, [monthEvents, firstOfMonth, lastOfMonth]);

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

  // Events that cover the selected date (start ≤ date ≤ end).
  const selectedEvents = useMemo(() => {
    if (!effectiveSelectedDate) return [];
    return monthEvents.filter((e) => {
      const end = e.endDate ?? e.date;
      return e.date <= effectiveSelectedDate && end >= effectiveSelectedDate;
    });
  }, [monthEvents, effectiveSelectedDate]);

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
              <div className="event-grid">
                {selectedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
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
