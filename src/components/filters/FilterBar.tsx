'use client';

import { CalendarFilters, EventType } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { EVENT_TYPES, CITIES } from '@/data/mockEvents';

interface Props {
  filters: CalendarFilters;
  onChange: (f: CalendarFilters) => void;
}

const ALL_TYPES: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  ...EVENT_TYPES.map((t) => ({ value: t, label: eventTypeColors[t].label })),
];

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterSelect
        value={filters.type}
        onChange={(v) => onChange({ ...filters, type: v as EventType | 'all' })}
        options={ALL_TYPES}
      />
      <FilterSelect
        value={filters.city}
        onChange={(v) => onChange({ ...filters, city: v })}
        options={[
          { value: 'all', label: 'All Cities' },
          ...CITIES.map((c) => ({ value: c, label: c })),
        ]}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const isActive = value !== 'all';
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-xs font-medium rounded-full pr-6 pl-3 py-1.5 border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-300 ${
          isActive
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${
          isActive ? 'text-white' : 'text-zinc-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
