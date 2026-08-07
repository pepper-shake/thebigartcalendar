'use client';

import { useRef, useEffect } from 'react';
import { springScrollTo } from '@/lib/springScroll';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  eventDates: string[];
  selectedDate: string | null;
  onChange: (date: string) => void;
  fullDayNames?: boolean;
}

export default function DateStrip({ eventDates, selectedDate, onChange, fullDayNames = false }: Props) {
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
        className="flex-none h-14 flex items-center px-6 border-b border-[#b1b1b1]"
        style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18, color: '#a1a1aa' }}
      >
        No events this month
      </div>
    );
  }

  return (
    <div
      ref={stripRef}
      className={`flex-none flex items-center gap-8 border-b border-[#b1b1b1] px-6 h-14 scrollbar-hide ${fullDayNames ? 'overflow-x-auto' : 'justify-center overflow-x-auto'}`}
    >
      {eventDates.map((dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayShort = fullDayNames ? DAY_FULL[date.getDay()] : DAY_SHORT[date.getDay()];
        const isActive = dateStr === selectedDate;

        return (
          <button
            key={dateStr}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(dateStr)}
            aria-current={isActive ? 'date' : undefined}
            className="flex-none flex items-baseline gap-1.5 whitespace-nowrap transition-all"
            style={{
              fontFamily: 'var(--font-oxygen)',
              fontWeight: isActive ? 700 : 300,
              fontSize: 18,
              color: '#000000',
              paddingBottom: 2,
              borderBottom: `2px solid ${isActive ? '#000000' : 'transparent'}`,
            }}
          >
            <span>{d}</span>
            <span>{dayShort}</span>
          </button>
        );
      })}
    </div>
  );
}
