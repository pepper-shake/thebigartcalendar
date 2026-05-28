'use client';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  month: number; // 0-indexed
  onChange: (m: number) => void;
}

export default function MonthStrip({ month, onChange }: Props) {
  return (
    <div className="flex-none flex items-center border-t border-b border-zinc-200 h-[84px]">
      {MONTHS.map((name, i) => {
        const isActive = i === month;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              fontFamily: 'var(--font-oxygen)',
              fontWeight: 300,
              fontSize: '24px',
            }}
            className={`flex-1 h-full flex items-center justify-center transition-colors relative ${
              isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {name}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-900" />
            )}
          </button>
        );
      })}
    </div>
  );
}
