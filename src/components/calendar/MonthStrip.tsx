'use client';

import { useRef, useEffect } from 'react';
import { springScrollTo } from '@/lib/springScroll';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  month: number; // 0-indexed
  onChange: (m: number) => void;
  scrollable?: boolean;
}

export default function MonthStrip({ month, onChange, scrollable = false }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const active = activeRef.current;
    if (!strip || !active || !scrollable) return;
    cancelRef.current?.();
    const target = active.offsetLeft - strip.offsetWidth / 2 + active.offsetWidth / 2;
    cancelRef.current = springScrollTo(strip, target);
    return () => cancelRef.current?.();
  }, [month, scrollable]);

  return (
    <div
      ref={stripRef}
      className={`flex-none flex items-center border-t border-b border-[#b1b1b1] h-[84px] ${
        scrollable ? 'overflow-x-auto scrollbar-hide gap-[44px] px-6' : 'justify-between px-[120px]'
      }`}
    >
      {MONTHS.map((name, i) => {
        const isActive = i === month;
        return (
          <button
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(i)}
            aria-current={isActive ? 'true' : undefined}
            className="flex-none transition-all"
            style={{
              fontFamily: 'var(--font-oxygen)',
              fontWeight: isActive ? 700 : 300,
              fontSize: 24,
              color: '#000000',
              paddingBottom: 2,
              borderBottom: `2px solid ${isActive ? '#000000' : 'transparent'}`,
            }}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
