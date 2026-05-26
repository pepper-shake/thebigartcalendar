'use client';

import { useState } from 'react';
import { CalendarFilters } from '@/types';
import { mockEvents } from '@/data/mockEvents';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import MobileAgenda from '@/components/mobile/MobileAgenda';

const DEFAULT_FILTERS: CalendarFilters = { type: 'all', city: 'all' };

export default function HomePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-col h-screen overflow-hidden">
        <CalendarHeader
          year={year}
          month={month}
          filters={filters}
          onFiltersChange={setFilters}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
        <main className="flex-1 min-h-0">
          <CalendarGrid
            year={year}
            month={month}
            events={mockEvents}
            filters={filters}
          />
        </main>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-col h-screen overflow-hidden">
        <MobileAgenda
          year={year}
          month={month}
          events={mockEvents}
          filters={filters}
          onFiltersChange={setFilters}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
      </div>
    </>
  );
}
