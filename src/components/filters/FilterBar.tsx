'use client';

import { CalendarFilters, EventType } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { EVENT_TYPES, CITIES } from '@/data/mockEvents';
import { FilterSelect } from '@/components/ui/FilterSelect';

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
        value={filters.city}
        onChange={(v) => onChange({ ...filters, city: v })}
        options={[
          { value: 'all', label: 'All Cities' },
          ...CITIES.map((c) => ({ value: c, label: c })),
        ]}
      />
      <FilterSelect
        value={filters.type}
        onChange={(v) => onChange({ ...filters, type: v as EventType | 'all' })}
        options={ALL_TYPES}
      />
    </div>
  );
}
