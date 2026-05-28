'use client';

import { CalendarFilters } from '@/types';
import FilterBar from '@/components/filters/FilterBar';

interface Props {
  year: number;
  onYearChange: (y: number) => void;
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
}

const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function AppHeader({ year, onYearChange, filters, onFiltersChange }: Props) {
  return (
    <div className="flex-none">
      {/* Title row */}
      <div className="flex items-start justify-between px-6 pt-5 pb-3">
        <button className="text-xs font-medium text-zinc-400 hover:text-zinc-700 tracking-widest uppercase mt-1 transition-colors">
          Menu
        </button>

        <h1
          className="text-center text-zinc-900 lowercase"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 800,
            fontSize: '82px',
            lineHeight: '76px',
            letterSpacing: '-2px',
          }}
        >
          the big<br />art calendar.
        </h1>

        <button className="text-xs font-medium text-zinc-400 hover:text-zinc-700 tracking-widest uppercase mt-1 transition-colors">
          Menu
        </button>
      </div>

      {/* Year + filters row */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="relative inline-flex items-center gap-1">
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="appearance-none text-sm font-bold text-zinc-900 bg-transparent cursor-pointer pr-4 focus:outline-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-0 w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <FilterBar filters={filters} onChange={onFiltersChange} />
      </div>
    </div>
  );
}
