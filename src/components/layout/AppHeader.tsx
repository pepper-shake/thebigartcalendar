'use client';

import { CalendarFilters, EventType } from '@/types';
import FilterBar from '@/components/filters/FilterBar';
import { FilterSelect } from '@/components/ui/FilterSelect';

interface Props {
  year: number;
  years: number[]; // only years that have events
  onYearChange: (y: number) => void;
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
  cities: string[];
  types: EventType[];
}

export default function AppHeader({ year, years, onYearChange, filters, onFiltersChange, cities, types }: Props) {
  return (
    // Figma "Calendar" 387:2619: place and type left, the year right, 42px
    // under the site header bar and 16px above the month strip.
    <div className="flex-none flex items-center justify-between px-6 pt-[42px] pb-4">
      <FilterBar filters={filters} onChange={onFiltersChange} cities={cities} types={types} />

      <FilterSelect
        value={String(year)}
        onChange={(v) => onYearChange(Number(v ?? year))}
        options={(years.length ? years : [year]).map((y) => ({ value: String(y), label: String(y) }))}
      />
    </div>
  );
}
