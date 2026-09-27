'use client';

import { CalendarFilters, EventType } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { FilterSelect } from '@/components/ui/FilterSelect';

const EVENT_TYPES: EventType[] = ['gallery', 'performance', 'fair', 'auction', 'workshop'];

/** Type filter options: "All Types" plus only the types that have events. */
export function typeOptions(types: EventType[]): { value: EventType | 'all'; label: string }[] {
  return [
    { value: 'all', label: 'All Types' },
    ...EVENT_TYPES.filter((t) => types.includes(t)).map((t) => ({
      value: t,
      label: eventTypeColors[t].label,
    })),
  ];
}

interface Props {
  filters: CalendarFilters;
  onChange: (f: CalendarFilters) => void;
  cities: string[];
  types: EventType[];
}

export default function FilterBar({ filters, onChange, cities, types }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterSelect
        value={filters.city}
        onChange={(v) => onChange({ ...filters, city: v ?? 'all' })}
        options={[
          { value: 'all', label: 'All Cities' },
          ...cities.map((c) => ({ value: c, label: c })),
        ]}
      />
      <FilterSelect
        value={filters.type}
        onChange={(v) => onChange({ ...filters, type: (v ?? 'all') as EventType | 'all' })}
        options={typeOptions(types)}
      />
    </div>
  );
}
