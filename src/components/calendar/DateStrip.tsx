'use client';

import { useRef, useEffect } from 'react';
import { springScrollTo } from '@/lib/springScroll';

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  eventDates: string[];
  selectedDate: string | null;
  onChange: (date: string) => void;
  /** Mobile: left-aligned scrolling strip (desktop centres the days when they
   *  fit; `justify-center-safe` falls back to start-aligned when they overflow,
   *  so the 1st of the month stays scrollable-to). */
  scrollable?: boolean;
}

export default function DateStrip({ eventDates, selectedDate, onChange, scrollable = false }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const active = activeRef.current;
    if (!strip || !active) return;
    cancelRef.current?.();
    const target = active.offsetLeft - strip.offsetWidth / 2 + active.offsetWidth / 2;
    cancelRef.current = springScrollTo(strip, target);
    return () => cancelRef.current?.();
  }, [selectedDate]);

  if (eventDates.length === 0) {
    return (
      <div
        className="flex-none h-[66px] flex items-center justify-center px-6 border-b border-rule text-ink/60 italic"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18 }}
      >
        No events this month
      </div>
    );
  }

  return (
    <div
      ref={stripRef}
      className={`flex-none flex items-center gap-[44px] border-b border-rule px-6 h-[66px] scrollbar-hide overflow-x-auto ${scrollable ? '' : 'justify-center-safe'}`}
    >
      {eventDates.map((dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayName = DAY_FULL[date.getDay()];
        const isActive = dateStr === selectedDate;

        return (
          <button
            key={dateStr}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(dateStr)}
            aria-current={isActive ? 'date' : undefined}
            className="flex-none flex items-baseline gap-1.5 whitespace-nowrap text-ink transition-opacity hover:opacity-60"
            // Figma (283:2080): Newsreader Light 18px, full day names; the
            // selected day is italic semibold instead of underlined.
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: isActive ? 600 : 300,
              fontStyle: isActive ? 'italic' : 'normal',
              fontSize: 18,
              lineHeight: '18px',
            }}
          >
            <span>{d}</span>
            <span>{dayName}</span>
          </button>
        );
      })}
    </div>
  );
}
