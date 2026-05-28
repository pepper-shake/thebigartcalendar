'use client';

import { useRef, useEffect } from 'react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  eventDates: string[]; // YYYY-MM-DD, already filtered & sorted
  selectedDate: string | null;
  onChange: (date: string) => void;
}

export default function DateStrip({ eventDates, selectedDate, onChange }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active date into view when it changes
  useEffect(() => {
    if (activeRef.current && stripRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  if (eventDates.length === 0) {
    return (
      <div className="flex-none h-14 flex items-center px-6 border-b border-zinc-200 text-sm text-zinc-400">
        No events this month
      </div>
    );
  }

  return (
    <div
      ref={stripRef}
      className="flex-none flex items-center gap-8 overflow-x-auto border-b border-zinc-200 px-6 h-14 scrollbar-hide"
    >
      {eventDates.map((dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayName = DAY_NAMES[date.getDay()];
        const isActive = dateStr === selectedDate;

        return (
          <button
            key={dateStr}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(dateStr)}
              style={{
              fontFamily: 'var(--font-oxygen)',
              fontWeight: 300,
              fontSize: '18px',
            }}
            className={`flex-none flex items-baseline gap-1.5 whitespace-nowrap transition-colors ${
              isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <span className={isActive ? 'font-bold' : ''}>{d}</span>
            <span>{dayName}</span>
          </button>
        );
      })}
    </div>
  );
}
