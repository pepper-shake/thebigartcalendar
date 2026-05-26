'use client';

import { CalendarFilters } from '@/types';
import { MONTH_NAMES } from '@/lib/calendarUtils';
import FilterBar from '@/components/filters/FilterBar';

interface Props {
  year: number;
  month: number;
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarHeader({
  year,
  month,
  filters,
  onFiltersChange,
  onPrev,
  onNext,
}: Props) {
  return (
    <header className="flex-none flex items-center justify-between px-5 py-4 border-b border-zinc-200 gap-4 bg-white">
      {/* Month + nav */}
      <div className="flex items-center gap-3">
        <h1 className="text-zinc-900 text-2xl font-bold tracking-tight leading-none">
          {MONTH_NAMES[month]}{' '}
          <span className="text-zinc-400 font-normal">{year}</span>
        </h1>

        <div className="flex items-center gap-1 ml-1">
          <NavButton onClick={onPrev} label="Previous month">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </NavButton>
          <NavButton onClick={onNext} label="Next month">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </NavButton>
        </div>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={onFiltersChange} />
    </header>
  );
}

function NavButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
    </button>
  );
}
