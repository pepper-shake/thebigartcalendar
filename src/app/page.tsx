'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArtEvent, CalendarFilters } from '@/types';
import { mockEvents } from '@/data/mockEvents';
import AppHeader from '@/components/layout/AppHeader';
import MonthStrip from '@/components/calendar/MonthStrip';
import DateStrip from '@/components/calendar/DateStrip';
import EventCard from '@/components/events/EventCard';
import EventModal from '@/components/events/EventModal';
import MobileAgenda from '@/components/mobile/MobileAgenda';

const DEFAULT_FILTERS: CalendarFilters = { type: 'all', city: 'all' };

export default function HomePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);
  const [modalEvent, setModalEvent] = useState<ArtEvent | null>(null);

  // Events filtered by year, month, type, city
  const monthEvents = useMemo(() => {
    return mockEvents.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      if (y !== year || m - 1 !== month) return false;
      if (filters.type !== 'all' && e.type !== filters.type) return false;
      if (filters.city !== 'all' && e.city !== filters.city) return false;
      return true;
    });
  }, [year, month, filters]);

  // Unique sorted event dates for this month
  const eventDates = useMemo(() => {
    return [...new Set(monthEvents.map((e) => e.date))].sort();
  }, [monthEvents]);

  // Auto-select first event date when month/filters change
  useEffect(() => {
    if (eventDates.length === 0) {
      setSelectedDate(null);
      return;
    }
    // Keep current selection if it's still valid
    if (selectedDate && eventDates.includes(selectedDate)) return;
    // Otherwise pick today if it has events, else first event date
    const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(eventDates.includes(todayStr) ? todayStr : eventDates[0]);
  }, [eventDates]);

  // Events for the selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return monthEvents.filter((e) => e.date === selectedDate);
  }, [monthEvents, selectedDate]);

  const handleMonthChange = (m: number) => {
    setMonth(m);
    setSelectedDate(null); // will be reset by the useEffect above
  };

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────── */}
      <div className="hidden md:flex flex-col h-screen overflow-hidden bg-zinc-50">
        <AppHeader
          year={year}
          onYearChange={setYear}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <MonthStrip month={month} onChange={handleMonthChange} />

        <DateStrip
          eventDates={eventDates}
          selectedDate={selectedDate}
          onChange={setSelectedDate}
        />

        {/* Event list */}
        <main className="flex-1 overflow-y-auto">
          {selectedEvents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
              {eventDates.length === 0
                ? 'No events this month'
                : 'Select a date above'}
            </div>
          ) : (
            <div className="px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-4">
                {selectedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={setModalEvent}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <EventModal event={modalEvent} onClose={() => setModalEvent(null)} />
      </div>

      {/* ── Mobile ──────────────────────────────────────── */}
      <div className="flex md:hidden flex-col h-screen overflow-hidden">
        <MobileAgenda
          year={year}
          month={month}
          events={mockEvents}
          filters={filters}
          onFiltersChange={setFilters}
          onPrev={() => {
            if (month === 0) { setYear(y => y - 1); setMonth(11); }
            else setMonth(m => m - 1);
          }}
          onNext={() => {
            if (month === 11) { setYear(y => y + 1); setMonth(0); }
            else setMonth(m => m + 1);
          }}
        />
      </div>
    </>
  );
}
