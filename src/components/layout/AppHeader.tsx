'use client';

import { CalendarFilters } from '@/types';
import FilterBar from '@/components/filters/FilterBar';
import { FilterSelect } from '@/components/ui/FilterSelect';

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
      <div className="flex items-start justify-between px-6 pt-[2vh] pb-[1vh]">
        <button className="text-xs font-medium text-zinc-400 hover:text-zinc-700 tracking-widest uppercase mt-1 transition-colors">
          Menu
        </button>

        <h1
          className="text-center text-zinc-900 lowercase"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 800,
            fontSize: 'clamp(42px, 6.5vh, 82px)',
            lineHeight: 'clamp(38px, 6vh, 76px)',
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
      <div className="flex items-center justify-between px-6 pb-[1.5vh]">
        <FilterSelect
          value={String(year)}
          onChange={(v) => onYearChange(Number(v))}
          options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
        />

        <FilterBar filters={filters} onChange={onFiltersChange} />
      </div>
    </div>
  );
}
